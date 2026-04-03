"use client";

import {
	Currency,
	getCurrency,
	getRelatedPairs,
	parsePairSlug,
	popularPairs,
	toPairSlug,
} from "@/lib/currencies";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export function PopularConversionRatesTable() {
	const [expanded, setExpanded] = React.useState(false);
	const featuredPopularPairs =
		expanded ? popularPairs : popularPairs.slice(0, 16);
	const featuredPopularConversionsList = featuredPopularPairs.flatMap(
		([from, to]) => {
			const fromCurrency = getCurrency(from);
			const toCurrency = getCurrency(to);
			if (!fromCurrency || !toCurrency) return [];
			return [
				{
					href: `/currency-converter/${toPairSlug(from, to)}`,
					label: `${fromCurrency.flag} ${from} to ${toCurrency.flag} ${to}`,
					meta: `${fromCurrency.name} to ${toCurrency.name}`,
				},
			];
		},
	);
	return (
		<section className="mt-14 space-y-6 sm:mt-16">
			<div className="space-y-2">
				<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
					Popular currency conversions
				</h2>
				<p className="text-muted-foreground max-w-2xl text-base leading-7">
					View realtime conversion rates, compare multiple currencies,
					see historical rates and analyze trends.
				</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{featuredPopularConversionsList.map(item => (
					<Link
						key={item.href}
						href={item.href}
						className="border-border bg-card hover:border-primary/40 hover:bg-accent/40 group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors">
						<div>
							<p className="text-sm font-medium">{item.label}</p>
							{item.meta ?
								<p className="text-muted-foreground mt-1 text-xs">
									{item.meta}
								</p>
							:	null}
						</div>
						<ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
					</Link>
				))}
			</div>
			<div className="flex">
				<Button
					className="ml-auto hover:cursor-pointer"
					variant="link"
					onClick={() => setExpanded(x => !x)}>
					{expanded ?
						"Show less"
					:	`View all (${popularPairs.length})`}
				</Button>
			</div>
		</section>
	);
}

export function PopularExchangeRatesTable() {
	const [expanded, setExpanded] = React.useState(false);
	const featuredPopularPairs =
		expanded ? popularPairs : popularPairs.slice(0, 12);
	const featuredPopularConversionsList = featuredPopularPairs.flatMap(
		([from, to]) => {
			const fromCurrency = getCurrency(from);
			const toCurrency = getCurrency(to);
			if (!fromCurrency || !toCurrency) return [];
			return [
				{
					href: `/exchange-rates/${toPairSlug(from, to)}`,
					label: `${fromCurrency.flag} ${from} to ${toCurrency.flag} ${to}`,
					meta: `${fromCurrency.name} to ${toCurrency.name}`,
				},
			];
		},
	);
	return (
		<section className="mt-14 space-y-6 sm:mt-16">
			<div className="space-y-2">
				<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
					Popular exchange-rate pages
				</h2>
				<p className="text-muted-foreground max-w-2xl text-base leading-7">
					These are the high-intent rate pairs people typically open
					to check historical movement.
				</p>
			</div>
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{featuredPopularConversionsList.map(item => (
						<Link
							key={item.href}
							href={item.href}
							className="border-border bg-card hover:border-primary/40 hover:bg-accent/40 group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors">
							<div>
								<p className="text-sm font-medium">
									{item.label}
								</p>
								{item.meta ?
									<p className="text-muted-foreground mt-1 text-xs">
										{item.meta}
									</p>
								:	null}
							</div>
							<ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
						</Link>
					))}
				</div>

				<div className="flex">
					<Link href="/currency-converter" className="group h-fit">
						<Card className="border-border bg-card group-hover:border-primary/40 h-full gap-0 py-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:shadow-black/5">
							<CardContent className="space-y-3 p-5">
								<p className="text-muted-foreground text-xs uppercase">
									Related tool
								</p>
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-2">
										<h3 className="text-foreground">
											Browse all live exchange rates
										</h3>
										<p className="text-muted-foreground text-sm leading-6">
											See a base currency against the full
											table of supported currencies and
											open trend charts from there.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</Link>
				</div>
			</div>
			<div className="flex">
				<Button
					className="hover:cursor-pointer"
					variant="link"
					onClick={() => setExpanded(x => !x)}>
					{expanded ?
						"Show less"
					:	`View all (${popularPairs.length})`}
				</Button>
			</div>
		</section>
	);
}

export function RelatedConversionsTable({ currency }: { currency: Currency }) {
	const relatedPairs = getRelatedPairs(currency.code, 6);
	const relatedPairsList = relatedPairs.flatMap(slug => {
		const parts = parsePairSlug(slug);
		const target = parts ? getCurrency(parts.to) : null;

		if (!parts || !target) return [];

		return [
			{
				href: `/currency-converter/${slug}`,
				label: `${currency.flag} ${currency.code} to ${target.flag} ${target.code}`,
				meta: `${currency.name} to ${target.name}`,
			},
		];
	});
	return (
		<Card className="border-border bg-card gap-0 py-0 shadow-lg shadow-black/5">
			<CardHeader className="border-border border-b p-6">
				<CardTitle className="font-normal">
					Popular {currency.code} conversions
				</CardTitle>
				<CardDescription>
					Other currencies commonly compared against {currency.code}.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6">
				<div className="grid gap-4 sm:grid-cols-1">
					{relatedPairsList.map(item => (
						<Link
							key={item.href}
							href={item.href}
							className="border-border bg-input/30 hover:border-primary/40 hover:bg-accent/40 group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors">
							<div>
								<p className="text-sm font-medium">
									{item.label}
								</p>
								{item.meta ?
									<p className="text-muted-foreground mt-1 text-xs">
										{item.meta}
									</p>
								:	null}
							</div>
							<ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
						</Link>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function RelatedExchangeRatsTable({ currency }: { currency: Currency }) {
	const relatedPairs = getRelatedPairs(currency.code, 6);
	const relatedPairsList = relatedPairs.flatMap(slug => {
		const parts = parsePairSlug(slug);
		const target = parts ? getCurrency(parts.to) : null;

		if (!parts || !target) return [];

		return [
			{
				href: `/exchange-rates/${slug}`,
				label: `${currency.flag} ${currency.code} / ${target.flag} ${target.code}`,
				meta: `${currency.name} / ${target.name}`,
			},
		];
	});
	return (
		<Card className="border-border bg-card gap-0 py-0 shadow-lg shadow-black/5">
			<CardHeader className="border-border border-b p-6">
				<CardTitle className="font-normal">
					Popular {currency.code} conversions
				</CardTitle>
				<CardDescription>
					Other currencies commonly compared against {currency.code}.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6">
				<div className="grid gap-4 sm:grid-cols-1">
					{relatedPairsList.map(item => (
						<Link
							key={item.href}
							href={item.href}
							className="border-border bg-input/30 hover:border-primary/40 hover:bg-accent/40 group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors">
							<div>
								<p className="text-sm font-medium">
									{item.label}
								</p>
								{item.meta ?
									<p className="text-muted-foreground mt-1 text-xs">
										{item.meta}
									</p>
								:	null}
							</div>
							<ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
						</Link>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
