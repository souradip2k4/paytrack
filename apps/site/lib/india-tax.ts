export type TaxRegime = "new" | "old";

export type TaxSlab = {
	upto: number | null;
	rate: number;
};

export const ASSESSMENT_YEAR = "2026-27";
export const FINANCIAL_YEAR = "2025-26";

/** New regime slabs for FY 2025-26 (AY 2026-27) as per Union Budget 2025. */
export const NEW_REGIME_SLABS: TaxSlab[] = [
	{ upto: 400_000, rate: 0 },
	{ upto: 800_000, rate: 0.05 },
	{ upto: 1_200_000, rate: 0.1 },
	{ upto: 1_600_000, rate: 0.15 },
	{ upto: 2_000_000, rate: 0.2 },
	{ upto: 2_400_000, rate: 0.25 },
	{ upto: null, rate: 0.3 },
];

/** Old regime slabs (individuals < 60 years). Unchanged since FY 2020-21. */
export const OLD_REGIME_SLABS: TaxSlab[] = [
	{ upto: 250_000, rate: 0 },
	{ upto: 500_000, rate: 0.05 },
	{ upto: 1_000_000, rate: 0.2 },
	{ upto: null, rate: 0.3 },
];

export const STANDARD_DEDUCTION: Record<TaxRegime, number> = {
	new: 75_000,
	old: 50_000,
};

/** Rebate u/s 87A - taxable income up to cap means zero tax (marginal relief applies in new regime). */
export const REBATE_87A_CAP: Record<TaxRegime, number> = {
	new: 1_200_000,
	old: 500_000,
};

export const CESS_RATE = 0.04;

export const DEDUCTION_LIMITS = {
	sec80C: 150_000,
	sec80CCD1B: 50_000,
	sec80D: 100_000,
	homeLoanInterest: 200_000,
	professionalTax: 2_500,
} as const;

export type OldRegimeDeductions = {
	sec80C?: number;
	sec80CCD1B?: number;
	sec80D?: number;
	homeLoanInterest?: number;
	hraExempt?: number;
	ltaExempt?: number;
	professionalTax?: number;
	otherExempt?: number;
};

export type TaxInputs = {
	grossIncome: number;
	regime: TaxRegime;
	isSalaried: boolean;
	deductions?: OldRegimeDeductions;
};

export type SlabRow = {
	from: number;
	to: number | null;
	rate: number;
	slabIncome: number;
	tax: number;
};

export type TaxResult = {
	grossIncome: number;
	standardDeduction: number;
	otherDeductions: number;
	totalDeductions: number;
	taxableIncome: number;
	slabBreakdown: SlabRow[];
	taxBeforeRebate: number;
	rebate87A: number;
	marginalRelief: number;
	taxAfterRebate: number;
	surchargeRate: number;
	surcharge: number;
	cess: number;
	totalTax: number;
	netIncome: number;
	effectiveRate: number;
};

function getSurchargeRate(income: number, regime: TaxRegime): number {
	if (regime === "new") {
		if (income > 20_000_000) return 0.25;
		if (income > 10_000_000) return 0.15;
		if (income > 5_000_000) return 0.1;
		return 0;
	}
	if (income > 50_000_000) return 0.37;
	if (income > 20_000_000) return 0.25;
	if (income > 10_000_000) return 0.15;
	if (income > 5_000_000) return 0.1;
	return 0;
}

export function computeSlabBreakdown(
	taxableIncome: number,
	slabs: TaxSlab[],
): { rows: SlabRow[]; total: number } {
	const rows: SlabRow[] = [];
	let prev = 0;
	let remaining = taxableIncome;
	let total = 0;
	for (const slab of slabs) {
		if (remaining <= 0) break;
		const upper = slab.upto ?? taxableIncome;
		const slabSize = Math.max(0, Math.min(remaining, upper - prev));
		const tax = slabSize * slab.rate;
		rows.push({
			from: prev,
			to: slab.upto,
			rate: slab.rate,
			slabIncome: slabSize,
			tax,
		});
		total += tax;
		remaining -= slabSize;
		prev = upper;
	}
	return { rows, total };
}

export function sumOldRegimeDeductions(d: OldRegimeDeductions): number {
	return (
		Math.min(d.sec80C ?? 0, DEDUCTION_LIMITS.sec80C) +
		Math.min(d.sec80CCD1B ?? 0, DEDUCTION_LIMITS.sec80CCD1B) +
		Math.min(d.sec80D ?? 0, DEDUCTION_LIMITS.sec80D) +
		Math.min(d.homeLoanInterest ?? 0, DEDUCTION_LIMITS.homeLoanInterest) +
		Math.min(d.professionalTax ?? 0, DEDUCTION_LIMITS.professionalTax) +
		(d.hraExempt ?? 0) +
		(d.ltaExempt ?? 0) +
		(d.otherExempt ?? 0)
	);
}

export function computeIndiaTax(inputs: TaxInputs): TaxResult {
	const { grossIncome, regime, isSalaried } = inputs;
	const standardDeduction = isSalaried ? STANDARD_DEDUCTION[regime] : 0;

	const otherDeductions =
		regime === "old" && inputs.deductions ?
			sumOldRegimeDeductions(inputs.deductions)
		:	0;

	const totalDeductions = standardDeduction + otherDeductions;
	const taxableIncome = Math.max(0, grossIncome - totalDeductions);

	const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
	const { rows, total: taxBeforeRebate } = computeSlabBreakdown(
		taxableIncome,
		slabs,
	);

	let rebate87A = 0;
	let marginalRelief = 0;
	let taxAfterRebate = taxBeforeRebate;
	const rebateCap = REBATE_87A_CAP[regime];

	if (taxableIncome <= rebateCap) {
		rebate87A = taxBeforeRebate;
		taxAfterRebate = 0;
	} else if (regime === "new") {
		const excessOverCap = taxableIncome - rebateCap;
		if (taxBeforeRebate > excessOverCap) {
			marginalRelief = taxBeforeRebate - excessOverCap;
			taxAfterRebate = excessOverCap;
		}
	}

	const surchargeRate = getSurchargeRate(taxableIncome, regime);
	const surcharge = taxAfterRebate * surchargeRate;
	const taxPlusSurcharge = taxAfterRebate + surcharge;
	const cess = taxPlusSurcharge * CESS_RATE;
	const totalTax = taxPlusSurcharge + cess;
	const netIncome = grossIncome - totalTax;
	const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;

	return {
		grossIncome,
		standardDeduction,
		otherDeductions,
		totalDeductions,
		taxableIncome,
		slabBreakdown: rows,
		taxBeforeRebate,
		rebate87A,
		marginalRelief,
		taxAfterRebate,
		surchargeRate,
		surcharge,
		cess,
		totalTax,
		netIncome,
		effectiveRate,
	};
}

export function formatINR(amount: number, maxDigits = 0): string {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: maxDigits,
	}).format(
		Math.round(amount * Math.pow(10, maxDigits)) / Math.pow(10, maxDigits),
	);
}

export function formatPercent(value: number, digits = 2): string {
	return `${(value * 100).toFixed(digits)}%`;
}
