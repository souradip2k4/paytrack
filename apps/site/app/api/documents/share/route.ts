import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import {
	MAX_SHARE_BYTES,
	SHARE_TTL_SECONDS,
	sharePayloadSchema,
} from "@/lib/documents/schema";
import {
	getMarketingRedis,
	rateKey,
	shareKey,
} from "@/lib/documents/share-server";

export const runtime = "nodejs";

const SLUG_PATTERN = /^[A-Za-z0-9_-]{8,16}$/;
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 10;

function clientIp(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
	const real = request.headers.get("x-real-ip");
	if (real) return real.trim();
	return "unknown";
}

function siteUrl(): string {
	const base =
		process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.budget-bee.app";
	return base.replace(/\/+$/, "");
}

export async function POST(request: Request) {
	const contentLength = Number(request.headers.get("content-length") ?? "0");
	if (contentLength > MAX_SHARE_BYTES) {
		return NextResponse.json(
			{ error: "Document is too large (limit 1.5MB)." },
			{ status: 413 },
		);
	}

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return NextResponse.json(
			{ error: "Invalid JSON body." },
			{ status: 400 },
		);
	}

	const docCandidate =
		raw && typeof raw === "object" && "doc" in raw ?
			(raw as { doc: unknown }).doc
		:	raw;
	const parsed = sharePayloadSchema.safeParse(docCandidate);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "Document failed validation.",
				issues: parsed.error.issues.slice(0, 5),
			},
			{ status: 400 },
		);
	}
	const doc = parsed.data;

	const serialized = JSON.stringify(doc);
	if (Buffer.byteLength(serialized, "utf8") > MAX_SHARE_BYTES) {
		return NextResponse.json(
			{ error: "Document is too large (limit 1.5MB)." },
			{ status: 413 },
		);
	}

	let redis;
	try {
		redis = getMarketingRedis();
	} catch (err) {
		console.error("Marketing redis unavailable", err);
		return NextResponse.json(
			{ error: "Share is temporarily unavailable." },
			{ status: 503 },
		);
	}

	const ip = clientIp(request);
	if (ip !== "unknown") {
		const rkey = rateKey(ip);
		try {
			const count = await redis.incr(rkey);
			if (count === 1) await redis.expire(rkey, RATE_LIMIT_WINDOW);
			if (count > RATE_LIMIT_MAX) {
				return NextResponse.json(
					{ error: "Too many share requests. Try again shortly." },
					{ status: 429 },
				);
			}
		} catch (err) {
			console.warn("Rate limit redis error", err);
		}
	}

	const slug = nanoid(10);
	const payload = JSON.stringify({
		doc,
		createdAt: new Date().toISOString(),
	});

	try {
		await redis.set(shareKey(slug), payload, "EX", SHARE_TTL_SECONDS);
	} catch (err) {
		console.error("Failed to store share payload", err);
		return NextResponse.json(
			{ error: "Could not save share." },
			{ status: 500 },
		);
	}

	const expiresAt = new Date(
		Date.now() + SHARE_TTL_SECONDS * 1000,
	).toISOString();
	return NextResponse.json({
		slug,
		url: `${siteUrl()}/s/${slug}`,
		expiresAt,
	});
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const slug = searchParams.get("slug");
	if (!slug || !SLUG_PATTERN.test(slug)) {
		return NextResponse.json(
			{ error: "Invalid slug." },
			{ status: 400 },
		);
	}

	let redis;
	try {
		redis = getMarketingRedis();
	} catch (err) {
		console.error("Marketing redis unavailable", err);
		return NextResponse.json(
			{ error: "Share is unavailable." },
			{ status: 503 },
		);
	}

	const raw = await redis.get(shareKey(slug));
	if (!raw) {
		return NextResponse.json(
			{ error: "Link expired or not found." },
			{ status: 404 },
		);
	}
	try {
		const parsed = JSON.parse(raw);
		await redis.expire(shareKey(slug), SHARE_TTL_SECONDS);
		return NextResponse.json(parsed);
	} catch {
		return NextResponse.json(
			{ error: "Corrupt share payload." },
			{ status: 500 },
		);
	}
}
