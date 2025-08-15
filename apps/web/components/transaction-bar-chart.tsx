"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";

export const description = "An interactive bar chart";

const data = [
	{
		date: "2024-04-01",
		credit: 222,
		debit: 150,
	},
	{
		date: "2024-04-02",
		credit: 97,
		debit: 180,
	},
	{
		date: "2024-04-03",
		credit: 167,
		debit: 120,
	},
	{
		date: "2024-04-04",
		credit: 242,
		debit: 260,
	},
	{
		date: "2024-04-05",
		credit: 373,
		debit: 290,
	},
	{
		date: "2024-04-06",
		credit: 301,
		debit: 340,
	},
	{
		date: "2024-04-07",
		credit: 245,
		debit: 180,
	},
	{
		date: "2024-04-08",
		credit: 409,
		debit: 320,
	},
	{
		date: "2024-04-09",
		credit: 59,
		debit: 110,
	},
	{
		date: "2024-04-10",
		credit: 261,
		debit: 190,
	},
	{
		date: "2024-04-11",
		credit: 327,
		debit: 350,
	},
	{
		date: "2024-04-12",
		credit: 292,
		debit: 210,
	},
	{
		date: "2024-04-13",
		credit: 342,
		debit: 380,
	},
	{
		date: "2024-04-14",
		credit: 137,
		debit: 220,
	},
	{
		date: "2024-04-15",
		credit: 120,
		debit: 170,
	},
	{
		date: "2024-04-16",
		credit: 138,
		debit: 190,
	},
	{
		date: "2024-04-17",
		credit: 446,
		debit: 360,
	},
	{
		date: "2024-04-18",
		credit: 364,
		debit: 410,
	},
	{
		date: "2024-04-19",
		credit: 243,
		debit: 180,
	},
	{
		date: "2024-04-20",
		credit: 89,
		debit: 150,
	},
	{
		date: "2024-04-21",
		credit: 137,
		debit: 200,
	},
	{
		date: "2024-04-22",
		credit: 224,
		debit: 170,
	},
	{
		date: "2024-04-23",
		credit: 138,
		debit: 230,
	},
	{
		date: "2024-04-24",
		credit: 387,
		debit: 290,
	},
	{
		date: "2024-04-25",
		credit: 215,
		debit: 250,
	},
	{
		date: "2024-04-26",
		credit: 75,
		debit: 130,
	},
	{
		date: "2024-04-27",
		credit: 383,
		debit: 420,
	},
	{
		date: "2024-04-28",
		credit: 122,
		debit: 180,
	},
	{
		date: "2024-04-29",
		credit: 315,
		debit: 240,
	},
	{
		date: "2024-04-30",
		credit: 454,
		debit: 380,
	},
	{
		date: "2024-05-01",
		credit: 165,
		debit: 220,
	},
	{
		date: "2024-05-02",
		credit: 293,
		debit: 310,
	},
	{
		date: "2024-05-03",
		credit: 247,
		debit: 190,
	},
	{
		date: "2024-05-04",
		credit: 385,
		debit: 420,
	},
	{
		date: "2024-05-05",
		credit: 481,
		debit: 390,
	},
	{
		date: "2024-05-06",
		credit: 498,
		debit: 520,
	},
	{
		date: "2024-05-07",
		credit: 388,
		debit: 300,
	},
	{
		date: "2024-05-08",
		credit: 149,
		debit: 210,
	},
	{
		date: "2024-05-09",
		credit: 227,
		debit: 180,
	},
	{
		date: "2024-05-10",
		credit: 293,
		debit: 330,
	},
	{
		date: "2024-05-11",
		credit: 335,
		debit: 270,
	},
	{
		date: "2024-05-12",
		credit: 197,
		debit: 240,
	},
	{
		date: "2024-05-13",
		credit: 197,
		debit: 160,
	},
	{
		date: "2024-05-14",
		credit: 448,
		debit: 490,
	},
	{
		date: "2024-05-15",
		credit: 473,
		debit: 380,
	},
	{
		date: "2024-05-16",
		credit: 338,
		debit: 400,
	},
	{
		date: "2024-05-17",
		credit: 499,
		debit: 420,
	},
	{
		date: "2024-05-18",
		credit: 315,
		debit: 350,
	},
	{
		date: "2024-05-19",
		credit: 235,
		debit: 180,
	},
	{
		date: "2024-05-20",
		credit: 177,
		debit: 230,
	},
	{
		date: "2024-05-21",
		credit: 82,
		debit: 140,
	},
	{
		date: "2024-05-22",
		credit: 81,
		debit: 120,
	},
	{
		date: "2024-05-23",
		credit: 252,
		debit: 290,
	},
	{
		date: "2024-05-24",
		credit: 294,
		debit: 220,
	},
	{
		date: "2024-05-25",
		credit: 201,
		debit: 250,
	},
	{
		date: "2024-05-26",
		credit: 213,
		debit: 170,
	},
	{
		date: "2024-05-27",
		credit: 420,
		debit: 460,
	},
	{
		date: "2024-05-28",
		credit: 233,
		debit: 190,
	},
	{
		date: "2024-05-29",
		credit: 78,
		debit: 130,
	},
	{
		date: "2024-05-30",
		credit: 340,
		debit: 280,
	},
	{
		date: "2024-05-31",
		credit: 178,
		debit: 230,
	},
	{
		date: "2024-06-01",
		credit: 178,
		debit: 200,
	},
	{
		date: "2024-06-02",
		credit: 470,
		debit: 410,
	},
	{
		date: "2024-06-03",
		credit: 103,
		debit: 160,
	},
	{
		date: "2024-06-04",
		credit: 439,
		debit: 380,
	},
	{
		date: "2024-06-05",
		credit: 88,
		debit: 140,
	},
	{
		date: "2024-06-06",
		credit: 294,
		debit: 250,
	},
	{
		date: "2024-06-07",
		credit: 323,
		debit: 370,
	},
	{
		date: "2024-06-08",
		credit: 385,
		debit: 320,
	},
	{
		date: "2024-06-09",
		credit: 438,
		debit: 480,
	},
	{
		date: "2024-06-10",
		credit: 155,
		debit: 200,
	},
	{
		date: "2024-06-11",
		credit: 92,
		debit: 150,
	},
	{
		date: "2024-06-12",
		credit: 492,
		debit: 420,
	},
	{
		date: "2024-06-13",
		credit: 81,
		debit: 130,
	},
	{
		date: "2024-06-14",
		credit: 426,
		debit: 380,
	},
	{
		date: "2024-06-15",
		credit: 307,
		debit: 350,
	},
	{
		date: "2024-06-16",
		credit: 371,
		debit: 310,
	},
	{
		date: "2024-06-17",
		credit: 475,
		debit: 520,
	},
	{
		date: "2024-06-18",
		credit: 107,
		debit: 170,
	},
	{
		date: "2024-06-19",
		credit: 341,
		debit: 290,
	},
	{
		date: "2024-06-20",
		credit: 408,
		debit: 450,
	},
	{
		date: "2024-06-21",
		credit: 169,
		debit: 210,
	},
	{
		date: "2024-06-22",
		credit: 317,
		debit: 270,
	},
	{
		date: "2024-06-23",
		credit: 480,
		debit: 530,
	},
	{
		date: "2024-06-24",
		credit: 132,
		debit: 180,
	},
	{
		date: "2024-06-25",
		credit: 141,
		debit: 190,
	},
	{
		date: "2024-06-26",
		credit: 434,
		debit: 380,
	},
	{
		date: "2024-06-27",
		credit: 448,
		debit: 490,
	},
	{
		date: "2024-06-28",
		credit: 149,
		debit: 200,
	},
	{
		date: "2024-06-29",
		credit: 103,
		debit: 160,
	},
	{
		date: "2024-06-30",
		credit: 446,
		debit: 400,
	},
];

