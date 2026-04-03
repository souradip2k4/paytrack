"use client";

import { currencies } from "@/lib/currencies";
import { parseAsStringLiteral, useQueryState, useQueryStates } from "nuqs";
import * as React from "react";

export const HISTORICAL_PERIODS = [
	{ label: "7D", key: "7d", days: 7 },
	{ label: "30D", key: "30d", days: 30 },
	{ label: "90D", key: "90d", days: 90 },
	{ label: "1Y", key: "1y", days: 365 },
	{ label: "5Y", key: "5y", days: 1825 },
] as const;

export type HistoricalPeriodKey = (typeof HISTORICAL_PERIODS)[number]["key"];

const currencyCodes = currencies.map(currency => currency.code);
const historicalPeriodKeys = HISTORICAL_PERIODS.map(period => period.key);

export function getHistoricalPeriodDays(period: HistoricalPeriodKey): number {
	return HISTORICAL_PERIODS.find(item => item.key === period)?.days ?? 30;
}

export function getHistoricalPeriodLabel(period: HistoricalPeriodKey): string {
	return HISTORICAL_PERIODS.find(item => item.key === period)?.label ?? "30D";
}

export function useBaseCurrencyQueryState(defaultBase = "USD") {
	const parser = React.useMemo(
		() =>
			parseAsStringLiteral(currencyCodes)
				.withDefault(defaultBase)
				.withOptions({
					clearOnDefault: false,
					history: "replace",
				}),
		[defaultBase],
	);

	return useQueryState("c", parser);
}

export function useHistoricalPeriodQueryState(
	defaultPeriod: HistoricalPeriodKey = "30d",
) {
	const parser = React.useMemo(
		() =>
			parseAsStringLiteral(historicalPeriodKeys)
				.withDefault(defaultPeriod)
				.withOptions({
					clearOnDefault: false,
					history: "replace",
				}),
		[defaultPeriod],
	);

	return useQueryState("period", parser);
}

export function useCurrencyPairQueryState(
	defaultFrom = "USD",
	defaultTo = "INR",
) {
	const parsers = React.useMemo(() => {
		const parser = parseAsStringLiteral(currencyCodes);

		return {
			from: parser.withDefault(defaultFrom),
			to: parser.withDefault(defaultTo),
		};
	}, [defaultFrom, defaultTo]);

	return useQueryStates(parsers, {
		history: "replace",
	});
}
