"use client";

import {
	computeIndiaTax,
	DEDUCTION_LIMITS,
	formatINR,
	formatPercent,
	NEW_REGIME_SLABS,
	OLD_REGIME_SLABS,
	STANDARD_DEDUCTION,
	type OldRegimeDeductions,
	type SlabRow,
	type TaxRegime,
	type TaxResult,
} from "@/lib/india-tax";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { Checkbox } from "@budgetbee/ui/core/checkbox";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@budgetbee/ui/core/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@budgetbee/ui/core/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@budgetbee/ui/core/tooltip";
import { Info } from "lucide-react";
import * as React from "react";
import { useIncomeQueryState, useRegimeQueryState } from "./query-state";

const INCOME_PRESETS = [500_000, 1_000_000, 1_500_000, 2_500_000, 5_000_000];

type DeductionField = {
	key: keyof OldRegimeDeductions;
	label: string;
	hint: string;
	max?: number;
};

const DEDUCTION_FIELDS: DeductionField[] = [
	{
		key: "sec80C",
		label: "Section 80C",
		hint: `EPF, PPF, ELSS, LIC premiums, tuition fees, home loan principal, 5-yr tax-saver FD. Combined cap ${formatINR(DEDUCTION_LIMITS.sec80C)} per year.`,
		max: DEDUCTION_LIMITS.sec80C,
	},
	{
		key: "sec80CCD1B",
		label: "Section 80CCD(1B) · NPS",
		hint: `Self-contribution to NPS Tier-1. Extra ${formatINR(DEDUCTION_LIMITS.sec80CCD1B)} on top of 80C, making total retirement-savings deduction up to ${formatINR(200_000)}.`,
		max: DEDUCTION_LIMITS.sec80CCD1B,
	},
	{
		key: "sec80D",
		label: "Section 80D · Health insurance",
		hint: `Premiums for self + family (₹25k, or ₹50k if 60+) plus parents (₹25k, or ₹50k if 60+). Combined cap ${formatINR(DEDUCTION_LIMITS.sec80D)}. Includes ₹5k preventive check-up.`,
		max: DEDUCTION_LIMITS.sec80D,
	},
	{
		key: "homeLoanInterest",
		label: "Section 24(b) · Home loan interest",
		hint: `Interest on home loan for self-occupied property. Cap ${formatINR(DEDUCTION_LIMITS.homeLoanInterest)}. Let-out property has no cap but loss set-off is limited to ₹2L.`,
		max: DEDUCTION_LIMITS.homeLoanInterest,
	},
	{
		key: "hraExempt",
		label: "HRA exemption",
		hint: "Exempt HRA = min of (a) HRA received, (b) 50% of basic if metro else 40%, (c) rent paid − 10% of basic. Enter the computed exempt amount - not total HRA.",
	},
	{
		key: "ltaExempt",
		label: "LTA exemption",
		hint: "Leave Travel Allowance for domestic travel. Exempt up to actual travel cost by shortest route. Claimable twice in a 4-year block (current block 2022-25).",
	},
	{
		key: "professionalTax",
		label: "Professional tax",
		hint: `State-level tax on salary. Capped at ${formatINR(DEDUCTION_LIMITS.professionalTax)} per year under Article 276(2). Usually deducted by employer.`,
		max: DEDUCTION_LIMITS.professionalTax,
	},
	{
		key: "otherExempt",
		label: "Other exemptions",
		hint: "Conveyance allowance (disabled employees), uniform allowance, books/research allowance, gratuity, leave encashment, transport allowance, etc.",
	},
];

type CalculatorProps = {
	defaultRegime?: TaxRegime;
	defaultIncome?: number;
};