const chartConfig = {
	views: {
		label: "Amount",
	},
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
	const { data } = useQuery({
		queryKey: ["tr", "agg"],
		queryFn: async () => {
			const res = await db.rpc("get_transaction_summary", {
				start_date: "2025-08-01",
				end_date: "2025-08-31",
			});
			console.log(res.data);
			if (res.error) {
				console.log(res.error);
			}
			console.log(res.data);
			return res.data.map((x: any) => ({
				date: x.day,
				credit: x.credit,
				debit: x.debit,
			}));
		},
	});
	return <GenericTransactionBarChart data={data ?? []} />;
}

export function GenericTransactionBarChart({ data }: { data: any[] }) {
	const [activeChart, setActiveChart] =
		React.useState<keyof typeof chartConfig>("credit");

	const total = React.useMemo(
		() => ({
			credit: data.reduce((acc, curr) => acc + curr.credit, 0),
			debit: data.reduce((acc, curr) => acc + curr.debit, 0),
		}),
		[data],
	);

	return (
		<Card className="py-0">
			<CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 pt-4 sm:!py-0">
					<CardTitle className="font-normal">
						Daily transactions
					</CardTitle>
					<CardDescription>
						Showing all transactions for the past 30 days
					</CardDescription>
				</div>
				<div className="flex">
					{["credit", "debit"].map(key => {
						const chart = key as keyof typeof chartConfig;
						return (
							<button
								key={chart}
								data-active={activeChart === chart}
								className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
								onClick={() => setActiveChart(chart)}>
								<span className="text-muted-foreground text-xs">
									{chartConfig[chart].label}
								</span>
								<span className="text-lg font-bold leading-none sm:text-3xl">
									{total[
										key as keyof typeof total
									].toLocaleString()}
								</span>
							</button>
						);
					})}
				</div>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full">
					<BarChart
						accessibilityLayer
						data={data}
						margin={{
							left: 12,
							right: 12,
						}}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
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
									nameKey="views"
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
						<Bar
							dataKey={activeChart}
							fill={`var(--color-${activeChart})`}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
