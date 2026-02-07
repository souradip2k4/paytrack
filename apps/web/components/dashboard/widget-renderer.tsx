"use client";

import type { WidgetConfig } from "@/lib/types/dashboard";
import { useWidgetData } from "@/lib/query/dashboard-queries";
import { WidgetBarChart } from "./widget-charts/widget-bar-chart";
import { WidgetLineChart } from "./widget-charts/widget-line-chart";
import { WidgetDonutChart } from "./widget-charts/widget-donut-chart";
import { LoaderCircle } from "lucide-react";

interface WidgetRendererProps {
	widget: WidgetConfig;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
	const { data, isLoading, error } = useWidgetData(widget);

	if (isLoading) {
		return (
			<div className="text-muted-foreground flex h-full items-center justify-center">
				<LoaderCircle className="size-5 animate-spin" />
			</div>
		);
	}

	if (error || !data || data.length === 0) {
		return (
			<div className="text-muted-foreground flex h-full items-center justify-center">
				<p className="text-sm">{error ? "Failed to load data" : "No data available"}</p>
			</div>
		);
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
