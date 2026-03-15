import { auth } from "@budgetbee/core/auth";
import { redis } from "@budgetbee/core/redis";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SYNCABLE_TABLES = [
	"transactions",
	"categories",
	"subscriptions",
	"dashboard_views",
] as const;

type NotifyBody = {
	table: string;
	operation: string;
	record_ids: string[];
	origin_client_id: string;
};

export async function POST(req: NextRequest) {
	const hdrs = await headers();
	const session = await auth.api.getSession({ headers: hdrs });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: NotifyBody;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const { table, operation, record_ids, origin_client_id } = body;

	if (
		!table ||
		!SYNCABLE_TABLES.includes(table as (typeof SYNCABLE_TABLES)[number])
	) {
		return NextResponse.json({ error: "Invalid table" }, { status: 400 });
	}

	if (!Array.isArray(record_ids) || record_ids.length === 0) {
		return NextResponse.json(
			{ error: "record_ids must be a non-empty array" },
			{ status: 400 },
		);
	}

	// Determine scope for the pub/sub channel
	const orgId = (session.session as any).activeOrganizationId as
		| string
		| undefined;
	const scope = orgId ? "org" : "user";
	const scopeId = orgId ?? session.user.id;

	const channel = `sync:${scope}:${scopeId}:${table}`;
	const payload = JSON.stringify({
		table,
		operation,
		record_ids,
		origin_client_id,
	});

	// Fire-and-forget publish
	redis.publish(channel, payload).catch(console.error);

	return NextResponse.json({ ok: true });
}