export function IndiaTaxCalculator({
	defaultRegime = "new",
	defaultIncome = 1_500_000,
}: CalculatorProps) {
	const [regime, setRegime] = useRegimeQueryState(defaultRegime);
	const [income, setIncome] = useIncomeQueryState(defaultIncome);
	const [incomeInput, setIncomeInput] = React.useState(String(income));
	const [isSalaried, setIsSalaried] = React.useState(true);
	const [deductions, setDeductions] = React.useState<OldRegimeDeductions>({
		sec80C: 150_000,
		sec80D: 25_000,
		sec80CCD1B: 0,
		homeLoanInterest: 0,
		hraExempt: 0,
		ltaExempt: 0,
		professionalTax: 2_500,
		otherExempt: 0,
	});

	React.useEffect(() => {
		setIncomeInput(String(income));
	}, [income]);

	const rawIncome = Number.parseFloat(incomeInput);
	const parsedIncome =
		Number.isFinite(rawIncome) ? Math.max(0, rawIncome) : 0;

	React.useEffect(() => {
		const timer = setTimeout(() => {
			if (parsedIncome !== income) setIncome(parsedIncome);
		}, 250);
		return () => clearTimeout(timer);
	}, [parsedIncome, income, setIncome]);

	const result = React.useMemo(
		() =>
			computeIndiaTax({
				grossIncome: parsedIncome,
				regime,
				isSalaried,
				deductions,
			}),
		[parsedIncome, regime, isSalaried, deductions],
	);

	const comparison = React.useMemo(
		() => ({
			new: computeIndiaTax({
				grossIncome: parsedIncome,
				regime: "new",
				isSalaried,
				deductions,
			}),
			old: computeIndiaTax({
				grossIncome: parsedIncome,
				regime: "old",
				isSalaried,
				deductions,
			}),
		}),
		[parsedIncome, isSalaried, deductions],
	);

	const recommended: TaxRegime =
		comparison.new.totalTax <= comparison.old.totalTax ? "new" : "old";

	return (
		<div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
			<Card className="border-border bg-card w-full">
				<CardContent className="space-y-6">
					<div className="space-y-2 border-b pb-6">
						<p className="text-muted-foreground text-xs uppercase">
							Income tax calculator · India · FY 2025-26 (AY
							2026-27)
						</p>
						<p className="text-sm">
							Enter annual gross income and pick a regime. Figures
							reflect Budget 2025 slabs, ₹75,000 standard
							deduction (new regime), rebate u/s 87A, surcharge,
							and 4% health &amp; education cess.
						</p>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="tax-income"
								className="text-muted-foreground text-sm font-medium">
								Annual gross income (₹)
							</Label>
							<Input
								id="tax-income"
								type="number"
								value={incomeInput}
								onChange={e => setIncomeInput(e.target.value)}
								placeholder="Enter income"
								inputMode="decimal"
								min="0"
								step="1000"
							/>
							<div className="flex flex-wrap gap-2 pt-1">
								{INCOME_PRESETS.map(preset => (
									<Button
										key={preset}
										type="button"
										variant={
											parsedIncome === preset ?
												"secondary"
											:	"outline"
										}
										size="sm"
										onClick={() =>
											setIncomeInput(String(preset))
										}
										className="border-input rounded-full border">
										{formatINR(preset)}
									</Button>
								))}
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Checkbox
								id="is-salaried"
								checked={isSalaried}
								onCheckedChange={v => setIsSalaried(v === true)}
							/>
							<Label
								htmlFor="is-salaried"
								className="text-sm font-medium">
								Salaried / pensioner (apply standard deduction
								of {formatINR(STANDARD_DEDUCTION[regime])})
							</Label>
						</div>
					</div>

					<Tabs
						value={regime}
						defaultValue="new"
						onValueChange={v => setRegime(v as TaxRegime)}>
						<TabsList className="gap-1 bg-transparent">
							<TabsTrigger
								value="new"
								className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none">
								New regime
							</TabsTrigger>
							<TabsTrigger
								value="old"
								className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none">
								Old regime
							</TabsTrigger>
						</TabsList>

						<TabsContent value="new" className="pt-4">
							<p className="text-muted-foreground text-sm leading-6">
								Rebate u/s 87A makes tax zero for taxable income
								up to ₹12,00,000. With the ₹75,000 standard
								deduction, a salaried individual pays no tax up
								to ₹12,75,000 gross.
							</p>
						</TabsContent>

						<TabsContent value="old" className="space-y-4 pt-4">
							<p className="text-muted-foreground text-sm leading-6">
								Claim deductions under Chapter VI-A (80C, 80D,
								80CCD) and Section 24(b) on home loan interest.
								Standard deduction is ₹50,000 for salaried.
							</p>
							<div className="grid gap-3 sm:grid-cols-2">
								{DEDUCTION_FIELDS.map(field => (
									<div
										key={field.key}
										className="space-y-1.5">
										<div className="flex items-center gap-1.5">
											<Label
												htmlFor={`ded-${field.key}`}
												className="text-muted-foreground text-sm">
												{field.label}
											</Label>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														aria-label={`About ${field.label}`}
														className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex cursor-help rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
														<Info className="h-3.5 w-3.5" />
													</button>
												</TooltipTrigger>
												<TooltipContent
													side="top"
													className="max-w-xs text-xs leading-5">
													{field.hint}
												</TooltipContent>
											</Tooltip>
										</div>
										<Input
											id={`ded-${field.key}`}
											type="number"
											inputMode="decimal"
											min="0"
											step="1000"
											value={deductions[field.key] ?? 0}
											onChange={e =>
												setDeductions(prev => ({
													...prev,
													[field.key]:
														Number.parseFloat(
															e.target.value,
														) || 0,
												}))
											}
										/>
									</div>
								))}
							</div>
						</TabsContent>
					</Tabs>

					<TaxSummary result={result} />
				</CardContent>
			</Card>

			<div className="flex flex-col gap-4">
				<RegimeComparisonCard
					newResult={comparison.new}
					oldResult={comparison.old}
					recommended={recommended}
					activeRegime={regime}
					onPick={r => setRegime(r)}
				/>
			</div>
		</div>
	);
}

