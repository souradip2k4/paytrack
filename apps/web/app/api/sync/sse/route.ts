import { auth } from "@budgetbee/core/auth";
import { Redis } from "ioredis";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

const SYNCABLE_TABLES = [
	"transactions",
	"categories",
	"subscriptions",
	"dashboard_views",
] as const;

const PING_INTERVAL_MS = 25_000; // below Vercel's 30s timeout

const MAX_CONNECTIONS_PER_USER = 5;
const _connectionCounts = new Map<string, number>();

function getRedisUrl(): string {
	if (!process.env.REDIS_URL) throw new Error("REDIS_URL is not set");
	return process.env.REDIS_URL;
}

export async function GET(_req: NextRequest) {
	const hdrs = await headers();
	const session = await auth.api.getSession({ headers: hdrs });
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const userId = session.user.id;

	// Rate limit: max connections per user
	const currentCount = _connectionCounts.get(userId) ?? 0;
	if (currentCount >= MAX_CONNECTIONS_PER_USER) {
		return new Response("Too many SSE connections", { status: 429 });
	}
	_connectionCounts.set(userId, currentCount + 1);

	const orgId = (session.session as any).activeOrganizationId as
		| string
		| undefined;
	const scope = orgId ? "org" : "user";
	const scopeId = orgId ?? session.user.id;

	// Build channel list for all syncable tables
	const channels = SYNCABLE_TABLES.map(
		table => `sync:${scope}:${scopeId}:${table}`,
	);

	// Create a dedicated subscriber — cannot reuse the singleton (SUBSCRIBE blocks connection)
	const subscriber = new Redis(getRedisUrl());

	let pingInterval: ReturnType<typeof setInterval> | null = null;

	const cleanup = () => {
		if (pingInterval) {
			clearInterval(pingInterval);
			pingInterval = null;
		}
		subscriber.unsubscribe(...channels).catch(console.error);
		subscriber.quit().catch(console.error);
		const count = _connectionCounts.get(userId) ?? 1;
		if (count <= 1) {
			_connectionCounts.delete(userId);
		} else {
			_connectionCounts.set(userId, count - 1);
		}
	};

	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();

			const send = (event: string, data: string) => {
				controller.enqueue(
					encoder.encode(`event: ${event}\ndata: ${data}\n\n`),
				);
			};

			subscriber.subscribe(...channels, err => {
				if (err) {
					console.error("[sync/sse] subscribe error:", err);
					cleanup();
					controller.close();
				}
			});

			subscriber.on("message", (_channel: string, message: string) => {
				send("sync", message);
			});

			// Keepalive ping
			pingInterval = setInterval(() => {
				send("ping", "{}");
			}, PING_INTERVAL_MS);
		},
		cancel() {
			cleanup();
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"X-Accel-Buffering": "no",
			Connection: "keep-alive",
		},
	});
}
