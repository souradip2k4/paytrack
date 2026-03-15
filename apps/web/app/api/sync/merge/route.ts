import { auth } from "@budgetbee/core/auth";
import { db } from "@budgetbee/core/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type SyncableTable =
	| "transactions"
	| "categories"
	| "subscriptions"
	| "dashboard_views";

const SYNCABLE_TABLES: SyncableTable[] = [
	"transactions",
	"categories",
	"subscriptions",
	"dashboard_views",
];

// Allowed columns per table — prevents injecting arbitrary columns
const ALLOWED_COLUMNS: Record<SyncableTable, Set<string>> = {
	transactions: new Set([
		"id",
		"amount",
		"currency",
		"user_id",
		"organization_id",
		"external_id",
		"category_id",
		"reference_no",
		"name",
		"description",
		"status",
		"source",
		"metadata",
		"transaction_date",
		"created_at",
		"updated_at",
		"deleted_at",
	]),
	categories: new Set([
		"id",
		"name",
		"description",
		"color",
		"user_id",
		"organization_id",
		"created_at",
		"updated_at",
		"deleted_at",
	]),
	subscriptions: new Set([
		"id",
		"amount",
		"title",
		"description",
		"logo_url",
		"period",
		"interval_in_days",
		"category_id",
		"user_id",
		"organization_id",
		"created_at",
		"updated_at",
		"deleted_at",
	]),
	dashboard_views: new Set([
		"id",
		"name",
		"user_id",
		"organization_id",
		"widgets",
		"is_default",
		"created_at",
		"updated_at",
		"deleted_at",
	]),
};

type MergeBody = {
	table: SyncableTable;
	operation: "insert" | "update" | "delete";
	// The record_id is the primary key of the underlying table
	record_id: string;
	patch: Record<string, unknown>;
	idempotency_key: string;
};

export async function POST(req: NextRequest) {
	const hdrs = await headers();
	const session = await auth.api.getSession({ headers: hdrs });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: MergeBody;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 422 });
	}

	const { table, operation, record_id, patch } = body;

	if (!SYNCABLE_TABLES.includes(table)) {
		return NextResponse.json({ error: "Invalid table" }, { status: 422 });
	}

	if (!["insert", "update", "delete"].includes(operation)) {
		return NextResponse.json(
			{ error: "Invalid operation" },
			{ status: 422 },
		);
	}

	if (
		typeof record_id !== "string" ||
		!record_id ||
		record_id.length > 64 ||
		!/^[a-zA-Z0-9_-]+$/.test(record_id)
	) {
		return NextResponse.json(
			{ error: "Invalid record_id" },
			{ status: 400 },
		);
	}

	// Validate patch keys against column allowlist
	const allowed = ALLOWED_COLUMNS[table];
	const invalidKeys = Object.keys(patch).filter(k => !allowed.has(k));
	if (invalidKeys.length > 0) {
		return NextResponse.json(
			{ error: `Disallowed columns: ${invalidKeys.join(", ")}` },
			{ status: 400 },
		);
	}

	// Get JWT for RLS-scoped PostgREST
	const { token } = await auth.api.getToken({ headers: hdrs });
	const client = db(token);

	let result: any = null;
	if (operation === "insert") {
		// Use upsert so retries (after a network failure post-write) are idempotent
		const { data, error } = await client
			.from(table)
			.upsert({ ...patch, id: record_id }, { onConflict: "id" })
			.select()
			.maybeSingle();
		if (error) {
			console.error("[sync/merge] insert error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		result = data;
	} else if (operation === "update") {
		// Only changed fields — PostgREST fires the updated_at trigger server-side
		const { data, error } = await client
			.from(table)
			.update(patch)
			.eq("id", record_id)
			.select()
			.maybeSingle(); // returns null instead of erroring when 0 rows match
		if (error) {
			console.error("[sync/merge] update error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		if (!data) {
			// 0 rows — record not on server yet (insert still in flight) or already deleted.
			// Return null; the client will reconcile on the next pull.
			console.warn(
				`[sync/merge] update matched 0 rows for ${table}:${record_id}`,
			);
		}
		result = data;
	} else {
		// delete → soft delete via deleted_at
		const { data, error } = await client
			.from(table)
			.update({ deleted_at: new Date().toISOString() })
			.eq("id", record_id)
			.select()
			.maybeSingle();
		if (error) {
			console.error("[sync/merge] delete error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		result = data;
	}

	return NextResponse.json({ record: result });
}
