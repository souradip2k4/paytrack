"use client";

import {
	currencies,
	formatRate,
	FRANKFURTER_CURRENCIES,
	toPairSlug,
} from "@/lib/currencies";
import {
	formatSignedRateChange,
	getHistoricalRateStats,
	type HistoricalRatePoint,
} from "@/lib/historical-rates";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { Label } from "@budgetbee/ui/core/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@budgetbee/ui/core/table";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CurrencySelect, useExchangeRate } from "./currency-converter";
import {
	getHistoricalPeriodDays,
	getHistoricalPeriodLabel,
	HISTORICAL_PERIODS,
	useBaseCurrencyQueryState,
	useHistoricalPeriodQueryState,
} from "./query-state";
import { Sparkline } from "./sparkline";

function useHistoricalBulk(base: string, days = 30) {
	const [data, setData] = useState<Record<
		string,
		HistoricalRatePoint[]
	> | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!FRANKFURTER_CURRENCIES.has(base)) {
			setData(null);
			setLoading(false);
			return;
		}

		const controller = new AbortController();
		setData(null);
		setLoading(true);

		fetch(
			`/api/currency/history?base=${encodeURIComponent(base)}&days=${days}`,
			{ signal: controller.signal },
		)
			.then(res => {
				if (!res.ok) throw new Error("Failed to fetch");
				return res.json();
			})
			.then((json: { rates: Record<string, Record<string, number>> }) => {
				const dates = Object.keys(json.rates).sort();
				const result: Record<string, HistoricalRatePoint[]> = {};

				for (const date of dates) {
					const dayRates = json.rates[date]!;
					for (const [currency, rate] of Object.entries(dayRates)) {
						if (!result[currency]) result[currency] = [];
						result[currency].push({ date, rate });
					}
				}

				setData(result);
				setLoading(false);
			})
			.catch((err: Error) => {
				if (err.name === "AbortError") return;
				setLoading(false);
			});

		return () => controller.abort();
	}, [base, days]);

	return { data, loading };
}

