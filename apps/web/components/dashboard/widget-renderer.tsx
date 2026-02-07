"use client";

import type { WidgetConfig } from "@/lib/types/dashboard";
import { useWidgetData, useWidgetStat } from "@/lib/query/dashboard-queries";
import { WidgetBarChart } from "./widget-charts/widget-bar-chart";
import { WidgetLineChart } from "./widget-charts/widget-line-chart";
import { WidgetDonutChart } from "./widget-charts/widget-donut-chart";
import { WidgetNumberCard } from "./widget-charts/widget-number-card";
import { LoaderCircle } from "lucide-react";

interface WidgetRendererProps {
	widget: WidgetConfig;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
	if (widget.chartType === "number") {
		return <NumberWidgetRenderer widget={widget} />;
	}

	return <ChartWidgetRenderer widget={widget} />;
}

function ChartWidgetRenderer({ widget }: WidgetRendererProps) {
	const { data, isLoading, error } = useWidgetData(widget);

	if (isLoading) {
		return <WidgetLoading />;
	}

	if (error || !data || data.length === 0) {
		return <WidgetEmpty error={!!error} />;
	}

	switch (widget.chartType) {
		case "bar":
			return <WidgetBarChart data={data} widget={widget} />;
		case "line":
			return <WidgetLineChart data={data} widget={widget} />;
		case "donut":
			return <WidgetDonutChart data={data} widget={widget} />;
		default:
			return (
				<div className="text-muted-foreground flex h-full items-center justify-center">
					<p className="text-sm">Unknown chart type</p>
				</div>
			);
	}
}

function NumberWidgetRenderer({ widget }: WidgetRendererProps) {
	const { data, isLoading, error } = useWidgetStat(widget);

	if (isLoading) {
		return <WidgetLoading />;
	}

	if (error || !data) {
		return <WidgetEmpty error={!!error} />;
	}

	return <WidgetNumberCard stat={data} widget={widget} />;
}

function WidgetLoading() {
	return (
		<div className="text-muted-foreground flex h-full items-center justify-center">
			<LoaderCircle className="size-5 animate-spin" />
		</div>
	);
}

function WidgetEmpty({ error }: { error: boolean }) {
	return (
		<div className="text-muted-foreground flex h-full items-center justify-center">
			<p className="text-sm">{error ? "Failed to load data" : "No data available"}</p>
		</div>
	);
}
