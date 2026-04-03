import {
	getHistoricalRates,
	normalizeCurrencyCode,
	normalizeHistoricalDays,
	supportsHistoricalRates,
} from "@/lib/currency-api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const base = normalizeCurrencyCode(searchParams.get("base"));
	const target = normalizeCurrencyCode(searchParams.get("target"));
	const days = normalizeHistoricalDays(searchParams.get("days"));

	if (!base || days === null) {
		return NextResponse.json(
			{ error: "Invalid historical-rate parameters" },
			{ status: 400 },
		);
	}

	if (!supportsHistoricalRates(base)) {
		return NextResponse.json(
			{ error: "Historical data is unavailable for this base currency" },
			{ status: 400 },
		);
	}

	if (target && !supportsHistoricalRates(target)) {
		return NextResponse.json(
			{ error: "Historical data is unavailable for this target currency" },
			{ status: 400 },
		);
	}

	try {
		const data = await getHistoricalRates(base, days, target ?? undefined);
		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to fetch historical currency rates", error);
		return NextResponse.json(
			{ error: "Failed to fetch historical rates" },
			{ status: 502 },
		);
	}
}
