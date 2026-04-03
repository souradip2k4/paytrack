import { RelatedConversionsTable } from "@/components/currency-converter/conversion-rates-tables";
import {
	ConversionTable,
	CurrencySelectWithRelatedTools,
} from "@/components/currency-converter/currency-converter";
import { CTACardOne } from "@/components/currency-converter/tool-page-shell";
import {
	getAllPairSlugs,
	getCurrency,
	parsePairSlug,
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

	const title = `${from.code} to ${to.code} - Convert ${from.name} to ${to.name} | Budgetbee`;
	const description = `Convert ${from.name} (${from.code}) to ${to.name} (${to.code}) with live exchange rates. Free ${from.code} to ${to.code} currency converter.`;

	return {
		title,
		description,
		keywords: [
			`${from.code} to ${to.code}`,
			`convert ${from.code} to ${to.code}`,
			`${from.name} to ${to.name}`,
			`${from.code} ${to.code} exchange rate`,
			"currency converter",
			"exchange rate",
		],
	};
}

export default async function CurrencyPairPage({ params }: Props) {
	const { pair } = await params;
	const parsed = parsePairSlug(pair);
	if (!parsed) notFound();

	const from = getCurrency(parsed.from)!;
	const to = getCurrency(parsed.to)!;

	return (
		<div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h1 className="text-accent-foreground hidden select-none items-center text-2xl font-[Instrument_Serif] lg:flex lg:text-5xl">{`${from.code} to ${to.code} Converter`}</h1>
					<p className="text-muted-foreground max-w-2xl text-base leading-7">
						{`Convert ${from.name} (${from.code}) to ${to.name} (${to.code}) with live exchange rates, reverse tables, and related currency routes.`}
					</p>
				</div>
			</section>

			<Suspense
				fallback={
					<div className="border-border bg-card mt-8 h-[28rem] rounded-3xl border" />
				}>
				<CurrencySelectWithRelatedTools
					cta={`${from.code}/${to.code} historical chart`}
					pairHrefBase="/exchange-rates"
					description="Switch to the exchange-rate page to inspect the recent trend before converting."
					defaultFrom={from.code}
					defaultTo={to.code}
				/>
			</Suspense>

			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
						{from.code} To Other Currencies
					</h2>
					<p className="text-muted-foreground text-base leading-7">
						Use these reference amounts to compare typical
						conversions in both directions without re-entering
						numbers.
					</p>
				</div>
				<div className="grid gap-6 lg:grid-cols-2">
					<ConversionTable from={from.code} to={to.code} />
					<ConversionTable from={to.code} to={from.code} />
				</div>
			</section>

			<section className={"mt-14 space-y-6 sm:mt-16"}>
				<div className="space-y-2">
					<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
						Explore nearby currency routes
					</h2>
					<p className="text-muted-foreground text-base leading-7">
						If you are comparing several markets, these related
						pages let you move quickly across common base
						currencies.
					</p>
				</div>
				<div className="grid gap-6 lg:grid-cols-2">
					<RelatedConversionsTable currency={from} />
					<RelatedConversionsTable currency={to} />
				</div>
			</section>

			<CTACardOne
				title="Track multi-currency spending without spreadsheets"
				description="Budgetbee helps you capture expenses in multiple currencies and keep one clean view of your personal or business spending."
			/>
		</div>
	);
}
