"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	useCategories,
	useTransactionDistributionByCategories,
} from "@/lib/query";
import { useChartStore } from "@/lib/store";
import {
	addDays,
	differenceInDays,
	endOfMonth,
	endOfWeek,
	format,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { LoaderCircle, Settings2 } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

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

const generateColor = (index: number) => {
	const colors = [
		"#60a5fa", // Blue
		"#f87171", // Red
		"#34d399", // Green
		"#a78bfa", // Purple
		"#fb923c", // Orange
		"#f472b6", // Pink
		"#2dd4bf", // Teal
		"#818cf8", // Indigo
		"#facc15", // Yellow
		"#fb7185", // Rose
		"#10b981", // Emerald
		"#8b5cf6", // Violet
		"#f59e0b", // Amber
		"#22d3ee", // Cyan
		"#e879f9", // Fuchsia
		"#84cc16", // Lime
		"#38bdf8", // Sky
		"#94a3b8", // Slate
		"#a8a29e", // Stone
		"#a1a1aa", // Zinc
	];
	return colors[index % colors.length];
};

// Light mode colors
const lightColors = [
	"#3b82f6", // Blue
	"#ef4444", // Red
	"#10b981", // Green
	"#8b5cf6", // Purple
	"#f97316", // Orange
	"#ec4899", // Pink
	"#14b8a6", // Teal
	"#6366f1", // Indigo
	"#eab308", // Yellow
	"#f43f5e", // Rose
	"#059669", // Emerald
	"#7c3aed", // Violet
	"#d97706", // Amber
	"#0891b2", // Cyan
	"#c026d3", // Fuchsia
	"#65a30d", // Lime
	"#0284c7", // Sky
	"#475569", // Slate
	"#57534e", // Stone
	"#52525b", // Zinc
];

// Dark mode colors
const darkColors = [
	"#60a5fa", // Blue
	"#f87171", // Red
	"#34d399", // Green
	"#a78bfa", // Purple
	"#fb923c", // Orange
	"#f472b6", // Pink
	"#2dd4bf", // Teal
	"#818cf8", // Indigo
	"#facc15", // Yellow
	"#fb7185", // Rose
	"#10b981", // Emerald
	"#8b5cf6", // Violet
	"#f59e0b", // Amber
	"#22d3ee", // Cyan
	"#e879f9", // Fuchsia
	"#84cc16", // Lime
	"#38bdf8", // Sky
	"#94a3b8", // Slate
	"#a8a29e", // Stone
	"#a1a1aa", // Zinc
];

const periodOptions = [
	{
		label: "This week",
		start_date: format(startOfWeek(new Date()), "yyyy-MM-dd"),
		end_date: format(endOfWeek(new Date()), "yyyy-MM-dd"),
	},
	{
		label: "This month",
		start_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
		end_date: format(endOfMonth(new Date()), "yyyy-MM-dd"),
	},
	{
		label: "Last 7 days",
		start_date: format(addDays(new Date(), -7), "yyyy-MM-dd"),
		end_date: format(new Date(), "yyyy-MM-dd"),
	},
	{
		label: "Last 14 days",
		start_date: format(addDays(new Date(), -14), "yyyy-MM-dd"),
		end_date: format(new Date(), "yyyy-MM-dd"),
	},
	{
		label: "Last 30 days",
		start_date: format(addDays(new Date(), -30), "yyyy-MM-dd"),
		end_date: format(new Date(), "yyyy-MM-dd"),
	},
];

export function TransactionBarChart() {
	const reverseOrderSwitchId = React.useId();

	const metric = useChartStore(s => s.tr_chart_metric);
	const start_date = useChartStore(s => s.tr_chart_date_start);
	const end_date = useChartStore(s => s.tr_chart_date_end);
	const reverse_order = useChartStore(s => s.tr_chart_reverse_order);

	const { data: transactions, isLoading: isTransactionsLoading } =
		useTransactionDistributionByCategories();
	const { data: categories, isLoading: isCategoriesLoading } =
		useCategories();

	const chartData: Record<string, string | number>[] = React.useMemo(() => {
		if (transactions === undefined || categories === undefined) return [];

		const startDate = new Date(start_date);
		const endDate = new Date(end_date);

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
			<CardHeader className="flex flex-col items-stretch border-b p-6 sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1">
					<CardTitle className="font-normal">
						Daily transactions
					</CardTitle>
				</div>
				<div className="flex">
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
							{/*<div className="flex gap-1 p-2">
                                <Label className="grow">Show categories</Label>
                                <Switch />
                            </div>*/}
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
				</div>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				{isTransactionsLoading || isCategoriesLoading ?
					<LoaderCircle className="mx-auto animate-spin" />
				:	<ChartContainer
						config={chartConfig}
						className="aspect-auto h-[250px] w-full">
						<BarChart
							accessibilityLayer
							data={chartData}
							reverseStackOrder={reverse_order}>
							<CartesianGrid vertical={false} />
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
										fill={generateColor(i + 1)}
										strokeWidth={1}
									/>
								);
							})}
						</BarChart>
					</ChartContainer>
				}
			</CardContent>
		</Card>
	);
}
