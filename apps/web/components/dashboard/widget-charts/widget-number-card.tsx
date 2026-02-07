"use client";

import type { WidgetConfig } from "@/lib/types/dashboard";
import type { WidgetDataRow } from "@/lib/query/dashboard-queries";
import * as React from "react";

interface WidgetNumberCardProps {
	data: WidgetDataRow[];
	widget: WidgetConfig;
}

export function WidgetNumberCard({ data, widget }: WidgetNumberCardProps) {
	const total = React.useMemo(() => {
		if (!data || data.length === 0) return 0;
		return data.reduce((sum, row) => sum + Math.abs(Number(row.aggregate)), 0);
	}, [data]);

	const formatted = React.useMemo(() => {
		if (widget.aggregation === "count") {
			return Intl.NumberFormat("en-US", {
				maximumFractionDigits: 0,
			}).format(total);
		}
		return Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 2,
		}).format(total);
	}, [total, widget.aggregation]);

	const label = React.useMemo(() => {
		const parts: string[] = [];
		if (widget.aggregation) {
			parts.push(widget.aggregation.charAt(0).toUpperCase() + widget.aggregation.slice(1));
		}
		parts.push(widget.metric.charAt(0).toUpperCase() + widget.metric.slice(1));
		return parts.join(" ");
	}, [widget.aggregation, widget.metric]);

	return (
		<div className="flex h-full flex-col items-center justify-center gap-1">
			<p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
				{label}
			</p>
			<p className="text-3xl font-bold tabular-nums">{formatted}</p>
		</div>
	);
}
