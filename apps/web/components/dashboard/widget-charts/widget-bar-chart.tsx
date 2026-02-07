"use client";

import { COLORS, getColor, getColorByIdx } from "@/lib/hash";
import { useCategoryMap } from "@/lib/query";
import type { WidgetDataRow } from "@/lib/query/dashboard-queries";
import type { WidgetConfig } from "@/lib/types/dashboard";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@budgetbee/ui/core/chart";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const STATUS_COLORS: Record<string, string> = {
	paid: "#10b981",
	pending: "#f59e0b",
	overdue: "#ef4444",
};

interface WidgetBarChartProps {
	data: WidgetDataRow[];
	widget: WidgetConfig;
}

export function WidgetBarChart({ data, widget }: WidgetBarChartProps) {
	const { resolvedTheme } = useTheme();
	const categoryMap = useCategoryMap();

	const { chartData, metricIds } = React.useMemo(() => {
		if (!data || data.length === 0) return { chartData: [], metricIds: [] };

		const ids = new Set<string>();
		const grouped: Record<string, Record<string, number>> = {};

		for (const row of data) {
			const periodKey = format(new Date(row.period), "yyyy-MM-dd");
			if (!grouped[periodKey]) grouped[periodKey] = {};
			const id = row.metric ?? "Other";
			ids.add(id);
			grouped[periodKey][id] =
				(grouped[periodKey][id] || 0) + Math.abs(Number(row.aggregate));
		}

		const periods = Object.keys(grouped).sort();
		if (periods.length === 0) return { chartData: [], metricIds: [] };

		const allIds = Array.from(ids);
		const result = periods.map(periodKey => {
			const entry: Record<string, any> = { period: periodKey };
			for (const id of allIds) entry[id] = grouped[periodKey]?.[id] ?? 0;
			return entry;
		});

		return { chartData: result, metricIds: allIds };
	}, [data]);

	const chartConfig = React.useMemo(() => {
		const cfg: Record<string, { label: string; color: string }> = {};
		for (const id of metricIds) {
			const cat = categoryMap.get(id);
			cfg[id] = {
				label: cat?.name || id,
				color: "var(--chart-1)",
			};
		}
		return cfg satisfies ChartConfig;
	}, [metricIds, categoryMap]);

	if (chartData.length === 0) {
		return (
			<div className="text-muted-foreground flex h-full items-center justify-center">
				<p className="text-sm">No data available</p>
			</div>
		);
	}

	return (
		<ChartContainer config={chartConfig} className="h-full w-full">
			<BarChart data={chartData}>
				<CartesianGrid vertical={false} />
				<YAxis
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					tickFormatter={(value: number) => {
						if (Number.isNaN(value)) return "";
						return Intl.NumberFormat("en-US", {
							notation: "compact",
							maximumFractionDigits: 1,
						}).format(value);
					}}
				/>
				<XAxis
					dataKey="period"
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
							labelFormatter={(value: string) =>
								new Date(value).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})
							}
						/>
					}
				/>
				{metricIds.map((id, i) => {
					const isStatusMetric =
						widget.dataSource === "transaction_distribution_status";
					const statusColor = STATUS_COLORS[id.toLowerCase()];

					let fill: string;
					if (isStatusMetric && statusColor) {
						fill = statusColor;
					} else {
						const cat = categoryMap.get(id);
						const colorObj =
							cat?.color ?
								getColor(cat.color, resolvedTheme || "light")
							:	getColorByIdx(
									i % COLORS.length,
									resolvedTheme || "light",
								);
						fill = colorObj?.text || "var(--chart-1)";
					}

					const cat = categoryMap.get(id);
					return (
						<Bar
							key={id}
							name={cat?.name || id}
							stackId="a"
							dataKey={id}
							fill={fill}
							className="stroke-card"
							strokeWidth={1}
						/>
					);
				})}
			</BarChart>
		</ChartContainer>
	);
}
