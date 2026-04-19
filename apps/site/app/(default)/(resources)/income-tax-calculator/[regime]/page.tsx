import { CTACardOne } from "@/components/currency-converter/tool-page-shell";
import {
	IndiaTaxCalculator,
	TaxSlabsReference,
} from "@/components/tax-calculator/india-tax-calculator";
import { PopularTaxLinks } from "@/components/tax-calculator/popular-tax-links";
import type { TaxRegime } from "@/lib/india-tax";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";

type RegimeSlug = "new-regime" | "old-regime";

const REGIME_CONFIG: Record<
	RegimeSlug,
	{
		regime: TaxRegime;
		title: string;
		h1: string;
		description: string;
		intro: string;
		keywords: string[];
		copy: ReactNode;
	}
> = {
	"new-regime": {
		regime: "new",
		title: "New Regime Tax Calculator FY 2025-26 (AY 2026-27) | Budgetbee",
		h1: "New Regime Tax Calculator",
		description:
			"Calculate income tax under the new regime for FY 2025-26 (AY 2026-27). Budget 2025 slabs, ₹75,000 standard deduction, 87A rebate up to ₹12 lakh, surcharge and 4% cess.",
		intro: "Estimate tax under the new tax regime announced in Union Budget 2025. Salaried individuals get a ₹75,000 standard deduction and pay zero tax on taxable income up to ₹12 lakh thanks to rebate u/s 87A.",
		keywords: [
			"new tax regime calculator",
			"new regime income tax calculator",
			"income tax calculator FY 2025-26 new regime",
			"budget 2025 new regime calculator",
			"new regime slab calculator",
			"new regime standard deduction 75000",
			"87A rebate 12 lakh",
		],
		copy: (
			<>
				<p>
					Taxpayers without business or professional income can choose
					the old regime directly in the ITR if it produces lower tax.
					Taxpayers with business or professional income must file
					Form 10-IEA within the section 139(1) due date and should
					account for the opt-out/re-entry limits.
				</p>
				<p>
					<strong className="text-foreground">
						Zero tax up to ₹12.75 lakh for salaried.
					</strong>{" "}
					Taxable income up to ₹12,00,000 qualifies for full rebate
					u/s 87A. Adding the ₹75,000 standard deduction, a salaried
					taxpayer pays no tax on gross salary up to ₹12,75,000.
				</p>
				<p>
					Above ₹12 lakh, marginal relief ensures tax cannot exceed
					the income above the rebate threshold. For example, at
					₹12,10,000 taxable income, tax is capped at ₹10,000 rather
					than the full slab-computed amount.
				</p>
				<p>
					New regime does not permit Chapter VI-A deductions like 80C,
					80D, HRA or home loan interest on self-occupied property.
					Employer NPS contribution u/s 80CCD(2) is allowed.
				</p>
			</>
		),
	},
	"old-regime": {
		regime: "old",
		title: "Old Regime Tax Calculator FY 2025-26 (AY 2026-27) | Budgetbee",
		h1: "Old Regime Tax Calculator",
		description:
			"Calculate income tax under the old regime for FY 2025-26. Claim 80C, 80D, 80CCD(1B) NPS, Section 24(b) home loan interest and HRA. Standard deduction ₹50,000, 87A rebate up to ₹5 lakh.",
		intro: "Estimate tax under the old regime with all Chapter VI-A deductions. Standard deduction for salaried is ₹50,000 and rebate u/s 87A applies up to ₹5,00,000 taxable income.",
		keywords: [
			"old tax regime calculator",
			"old regime income tax calculator",
			"80C calculator",
			"80D deduction calculator",
			"HRA exemption calculator",
			"income tax calculator FY 2025-26 old regime",
			"home loan tax benefit calculator",
		],
		copy: (
			<>
				<p>
					The old regime is worth picking when your total deductions
					are high - typically when 80C, 80D, HRA and home loan
					interest together exceed ₹4-5 lakh a year. Run both regimes
					side by side here and pick the lower number.
				</p>
				<p>
					<strong className="text-foreground">Key deductions:</strong>{" "}
					Section 80C up to ₹1,50,000 (EPF, PPF, ELSS, LIC, tuition,
					principal repayment), 80CCD(1B) extra ₹50,000 for NPS, 80D
					up to ₹1,00,000 for health insurance (self, family,
					parents), Section 24(b) up to ₹2,00,000 for home loan
					interest on self-occupied property, and HRA exemption if you
					pay rent.
				</p>
				<p>
					<strong className="text-foreground">
						Zero tax up to ₹5 lakh taxable.
					</strong>{" "}
					Rebate u/s 87A applies on taxable income up to ₹5,00,000.
					With ₹50,000 standard deduction plus ₹1,50,000 80C plus
					₹50,000 80CCD(1B), salaried individuals can often pay no tax
					on gross salary up to ₹7,50,000.
				</p>
				<p>
					Surcharge in the old regime goes up to 37% on income above
					₹5 crore, versus 25% capped in the new regime - a major
					reason ultra-high earners prefer the new regime.
				</p>
			</>
		),
	},
};

const REGIME_SLUGS = Object.keys(REGIME_CONFIG) as RegimeSlug[];

type Props = {
	params: Promise<{ regime: string }>;
};

export function generateStaticParams() {
	return REGIME_SLUGS.map(regime => ({ regime }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { regime } = await params;
	const config = REGIME_CONFIG[regime as RegimeSlug];
	if (!config) return {};
	return {
		title: config.title,
		description: config.description,
		keywords: config.keywords,
		alternates: {
			canonical: `/income-tax-calculator/${regime}`,
		},
	};
}

export default async function TaxRegimePage({ params }: Props) {
	const { regime } = await params;
	const config = REGIME_CONFIG[regime as RegimeSlug];
	if (!config) notFound();

	return (
		<div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h1 className="text-accent-foreground flex select-none items-center text-3xl font-[Instrument_Serif] sm:text-4xl lg:text-5xl">
						{config.h1}
					</h1>
					<p className="text-muted-foreground max-w-2xl text-base leading-7">
						{config.intro}
					</p>
				</div>
			</section>

			<Suspense
				fallback={
					<div className="border-border bg-card mt-8 h-[28rem] rounded-3xl border" />
				}>
				<IndiaTaxCalculator defaultRegime={config.regime} />
			</Suspense>

			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
						{config.regime === "new" ?
							"New regime slabs · FY 2025-26"
						:	"Old regime slabs"}
					</h2>
				</div>
				<div className="grid gap-6 lg:grid-cols-2">
					<TaxSlabsReference regime={config.regime} />
					<TaxSlabsReference
						regime={config.regime === "new" ? "old" : "new"}
					/>
				</div>
			</section>

			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
						About the {config.regime === "new" ? "new" : "old"}{" "}
						regime
					</h2>
				</div>
				<div className="text-muted-foreground space-y-4 text-base leading-7">
					{config.copy}
				</div>
			</section>

			<PopularTaxLinks />

			<CTACardOne
				title="Plan salary, investments, and tax in one place"
				description="Budgetbee helps you track take-home pay, deductions, and monthly tax outgo so there are no surprises in March."
			/>
		</div>
	);
}
