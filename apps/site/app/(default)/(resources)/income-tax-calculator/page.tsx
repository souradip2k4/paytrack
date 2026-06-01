import { CTACardOne } from "@/components/currency-converter/tool-page-shell";
import {
	IndiaTaxCalculator,
	TaxSlabsReference,
} from "@/components/tax-calculator/india-tax-calculator";
import { PopularTaxLinks } from "@/components/tax-calculator/popular-tax-links";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Income Tax Calculator India FY 2025-26 (AY 2026-27) | Paytrack",
	description:
		"Free income tax calculator for India - compare new vs old regime for FY 2025-26 (AY 2026-27). Budget 2025 slabs, ₹75,000 standard deduction, 87A rebate, surcharge and 4% cess included.",
	keywords: [
		"income tax calculator",
		"income tax calculator india",
		"income tax calculator FY 2025-26",
		"income tax calculator AY 2026-27",
		"new tax regime calculator",
		"old tax regime calculator",
		"salary tax calculator india",
		"tax calculator for salaried",
		"budget 2025 tax calculator",
	],
	alternates: {
		canonical: "/income-tax-calculator",
	},
};

export default function IncomeTaxCalculatorPage() {
	return (
		<div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h1 className="text-accent-foreground flex select-none items-center text-3xl font-[Instrument_Serif] sm:text-4xl lg:text-5xl">
						Income Tax Calculator (India)
					</h1>
					<p className="text-muted-foreground max-w-2xl text-base leading-7">
						Estimate income tax under both the new and old regime
						for FY 2025-26 (AY 2026-27). Uses Union Budget 2025
						slabs, standard deduction, rebate u/s 87A, surcharge and
						4% health &amp; education cess.
					</p>
				</div>
			</section>

			<Suspense
				fallback={
					<div className="border-border bg-card mt-8 h-[28rem] rounded-3xl border" />
				}>
				<IndiaTaxCalculator />
			</Suspense>

			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
						Income tax slabs
					</h2>
					<p className="text-muted-foreground text-base leading-7">
						Reference tables for the rates applied before surcharge
						and cess. Rebate u/s 87A makes tax zero up to ₹12L (new
						regime) or ₹5L (old regime) of taxable income.
					</p>
				</div>
				<div className="grid gap-6 lg:grid-cols-2">
					<TaxSlabsReference regime="new" />
					<TaxSlabsReference regime="old" />
				</div>
			</section>

			<PopularTaxLinks />

			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
						How the calculation works
					</h2>
				</div>
				<div className="text-muted-foreground space-y-4 text-base leading-7">
					<p>
						<strong className="text-foreground">
							Taxable income
						</strong>{" "}
						= gross income − standard deduction (₹75,000 new /
						₹50,000 old for salaried and pensioners) − eligible
						deductions. The old regime allows Section 80C up to
						₹1,50,000 (EPF, PPF, ELSS, LIC premiums, tuition fees,
						home loan principal, 5-yr tax-saver FD), an additional
						₹50,000 under 80CCD(1B) for NPS Tier-1 self-contribution
						(total retirement-savings deduction up to ₹2,00,000),
						Section 80D up to ₹1,00,000 for health insurance -
						₹25,000 for self and family (₹50,000 if 60+) plus
						₹25,000 for parents (₹50,000 if 60+), including a ₹5,000
						preventive check-up - and Section 24(b) up to ₹2,00,000
						for home loan interest on self-occupied property
						(let-out property has no cap, but loss set-off is
						limited to ₹2L).
					</p>
					<p>
						<strong className="text-foreground">
							Salary exemptions
						</strong>{" "}
						in the old regime also include HRA, LTA and professional
						tax. HRA exemption is the minimum of (a) HRA received,
						(b) 50% of salary for metro cities or 40% for non-metro,
						and (c) rent paid minus 10% of salary. For this rule,
						salary generally means basic pay plus qualifying DA and
						turnover-based commission - the calculator expects the
						already-computed exempt amount. LTA for domestic travel
						is exempt up to the actual cost by the shortest route,
						claimable twice in a 4-year calendar-year block (2022-25
						for 2025 travel; 2026-29 from January 1, 2026, with
						limited carry-forward). Professional tax is capped at
						₹2,500 per year under Article 276(2). The new regime
						allows only the standard deduction and employer NPS
						contribution u/s 80CCD(2).
					</p>
					<p>
						<strong className="text-foreground">
							Rebate u/s 87A
						</strong>{" "}
						makes tax zero when taxable income is within ₹12,00,000
						(new regime) or ₹5,00,000 (old regime). Above the new
						regime threshold, marginal relief caps the tax at the
						excess amount so a small rise in income cannot create a
						larger tax liability.
					</p>
					<p>
						<strong className="text-foreground">Surcharge</strong>{" "}
						applies on income above ₹50 lakh (10%), ₹1 crore (15%),
						₹2 crore (25% in both regimes), and ₹5 crore (37% in the
						old regime only; the new regime remains capped at 25%).
						A{" "}
						<strong className="text-foreground">
							4% health and education cess
						</strong>{" "}
						is added on tax + surcharge.
					</p>
					<p>
						This calculator does not currently model senior citizen
						slabs, capital gains, business income, or surcharge
						marginal relief at each threshold. For salaried
						taxpayers the estimate matches the tax payable on salary
						income.
					</p>
				</div>
			</section>

			<CTACardOne
				title="Plan salary, expenses and investments in one place"
				description="Paytrack helps you track your income and expenses in one place."
			/>
		</div>
	);
}
