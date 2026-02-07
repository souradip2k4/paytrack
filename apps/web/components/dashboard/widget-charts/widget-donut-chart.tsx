"use client";

import { getColor, getColorByIdx, COLORS } from "@/lib/hash";
import { useCategoryMap } from "@/lib/query";
import type { WidgetConfig } from "@/lib/types/dashboard";
import type { WidgetDataRow } from "@/lib/query/dashboard-queries";

const STATUS_COLORS: Record<string, string> = {
	paid: "#10b981",
	pending: "#f59e0b",
	overdue: "#ef4444",
};
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@budgetbee/ui/core/chart";
import { useTheme } from "next-themes";
import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";

interface WidgetDonutChartProps {
	data: WidgetDataRow[];
	widget: WidgetConfig;
}

export function WidgetDonutChart({ data, widget }: WidgetDonutChartProps) {
	const { resolvedTheme } = useTheme();
	const categoryMap = useCategoryMap();

	const processedData = React.useMemo(() => {
		if (!data || data.length === 0) return [];

		const isStatusMetric = widget.dataSource === "transaction_distribution_status";

		// Aggregate by metric (category_id or status) across all time periods
		const grouped: Record<string, number> = {};
		for (const row of data) {
			const key = row.metric ?? "Other";
			grouped[key] = (grouped[key] || 0) + Math.abs(Number(row.aggregate));
		}

		return Object.entries(grouped).map(([metricId, amount], i) => {
			const statusColor = STATUS_COLORS[metricId.toLowerCase()];

			let fill: string;
			if (isStatusMetric && statusColor) {
				fill = statusColor;
			} else {
				const cat = categoryMap.get(metricId);
				const colorObj = cat?.color
					? getColor(cat.color, resolvedTheme || "light")
					: getColorByIdx(i % COLORS.length, resolvedTheme || "light");
				fill = colorObj?.text || "var(--chart-1)";
			}

			const cat = categoryMap.get(metricId);
			return {
				name: cat?.name ?? metricId,
				metricId,
				amount,
				fill,
			};
		});
	}, [data, categoryMap, resolvedTheme, widget.dataSource]);

	const chartConfig = React.useMemo(() => {
		const cfg: Record<string, { label: string; color: string }> = {};
		for (const x of processedData) {
			cfg[x.name] = { label: x.name, color: x.fill };
		}
		return { amount: { label: "Amount" }, ...cfg } satisfies ChartConfig;
	}, [processedData]);

	if (processedData.length === 0) {
		return (
			<div className="text-muted-foreground flex h-full items-center justify-center">
				<p className="text-sm">No data available</p>
			</div>
		);
	}

	return (
		<ChartContainer config={chartConfig} className="h-full w-full">
			<PieChart>
				<ChartTooltip
					cursor={false}
					content={<ChartTooltipContent hideLabel />}
				/>
				<Pie
					data={processedData}
					dataKey="amount"
					nameKey="name"
					innerRadius="55%"
					outerRadius="80%"
					cornerRadius={2}
					paddingAngle={1}
				>
					{processedData.map((entry, i) => (
						<Cell key={`cell-${i}`} fill={entry.fill} />
					))}
				</Pie>
				<ChartLegend
					content={<ChartLegendContent nameKey="name" />}
					className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
				/>
			</PieChart>
		</ChartContainer>
	);
}
