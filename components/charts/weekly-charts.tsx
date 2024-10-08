"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

type ChartData = { name: string; income: number; expense: number };

const chartConfig = {
	income: {
		label: "Income",
		color: "hsl(var(--chart-1))",
	},
	expense: {
		label: "Expense",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

export function WeeklyBarChart({ chartData }: { chartData: ChartData[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Bar Chart - Stacked + Legend</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<BarChart accessibilityLayer data={chartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="name"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={value => value.slice(0, 10)}
						/>
						<ChartTooltip
							content={<ChartTooltipContent hideLabel />}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							dataKey="income"
							stackId="a"
							fill="var(--color-income)"
							radius={[0, 0, 4, 4]}
						/>
						<Bar
							dataKey="expense"
							stackId="a"
							fill="var(--color-expense)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="flex gap-2 font-medium leading-none">
					Trending up by 5.2% this month{" "}
					<TrendingUp className="h-4 w-4" />
				</div>
				<div className="leading-none text-muted-foreground">
					Showing total visitors for the last 6 months
				</div>
			</CardFooter>
		</Card>
	);
}
