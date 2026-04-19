import { ArrowRight } from "lucide-react";
import Link from "next/link";

const POPULAR_LINKS: {
	href: string;
	label: string;
	meta: string;
}[] = [
	{
		href: "/income-tax-calculator",
		label: "Income tax calculator India",
		meta: "FY 2025-26 · AY 2026-27 · both regimes",
	},
	{
		href: "/income-tax-calculator/new-regime",
		label: "New regime tax calculator",
		meta: "Budget 2025 slabs, ₹12L rebate",
	},
	{
		href: "/income-tax-calculator/old-regime",
		label: "Old regime tax calculator",
		meta: "80C, 80D, 24(b) deductions",
	},
	{
		href: "/income-tax-calculator?income=500000",
		label: "Tax on ₹5 lakh salary",
		meta: "Zero tax under both regimes",
	},
	{
		href: "/income-tax-calculator?income=1000000",
		label: "Tax on ₹10 lakh salary",
		meta: "New regime in-hand breakdown",
	},
	{
		href: "/income-tax-calculator?income=1500000",
		label: "Tax on ₹15 lakh salary",
		meta: "Compare regimes at mid-range",
	},
	{
		href: "/income-tax-calculator?income=2000000",
		label: "Tax on ₹20 lakh salary",
		meta: "Upper-middle income bracket",
	},
	{
		href: "/income-tax-calculator?income=5000000",
		label: "Tax on ₹50 lakh salary",
		meta: "Where surcharge kicks in",
	},
];

export function PopularTaxLinks() {
	return (
		<section className="mt-14 space-y-6 sm:mt-16">
			<div className="space-y-2">
				<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
					Popular tax calculations
				</h2>
				<p className="text-muted-foreground text-base leading-7">
					Pre-loaded scenarios most salaried taxpayers want to check
					before filing ITR.
				</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{POPULAR_LINKS.map(item => (
					<Link
						key={item.href + item.label}
						href={item.href}
						className="border-border bg-card hover:border-primary/40 hover:bg-accent/40 group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors">
						<div>
							<p className="text-sm font-medium">{item.label}</p>
							<p className="text-muted-foreground mt-1 text-xs">
								{item.meta}
							</p>
						</div>
						<ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
					</Link>
				))}
			</div>
		</section>
	);
}
