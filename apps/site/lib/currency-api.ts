import { redis } from "@budgetbee/core/redis";
import {
	EXCHANGE_RATE_API,
	FRANKFURTER_API,
	FRANKFURTER_CURRENCIES,
	getCurrency,
} from "./currencies";

const CURRENCY_API_CACHE_TTL_SECONDS = 300;
const MAX_HISTORICAL_DAYS = 1825;

export type LiveRateResponse = {
	rates: Record<string, number>;
	date: string;
};

export type HistoricalRateResponse = {
	rates: Record<string, Record<string, number>>;
};

export function normalizeCurrencyCode(code: string | null): string | null {
	if (!code) return null;

	const normalized = code.toUpperCase();
	return getCurrency(normalized) ? normalized : null;
}

export function normalizeHistoricalDays(days: string | null): number | null {
	if (!days) return 30;

	const parsed = Number.parseInt(days, 10);
	if (
		!Number.isFinite(parsed) ||
		parsed <= 0 ||
		parsed > MAX_HISTORICAL_DAYS
	) {
		return null;
	}

	return parsed;
}

export function supportsHistoricalRates(code: string) {
	return FRANKFURTER_CURRENCIES.has(code);
}

async function fetchJson<T>(url: string): Promise<T> {
	const response = await fetch(url, {
		cache: "no-store",
		headers: {
			accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch currency data: ${response.status}`);
	}

	return response.json() as Promise<T>;
}

async function getCachedCurrencyResponse<T>(
	cacheKey: string,
	fetcher: () => Promise<T>,
): Promise<T> {
	try {
		const cached = await redis.get(cacheKey);
		if (cached) return JSON.parse(cached) as T;
	} catch (error) {
		console.warn("Currency cache read failed", error);
	}

	const data = await fetcher();

	try {
		await redis.setex(
			cacheKey,
			CURRENCY_API_CACHE_TTL_SECONDS,
			JSON.stringify(data),
		);
	} catch (error) {
		console.warn("Currency cache write failed", error);
	}

	return data;
}

function getHistoricalDateRange(days: number) {
	// Frankfurter ranges are inclusive, so subtract one fewer day to make the
	// requested window align with labels like 7D and 30D.
	const end = new Date();
	const endDate = new Date(
		Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
	);
	const startDate = new Date(endDate);
	startDate.setUTCDate(startDate.getUTCDate() - Math.max(days - 1, 0));

	return {
		start: startDate.toISOString().split("T")[0]!,
		end: endDate.toISOString().split("T")[0]!,
	};
}

export async function getLiveRates(base: string) {
	return getCachedCurrencyResponse<LiveRateResponse>(
		`currency:spot:${base}`,
		() => fetchJson<LiveRateResponse>(`${EXCHANGE_RATE_API}/${base}`),
	);
}

export async function getHistoricalRates(
	base: string,
	days: number,
	target?: string,
) {
	const { start, end } = getHistoricalDateRange(days);
	const query = target ? `?from=${base}&to=${target}` : `?from=${base}`;
	const cacheKey =
		target ?
			`currency:history:${base}:to:${target}:days:${days}`
		:	`currency:history:${base}:days:${days}`;

	return getCachedCurrencyResponse<HistoricalRateResponse>(cacheKey, () =>
		fetchJson<HistoricalRateResponse>(
			`${FRANKFURTER_API}/${start}..${end}${query}`,
		),
	);
}
