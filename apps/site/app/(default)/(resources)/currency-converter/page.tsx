import { PopularConversionRatesTable } from "@/components/currency-converter/conversion-rates-tables";
import { CurrencySelectWithRelatedTools } from "@/components/currency-converter/currency-converter";
import { CTACardOne } from "@/components/currency-converter/tool-page-shell";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Currency Converter - Convert Currencies with Live Rates | Paytrack",
	description:
		"Free currency converter with live exchange rates. Convert between 40+ currencies including USD, EUR, GBP, INR, JPY, CAD, and more.",
	keywords: [
		"currency converter",
		"exchange rate",
		"convert currency",
		"USD to EUR",
		"INR to USD",
		"live exchange rates",
		"currency conversion tool",
	],
};

export default function CurrencyConverterPage() {
	return (
		<div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h1 className="text-accent-foreground hidden select-none items-center text-2xl font-[Instrument_Serif] lg:flex lg:text-5xl">
						Currency Converter
					</h1>
					<p className="text-muted-foreground text-base leading-7">
						View realtime conversion rates, compare multiple
						currencies, see historical rates and analyze trends.
					</p>
				</div>
			</section>

			<Suspense
				fallback={
					<div className="border-border bg-card mt-8 h-[28rem] rounded-3xl border" />
				}>
				<CurrencySelectWithRelatedTools
					href="/exchange-rates"
					cta="Browse all live exchange rates"
					description="See a base currency against the full table of supported currencies and open trend charts from there."
				/>
			</Suspense>

			<PopularConversionRatesTable />

			<CTACardOne
				title="Track multi-currency spending without spreadsheets"
				description="Paytrack helps you capture expenses in multiple currencies and keep one clean view of your personal or business spending."
			/>
		</div>
	);
}