export function ExchangeRatesTable({ base = "USD" }: { base?: string }) {
	const [selectedBase, setSelectedBase] = useBaseCurrencyQueryState(base);
	const [periodKey, setPeriodKey] = useHistoricalPeriodQueryState("30d");
	const { data, loading, error } = useExchangeRate(selectedBase);
	const { data: historical, loading: histLoading } = useHistoricalBulk(
		selectedBase,
		getHistoricalPeriodDays(periodKey),
	);
	const supportsHistorical = FRANKFURTER_CURRENCIES.has(selectedBase);
	const periodLabel = getHistoricalPeriodLabel(periodKey);

	return (
		<Card className="border-border bg-card mt-8 gap-0 p-0">
			<CardHeader className="border-border gap-4 border-b p-6">
				<div className="space-y-1.5">
					<CardTitle className="text-2xl font-[Instrument_Serif] font-normal">
						Current exchange rates
					</CardTitle>
					<CardDescription className="max-w-2xl text-sm leading-6">
						Compare {selectedBase} against major currencies, then
						open a pair page for historical charts and conversion
						tables.
					</CardDescription>
				</div>

				<div className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
					<div className="space-y-2">
						<Label
							htmlFor="base-currency"
							className="text-muted-foreground text-sm">
							Base currency
						</Label>
						<CurrencySelect
							id="base-currency"
							value={selectedBase}
							onChange={setSelectedBase}
						/>
					</div>
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">
							Trend period
						</p>
						<div className="flex flex-wrap gap-2">
							{HISTORICAL_PERIODS.map(period => (
								<Button
									key={period.key}
									type="button"
									size="sm"
									variant={
										period.key === periodKey ?
											"secondary"
										:	"ghost"
									}
									onClick={() => setPeriodKey(period.key)}
									className="rounded-full px-3 text-xs">
									{period.label}
								</Button>
							))}
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="px-0">
				<p className="text-muted-foreground bg-input/30 border-b px-6 py-2 text-xs leading-5">
					{supportsHistorical ?
						`Trend charts and summary columns use the ${periodLabel} window for ECB-supported currencies.`
					:	"Historical trend charts are unavailable for this base currency, but live rates still work."
					}
				</p>

				{loading ?
					<div className="text-muted-foreground flex items-center gap-2 px-6 py-12">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Loading exchange rates...</span>
					</div>
				: error ?
					<p className="text-destructive px-6 pb-6">{error}</p>
				: data ?
					<div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
						<Table className="table-fixed">
							<TableHeader className="bg-input/30">
								<TableRow className="hover:bg-transparent">
									<TableHead className="h-11 w-[24%] px-6">
										Currency
									</TableHead>
									<TableHead className="h-11 w-[28%] px-6">
										{periodLabel} trend
									</TableHead>
									<TableHead className="h-11 w-[12%] px-6 text-right">
										Change
									</TableHead>
									<TableHead className="h-11 w-[12%] px-6 text-right">
										High
									</TableHead>
									<TableHead className="h-11 w-[12%] px-6 text-right">
										Low
									</TableHead>
									<TableHead className="h-11 w-[12%] px-6 text-right">
										Rate
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{currencies
									.filter(c => c.code !== selectedBase)
									.map(currency => {
										const rate = data.rates[currency.code];
										const sparkData =
											historical?.[currency.code];
										const trendStats =
											sparkData ?
												getHistoricalRateStats(
													sparkData,
												)
											:	null;
										const pairSlug = toPairSlug(
											selectedBase,
											currency.code,
										);
										const pairHref = `/exchange-rates/${pairSlug}?period=${periodKey}`;
										const changeClass =
											!trendStats || trendStats.isFlat ?
												"text-foreground"
											: trendStats.isUp ?
												"text-emerald-600 dark:text-emerald-400"
											:	"text-red-600 dark:text-red-400";

										return (
											<TableRow
												key={currency.code}
												className="hover:bg-muted/30">
												<TableCell className="p-0">
													<Link
														href={pairHref}
														className="block px-6 py-3">
														<div className="flex items-center gap-2">
															<span className="text-base">
																{currency.flag}
															</span>
															<div>
																<p className="text-sm font-medium transition-colors">
																	{
																		currency.code
																	}
																</p>
																<p className="text-muted-foreground text-xs">
																	{
																		currency.name
																	}
																</p>
															</div>
														</div>
													</Link>
												</TableCell>
												<TableCell className="p-0">
													{histLoading ?
														<div className="px-6 py-3">
															<div className="bg-muted/30 h-14 w-full animate-pulse rounded-xl" />
														</div>
													: (
														sparkData &&
														sparkData.length >= 2
													) ?
														<Link
															href={pairHref}
															className="block px-6 py-3"
															aria-label={`Open ${selectedBase} to ${currency.code} exchange-rate history`}>
															<Sparkline
																data={sparkData}
																width={220}
															/>
														</Link>
													:	<div className="px-6 py-3">
															<span className="text-muted-foreground text-xs">
																—
															</span>
														</div>
													}
												</TableCell>
												<TableCell className="px-6 py-3 text-right font-mono text-xs font-semibold">
													{histLoading ?
														<div className="bg-muted/30 ml-auto h-4 w-14 animate-pulse rounded" />
													: trendStats ?
														<span
															className={
																changeClass
															}>
															{formatSignedRateChange(
																trendStats.changePct,
															)}
														</span>
													:	<span className="text-muted-foreground">
															—
														</span>
													}
												</TableCell>
												<TableCell className="px-6 py-3 text-right font-mono text-xs font-medium">
													{histLoading ?
														<div className="bg-muted/30 ml-auto h-4 w-16 animate-pulse rounded" />
													: trendStats ?
														formatRate(
															trendStats.high,
														)
													:	<span className="text-muted-foreground">
															—
														</span>
													}
												</TableCell>
												<TableCell className="px-6 py-3 text-right font-mono text-xs font-medium">
													{histLoading ?
														<div className="bg-muted/30 ml-auto h-4 w-16 animate-pulse rounded" />
													: trendStats ?
														formatRate(
															trendStats.low,
														)
													:	<span className="text-muted-foreground">
															—
														</span>
													}
												</TableCell>
												<TableCell className="px-6 py-3 text-right font-mono text-sm font-medium">
													{rate !== undefined ?
														formatRate(rate)
													:	"—"}
												</TableCell>
											</TableRow>
										);
									})}
							</TableBody>
						</Table>
					</div>
				:	null}
			</CardContent>
			{data && (
				<CardFooter className="border-t p-6">
					<p className="text-muted-foreground text-xs">
						{`Rates last updated: {format(data.date, "MMM d, yyyy")}`}
					</p>
				</CardFooter>
			)}
		</Card>
	);
}