function TaxSummary({ result }: { result: TaxResult }) {
	return (
		<div className="bg-input/30 border-input space-y-4 rounded-2xl border p-5">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-1">
					<p className="text-muted-foreground text-xs uppercase">
						Total tax payable
					</p>
					<h2 className="text-accent-foreground text-3xl font-[Instrument_Serif] sm:text-4xl">
						{formatINR(result.totalTax)}
					</h2>
					<p className="text-muted-foreground text-sm">
						Effective rate {formatPercent(result.effectiveRate)} ·
						In-hand {formatINR(result.netIncome)}
					</p>
				</div>
			</div>

			<div className="grid gap-2 text-sm">
				<SummaryRow
					label="Gross income"
					value={formatINR(result.grossIncome)}
				/>
				<SummaryRow
					label="Standard deduction"
					value={`- ${formatINR(result.standardDeduction)}`}
				/>
				{result.otherDeductions > 0 ?
					<SummaryRow
						label="Other deductions"
						value={`- ${formatINR(result.otherDeductions)}`}
					/>
				:	null}
				<SummaryRow
					label="Taxable income"
					value={formatINR(result.taxableIncome)}
				/>
				<SummaryRow
					label="Tax before rebate"
					value={formatINR(result.taxBeforeRebate)}
				/>
				{result.rebate87A > 0 ?
					<SummaryRow
						label="Rebate u/s 87A"
						value={`- ${formatINR(result.rebate87A)}`}
					/>
				:	null}
				{result.marginalRelief > 0 ?
					<SummaryRow
						label="Marginal relief"
						value={`- ${formatINR(result.marginalRelief)}`}
					/>
				:	null}
				{result.surcharge > 0 ?
					<SummaryRow
						label={`Surcharge (${formatPercent(result.surchargeRate, 0)})`}
						value={`+ ${formatINR(result.surcharge)}`}
					/>
				:	null}
				<SummaryRow
					label="Health & education cess (4%)"
					value={`+ ${formatINR(result.cess)}`}
				/>
			</div>
		</div>
	);
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-4 border-b border-dashed py-1.5 last:border-b-0">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium">{value}</span>
		</div>
	);
}

