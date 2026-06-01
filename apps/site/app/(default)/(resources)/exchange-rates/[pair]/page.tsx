import { RelatedExchangeRatsTable } from "@/components/currency-converter/conversion-rates-tables";
import { CurrencySelectWithRelatedTools } from "@/components/currency-converter/currency-converter";
import { HistoricalRateChart } from "@/components/currency-converter/rate-chart";
import { CTACardOne } from "@/components/currency-converter/tool-page-shell";
import {
	getAllPairSlugs,
	getCurrency,
	getRelatedPairs,
	parsePairSlug,
	toPairSlug,
} from "@/lib/currencies";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
	params: Promise<{ pair: string }>;
};

export function generateStaticParams() {
	return getAllPairSlugs().map(pair => ({ pair }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { pair } = await params;
	const parsed = parsePairSlug(pair);
	if (!parsed) return {};
	const from = getCurrency(parsed.from)!;
	const to = getCurrency(parsed.to)!;

	return {
		title: `${from.code}/${to.code} Exchange Rate - ${from.name} to ${to.name} History | Paytrack`,
		description: `Track the ${from.code} to ${to.code} exchange rate. View historical ${from.name} to ${to.name} rates with charts covering 7 days to 5 years.`,
		keywords: [
			`${from.code} to ${to.code} exchange rate`,
			`${from.code}/${to.code}`,
			`${from.name} to ${to.name} rate`,
			`${from.code} ${to.code} history`,
			"exchange rate history",
			"currency chart",
		],
	};
}

export default async function ExchangeRateDetailPage({ params }: Props) {
	const { pair } = await params;
	const parsed = parsePairSlug(pair);
	if (!parsed) notFound();

	const from = getCurrency(parsed.from)!;
	const to = getCurrency(parsed.to)!;
	const reverseSlug = toPairSlug(to.code, from.code);
	const fromRelated = getRelatedPairs(from.code, 6);
	const toRelated = getRelatedPairs(to.code, 6);

	return (
		<div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h1 className="text-accent-foreground hidden select-none items-center text-2xl font-[Instrument_Serif] lg:flex lg:text-5xl">
						{`${from.code}/${to.code} Exchange Rate`}
					</h1>
					<p className="text-muted-foreground text-base leading-7">
						{`Inspect recent movement for ${from.name} versus ${to.name}, then convert the pair using the same route.`}
					</p>
				</div>
			</section>

			<Suspense
				fallback={
					<div className="border-border bg-card mt-8 h-[32rem] rounded-3xl border" />
				}>
				<div className="mt-8">
					<HistoricalRateChart base={from.code} target={to.code} />
				</div>
			</Suspense>

			<Suspense
				fallback={
					<div className="border-border bg-card mt-8 h-[28rem] rounded-3xl border" />
				}>
				<CurrencySelectWithRelatedTools
					href="/exchange-rates"
					cta="Browse all live exchange rates"
					description="See a base currency against the full table of supported currencies and open trend charts from there."
					defaultFrom={from.code}
					defaultTo={to.code}
				/>
			</Suspense>

			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
						More exchange-rate routes
					</h2>
					<p className="text-muted-foreground text-base leading-7">
						Continue exploring related pairs based on either side of
						this exchange rate.
					</p>
				</div>
				<div className="grid gap-6 lg:grid-cols-2">
					<RelatedExchangeRatsTable currency={from} />
					<RelatedExchangeRatsTable currency={to} />
				</div>
			</section>

			<CTACardOne
				title="Track multi-currency spending without spreadsheets"
				description="Paytrack helps you capture expenses in multiple currencies and keep one clean view of your personal or business spending."
			/>
		</div>
	);
}
