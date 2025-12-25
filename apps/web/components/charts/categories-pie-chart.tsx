"use client";

import { authClient } from "@budgetbee/core/auth-client";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@budgetbee/ui/core/chart";

import { getColor } from "@/lib/hash";
import {
	serializeFilterStack,
	useChartStore,
	useFilterStore,
} from "@/lib/store";
import { cn } from "@budgetbee/ui/lib/utils";
import { getDb } from "@budgetbee/core/db";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import React from "react";
import { Cell, Pie, PieChart } from "recharts";

export const description =
	"Donut chart showing the distribution of transactions by category.";

type PieLabelProps = {
	cx: number;
	cy: number;
	midAngle: number;
	innerRadius: number;
	outerRadius: number;
	percent: number;
	name: string;
};

type PieLabelLineProps = {
	cx: number;
	cy: number;
	midAngle: number;
	innerRadius: number;
	outerRadius: number;
	percent: number;
};

export function CategoriesPieChart() {
	const { data: authData, isPending: isSessionLoading } =
		authClient.useSession();
	const start = useChartStore(s => s.tr_chart_date_start);
	const end = useChartStore(s => s.tr_chart_date_end);
	const filterStack = useFilterStore(s => s.filter_stack);
	const { data: chartData, isLoading: isTransactionsLoading } = useQuery({
		queryKey: [
			"chart",
			"by-cat",
			authData?.user.id,
			start,
			end,
			filterStack,
		],
		queryFn: async () => {
			const db = await getDb();
			const res = await db.rpc("get_transaction_by_category", {
				params: {
					user_id: authData?.user.id,
					organization_id: authData?.session?.activeOrganizationId,
					filters: serializeFilterStack(filterStack),
				},
			});
			if (res.error) throw res.error;
			const mapped = res.data.map((x: any, i: number) => ({
				name: x.name ?? "Uncategorized",
				amount: Math.abs(Number(x.amount)) || 0,
				fill: getColor(x.name ?? "Uncategorized"),
			}));
			return mapped;
		},
		enabled: !isSessionLoading,
	});

	const chartConfig: ChartConfig = React.useMemo(() => {
		const cf: Record<string, { label: string; color: string }> = {};
		for (const x of chartData ?? []) {
			cf[x.name ?? "Uncategorized"] = {
				label: x.name ?? "Uncategorized",
				color: "red",
			};
		}
		return { amount: { label: "Amount" }, ...cf } satisfies ChartConfig;
	}, [chartData]);

	const [activeIdx, setActiveIdx] = React.useState<number | null>(null);

	const label = React.useCallback(
		({ cx, cy, midAngle, outerRadius, percent, name }: PieLabelProps) => {
			if (percent < 0.02) return <></>;
			const RADIAN = Math.PI / 180;
			const radius = outerRadius + 30;
			const x = cx + radius * Math.cos(-midAngle * RADIAN);
			const y = cy + radius * Math.sin(-midAngle * RADIAN);

			return (
				<text
					x={x}
					y={y}
					fill="currentColor"
					textAnchor={x > cx ? "start" : "end"}
					dominantBaseline="central"
					className="text-xs font-medium"
					style={{ transition: "none" }}>
					{`${name} ${(percent * 100).toFixed(0)}%`}
				</text>
			);
		},
		[activeIdx],
	);

	const labelLine = React.useCallback(
		({ cx, cy, midAngle, outerRadius, percent }: PieLabelLineProps) => {
			if (percent < 0.02) return <></>;

			const RADIAN = Math.PI / 180;
			const radius1 = outerRadius + 5;
			const radius2 = outerRadius + 25;
			const x1 = cx + radius1 * Math.cos(-midAngle * RADIAN);
			const y1 = cy + radius1 * Math.sin(-midAngle * RADIAN);
			const x2 = cx + radius2 * Math.cos(-midAngle * RADIAN);
			const y2 = cy + radius2 * Math.sin(-midAngle * RADIAN);

			return (
				<polyline
					points={`${x1},${y1} ${x2},${y2}`}
					className="fill-none stroke-current opacity-60"
					style={{ transition: "none" }}
					strokeWidth={1}
				/>
			);
		},
		[activeIdx],
	);

	return (
		<Card className="py-0">
			<CardHeader className="flex flex-col items-stretch border-b p-4 px-6 !pb-4 sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1">
					<CardTitle className="font-normal">By Category</CardTitle>
				</div>
				<div className="flex">
					{/*<Button
                        size="icon"
                        variant="outline"
                        className="size-8">
                        <Settings2 className="size-4" />
                    </Button>*/}
				</div>
			</CardHeader>

			<CardContent className="pb-6 max-sm:px-2">
				<ChartContainer
					config={chartConfig}
					className="relative aspect-auto h-[320px] w-full">
					{isTransactionsLoading ?
						<div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
							<LoaderCircle className="mx-auto animate-spin" />
						</div>
					: chartData && chartData.length === 0 ?
						<div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
							<p>No data available</p>
						</div>
					:	<PieChart>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel />}
							/>
							<Pie
								data={chartData}
								dataKey="amount"
								nameKey="name"
								label={label}
								labelLine={labelLine}
								innerRadius="60%"
								outerRadius="80%"
								cornerRadius={4}
								paddingAngle={1}
								onMouseEnter={(_, i) => setActiveIdx(i)}
								onMouseLeave={() => setActiveIdx(null)}>
								{chartData?.map((c: any, i: number) => (
									<Cell
										key={`cell-${i}`}
										fill={c.fill}
										className={cn("opacity-30", {
											"opacity-100":
												activeIdx === i ||
												activeIdx === null,
										})}
									/>
								))}
							</Pie>

							<ChartLegend
								content={<ChartLegendContent nameKey="name" />}
								className="mt-6 -translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
							/>
						</PieChart>
					}
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
