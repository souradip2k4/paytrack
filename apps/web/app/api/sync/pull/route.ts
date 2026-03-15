import { auth } from "@budgetbee/core/auth";
import { db } from "@budgetbee/core/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SYNCABLE_TABLES = [
	"transactions",
	"categories",
	"subscriptions",
	"dashboard_views",
] as const;

type SyncableTable = (typeof SYNCABLE_TABLES)[number];

export async function GET(req: NextRequest) {
	const hdrs = await headers();
	const session = await auth.api.getSession({ headers: hdrs });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = req.nextUrl;
	const table = searchParams.get("table") as SyncableTable | null;
	const since = searchParams.get("since");
	const cursorStr = searchParams.get("cursor") ?? "0";
	const limitStr = searchParams.get("limit") ?? "500";

	if (!table || !SYNCABLE_TABLES.includes(table)) {
		return NextResponse.json({ error: "Invalid table" }, { status: 400 });
	}

	const cursor = Math.max(0, parseInt(cursorStr, 10) || 0);
	const limit = Math.min(500, Math.max(1, parseInt(limitStr, 10) || 500));

	// Get JWT for RLS-scoped PostgREST query
	const { token } = await auth.api.getToken({ headers: hdrs });

	const client = db(token);

	// Build query — include soft-deleted records so clients can tombstone them
	let query = client
		.from(table)
		.select("*")
		.order("updated_at", { ascending: true })
		.range(cursor, cursor + limit - 1);

	if (since) {
		query = query.gte("updated_at", since);
	}

	const { data, error } = await query;

	if (error) {
		console.error(`[sync/pull] error querying ${table}:`, error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const records = data ?? [];
	const hasMore = records.length === limit;
	const pulledAt = new Date().toISOString();

	return NextResponse.json({
		table,
		records,
		has_more: hasMore,
		next_cursor: cursor + records.length,
		pulled_at: pulledAt,
		total_count: records.length,
	});
}