function SlabBreakdownTable({ rows }: { rows: SlabRow[] }) {
	if (rows.length === 0) return null;
	return (
		<div className="border-input bg-background/60 overflow-hidden rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead className="h-10 px-4">Slab</TableHead>
						<TableHead className="h-10 px-4">Rate</TableHead>
						<TableHead className="h-10 px-4 text-right">
							Income in slab
						</TableHead>
						<TableHead className="h-10 px-4 text-right">
							Tax
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row, idx) => (
						<TableRow key={idx}>
							<TableCell className="px-4 py-2 text-sm">
								{formatINR(row.from)} –{" "}
								{row.to ? formatINR(row.to) : "above"}
							</TableCell>
							<TableCell className="px-4 py-2 text-sm">
								{formatPercent(row.rate, 0)}
							</TableCell>
							<TableCell className="px-4 py-2 text-right text-sm">
								{formatINR(row.slabIncome)}
							</TableCell>
							<TableCell className="px-4 py-2 text-right text-sm font-medium">
								{formatINR(row.tax)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function RegimeComparisonCard({
	newResult,
	oldResult,
	recommended,
	activeRegime,
	onPick,
}: {
	newResult: TaxResult;
	oldResult: TaxResult;
	recommended: TaxRegime;
	activeRegime: TaxRegime;
	onPick: (r: TaxRegime) => void;
}) {
	const savings = Math.abs(newResult.totalTax - oldResult.totalTax);
	return (
		<Card className="border-border bg-card h-fit gap-0 py-0">
			<CardHeader className="border-border border-b p-5">
				<CardTitle className="font-normal">New vs old regime</CardTitle>
				<CardDescription>
					Quick side-by-side on the same income and deductions.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 p-5">
				<RegimeRow
					label="New regime"
					value={newResult.totalTax}
					active={activeRegime === "new"}
					recommended={recommended === "new"}
					onClick={() => onPick("new")}
				/>
				<RegimeRow
					label="Old regime"
					value={oldResult.totalTax}
					active={activeRegime === "old"}
					recommended={recommended === "old"}
					onClick={() => onPick("old")}
				/>
				{savings > 0 ?
					<p className="text-muted-foreground text-xs leading-5">
						{recommended === "new" ? "New" : "Old"} regime saves{" "}
						{formatINR(savings)} on current inputs.
					</p>
				:	<p className="text-muted-foreground text-xs leading-5">
						Both regimes produce the same tax on current inputs.
					</p>
				}
			</CardContent>
		</Card>
	);
}

function RegimeRow({
	label,
	value,
	active,
	recommended,
	onClick,
}: {
	label: string;
	value: number;
	active: boolean;
	recommended: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`border-input hover:border-primary/40 flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
				active ? "bg-accent/50 border-primary/40" : "bg-input/30"
			}`}>
			<div className="space-y-0.5">
				<p className="text-sm font-medium">{label}</p>
				{recommended ?
					<p className="text-primary text-xs font-medium">
						Lower tax
					</p>
				:	<p className="text-muted-foreground text-xs">
						Total tax payable
					</p>
				}
			</div>
			<p className="text-sm font-semibold">{formatINR(value)}</p>
		</button>
	);
}

export function TaxSlabsReference({ regime }: { regime: TaxRegime }) {
	const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
	const title =
		regime === "new" ?
			"New regime slabs · FY 2025-26 (AY 2026-27)"
		:	"Old regime slabs · individuals under 60";
	return (
		<Card className="border-border bg-card gap-0 py-0 shadow-lg shadow-black/5">
			<CardHeader className="border-border border-b p-6">
				<CardTitle className="font-normal">{title}</CardTitle>
				<CardDescription>
					Slab rates before surcharge and 4% cess. Rebate u/s 87A is
					applied when applicable.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-transparent">
								<TableHead className="h-11 px-6">
									Income range
								</TableHead>
								<TableHead className="h-11 px-6 text-right">
									Tax rate
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{slabs.map((slab, idx) => {
								const from =
									idx === 0 ? 0 : (slabs[idx - 1]!.upto ?? 0);
								return (
									<TableRow key={idx}>
										<TableCell className="px-6 py-3">
											{formatINR(from)} –{" "}
											{slab.upto ?
												formatINR(slab.upto)
											:	"above"}
										</TableCell>
										<TableCell className="px-6 py-3 text-right font-medium">
											{formatPercent(slab.rate, 0)}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
