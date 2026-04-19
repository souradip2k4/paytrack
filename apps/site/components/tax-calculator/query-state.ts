"use client";

import type { TaxRegime } from "@/lib/india-tax";
import { parseAsFloat, parseAsStringLiteral, useQueryState } from "nuqs";
import * as React from "react";

const regimes: TaxRegime[] = ["new", "old"];

export function useRegimeQueryState(defaultRegime: TaxRegime = "new") {
	const parser = React.useMemo(
		() =>
			parseAsStringLiteral(regimes)
				.withDefault(defaultRegime)
				.withOptions({ clearOnDefault: false, history: "replace" }),
		[defaultRegime],
	);
	return useQueryState("regime", parser);
}

export function useIncomeQueryState(defaultIncome = 1_500_000) {
	const parser = React.useMemo(
		() =>
			parseAsFloat
				.withDefault(defaultIncome)
				.withOptions({ clearOnDefault: false, history: "replace" }),
		[defaultIncome],
	);
	return useQueryState("income", parser);
}
