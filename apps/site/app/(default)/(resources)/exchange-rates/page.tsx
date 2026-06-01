import { PopularExchangeRatesTable } from "@/components/currency-converter/conversion-rates-tables";
import { ExchangeRatesTable } from "@/components/currency-converter/exchange-rates-table";
import { CTACardOne } from "@/components/currency-converter/tool-page-shell";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Live Exchange Rates - Current Currency Exchange Rates | Paytrack",
	description:
		"View live exchange rates for 40+ currencies. Check current rates for USD, EUR, GBP, INR, JPY, CAD, and more — updated daily.",
	keywords: [
		"exchange rates",
		"currency exchange rates",
		"live exchange rates",
		"USD exchange rate",
		"EUR exchange rate",
		"currency rates today",
	],
};

export default function ExchangeRatesPage() {
	return (
		<div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
			<section className="mt-14 space-y-6 sm:mt-16">
				<div className="space-y-2">
					<h1 className="text-accent-foreground hidden select-none items-center text-2xl font-[Instrument_Serif] lg:flex lg:text-5xl">
						Live Exchange Rates
					</h1>
					<p className="text-muted-foreground text-base leading-7">
						Review current rates for 40+ world currencies, switch
						the base currency, and open pair pages with recent trend
						charts.
					</p>
				</div>
			</section>

			<Suspense
				fallback={
					<div className="border-border bg-card mt-8 h-[32rem] rounded-3xl border" />
				}>
				<ExchangeRatesTable />
			</Suspense>

			<PopularExchangeRatesTable />

			<CTACardOne
				title="Track multi-currency spending without spreadsheets"
				description="Paytrack helps you capture expenses in multiple currencies and keep one clean view of your personal or business spending."
			/>
		</div>
	);
}
