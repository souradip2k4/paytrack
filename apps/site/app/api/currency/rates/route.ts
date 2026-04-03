import {
	getLiveRates,
	normalizeCurrencyCode,
} from "@/lib/currency-api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const base = normalizeCurrencyCode(searchParams.get("base"));

	if (!base) {
		return NextResponse.json(
			{ error: "Invalid base currency" },
			{ status: 400 },
		);
	}

	try {
		const data = await getLiveRates(base);
		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to fetch live currency rates", error);
		return NextResponse.json(
			{ error: "Failed to fetch exchange rates" },
			{ status: 502 },
		);
	}
}
