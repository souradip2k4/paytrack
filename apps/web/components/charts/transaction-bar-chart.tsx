"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { getColor } from "@/lib/hash";
import {
	useCategories,
	useTransactionDistributionByCategories,
} from "@/lib/query";
import { useChartStore } from "@/lib/store";
import { addDays, differenceInDays, format } from "date-fns";
import { LoaderCircle } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export const description = "An interactive bar chart";

const chartConfig = {
	credit: {
		label: "Credit",
		color: "var(--chart-2)",
	},
	debit: {
		label: "Debit",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export function TransactionBarChart() {
	const metric = useChartStore(s => s.tr_chart_metric);
	const start_date = useChartStore(s => s.tr_chart_date_start);
	const end_date = useChartStore(s => s.tr_chart_date_end);
	const reverse_order = useChartStore(s => s.tr_chart_reverse_order);

	const { data: transactions, isLoading: isTransactionsLoading } =
		useTransactionDistributionByCategories();
	const { data: categories, isLoading: isCategoriesLoading } =
		useCategories();

	React.useEffect(() => {}, [transactions]);

	const chartData: Record<string, string | number>[] = React.useMemo(() => {
		if (transactions === undefined || categories === undefined) return [];
		if (transactions.length === 0) return []; // since we would an empty state

		// calculate range of dates
		/*let minTimestamp: number = new Date(transactions[0].day).getTime();
        let maxTimestamp: number = new Date(transactions[0].day).getTime();

        for (let i = 1; i < transactions.length; i++) {
            const currentTimestamp: number = new Date(transactions[i].day).getTime();
            if (currentTimestamp < minTimestamp) minTimestamp = currentTimestamp;
            if (currentTimestamp > maxTimestamp) maxTimestamp = currentTimestamp;
        }*/

		const startDate: Date = new Date(start_date);
		const endDate: Date = new Date(end_date);

		const catMap: Map<string, string> = categories.reduce((map, cat) => {
			map.set(cat.id, cat.name);
			return map;
		}, new Map());

		const catSet = new Set<string>();
		categories.forEach(cat => catSet.add(cat.name));

		const groupedTransactions: Record<
			string,
			Record<string, number>
		> = transactions.reduce(
			(acc, item) => {
				const key = format(new Date(item.day), "yyyy-MM-dd");
				if (!acc[key]) acc[key] = {};
				const name =
					catMap.get(item.category_id) ||
					item.name ||
					"Uncategorized";
				if (acc[key][name]) acc[key][name] += item[metric] || 0;
				else acc[key][name] = item[metric] || 0;
				return acc;
			},
			{} as Record<string, Record<string, number>>,
		);

		const days = Array.from(
			{ length: differenceInDays(endDate, startDate) + 1 },
			(_, i) => {
				const day = addDays(startDate, i);
				const dayKey = format(day, "yyyy-MM-dd");
				let res: Record<string, any> = { day: dayKey };
				catSet.forEach(c => {
					res[c] = 0;
				});
				if (groupedTransactions[dayKey]) {
					Object.entries(groupedTransactions[dayKey]).forEach(
						([category, value]) => {
							res[category] = value;
						},
					);
				}
				return res;
			},
		);
		return days;
	}, [transactions, categories, start_date, end_date, metric]);

	return (
		<Card className="py-0">
			<CardHeader className="flex flex-col items-stretch border-b p-4 px-6 !pb-4 sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1">
					<CardTitle className="font-normal">
						Daily transactions
					</CardTitle>
				</div>
				<div className="flex">
					{/*
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="outline"
                                className="size-8">
                                <Settings2 className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-muted-foreground text-xs">
                                    Period
                                </DropdownMenuLabel>
                                {periodOptions.map((o, i) => (
                                    <DropdownMenuCheckboxItem
                                        key={i}
                                        checked={
                                            o.start_date === start_date &&
                                            o.end_date === end_date
                                        }
                                        onCheckedChange={_ =>
                                            useChartStore.setState(_ => ({
                                                tr_chart_date_start:
                                                    o.start_date,
                                                tr_chart_date_end: o.end_date,
                                            }))
                                        }>
                                        {o.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-muted-foreground text-xs">
                                    Transaction type
                                </DropdownMenuLabel>
                                {(["credit", "debit", "balance"] as const).map(
                                    (m, i) => (
                                        <DropdownMenuCheckboxItem
                                            key={i}
                                            checked={m === metric}
                                            onCheckedChange={_ =>
                                                useChartStore.setState(_ => ({
                                                    tr_chart_metric: m,
                                                }))
                                            }
                                            className="capitalize">
                                            {m}
                                        </DropdownMenuCheckboxItem>
                                    ),
                                )}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <div className="flex gap-1 p-2">
                                <Label
                                    className="grow"
                                    htmlFor={reverseOrderSwitchId}>
                                    Reverse order
                                </Label>
                                <Switch
                                    id={reverseOrderSwitchId}
                                    checked={reverse_order}
                                    onCheckedChange={_ =>
                                        useChartStore.setState(_ => ({
                                            tr_chart_reverse_order:
                                                !reverse_order,
                                        }))
                                    }
                                />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    */}
				</div>
			</CardHeader>
			<CardContent className="pb-6 max-sm:px-2">
				<ChartContainer
					config={chartConfig}
					className="relative aspect-auto h-[250px] w-full">
					{isTransactionsLoading || isCategoriesLoading ?
						<div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
							<LoaderCircle className="mx-auto animate-spin" />
						</div>
					: chartData && chartData.length === 0 ?
						<div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
							<p>No data available</p>
						</div>
					:	<BarChart
							accessibilityLayer
							data={chartData}
							reverseStackOrder={reverse_order}>
							<CartesianGrid vertical={false} />
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								tickFormatter={value => {
									const v = Number.parseFloat(value);
									if (Number.isNaN(v)) return "";
									return Intl.NumberFormat("en-US", {
										notation: "compact",
										maximumFractionDigits: 2,
										compactDisplay: "short",
									}).format(v);
								}}
							/>
							<XAxis
								dataKey="day"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={32}
								tickFormatter={value => {
									const date = new Date(value);
									return date.toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									});
								}}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										className="w-[150px]"
										nameKey="amount"
										labelFormatter={value => {
											return new Date(
												value,
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											});
										}}
									/>
								}
							/>
							{[
								...(categories || []),
								{ name: "Uncategorized" },
							].map((c, i) => {
								return (
									<Bar
										key={c.name}
										name={c.name}
										stackId="a"
										dataKey={c.name}
										radius={4}
										overflow="visible"
										className="stroke-card"
										fill={getColor(c.name)}
										strokeWidth={1}
									/>
								);
							})}
						</BarChart>
					}
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
