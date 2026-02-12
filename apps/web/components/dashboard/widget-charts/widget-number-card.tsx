"use client";

import type { WidgetStatRow } from "@/lib/query/dashboard-queries";
import type { WidgetConfig } from "@/lib/types/dashboard";
import * as React from "react";

interface WidgetNumberCardProps {
	stat: WidgetStatRow;
	widget: WidgetConfig;
}

export function WidgetNumberCard({ stat, widget }: WidgetNumberCardProps) {
	const formatted = React.useMemo(() => {
		const value = Number(stat.aggregate);
		if (widget.aggregation === "count") {
			return Intl.NumberFormat("en-US", {
				maximumFractionDigits: 0,
			}).format(value);
		}
		return Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
			value,
		);
	}, [stat.aggregate, widget.aggregation]);

	const label = React.useMemo(() => {
		const parts: string[] = [];
		if (widget.aggregation) {
			parts.push(
				widget.aggregation.charAt(0).toUpperCase() +
					widget.aggregation.slice(1),
			);
		}
		parts.push(
			widget.metric.charAt(0).toUpperCase() + widget.metric.slice(1),
		);
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
