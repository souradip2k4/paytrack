"use client";

import { formatRate } from "@/lib/currencies";
import {
	getHistoricalRateDomain,
	getHistoricalRateStats,
	type HistoricalRatePoint,
} from "@/lib/historical-rates";
import { useId } from "react";
import { Area, AreaChart, Tooltip, YAxis } from "recharts";

function SparklineTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ payload: HistoricalRatePoint }>;
}) {
	if (!active || !payload?.[0]) return null;
	const point = payload[0].payload;
	const date = new Date(point.date + "T00:00:00");

	return (
		<div className="bg-popover text-popover-foreground rounded-md border px-3 py-1.5 text-xs shadow-md">
			<p className="text-muted-foreground">
				{date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				})}
			</p>
			<p className="font-mono font-medium">{formatRate(point.rate)}</p>
		</div>
	);
}

export function Sparkline({
	data,
	width = 200,
	height = 56,
	className,
}: {
	data: HistoricalRatePoint[];
	width?: number;
	height?: number;
	className?: string;
}) {
	const gradientId = useId();

	if (data.length < 2) return null;

	const stats = getHistoricalRateStats(data);
	if (!stats) return null;

	const domain = getHistoricalRateDomain(data, {
		paddingRatio: 0.3,
		minPaddingRatio: 0.002,
	});
	const color =
		stats.isFlat ? "#94a3b8"
		: stats.isUp ? "#22c55e"
		: "#ef4444";

	return (
		<div className={className}>
			<AreaChart
				width={width}
				height={height}
				data={data}
				margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={color} stopOpacity={0.3} />
						<stop offset="95%" stopColor={color} stopOpacity={0} />
					</linearGradient>
				</defs>
				<YAxis hide domain={domain} />
				<Tooltip
					content={<SparklineTooltip />}
					cursor={{ stroke: color, strokeOpacity: 0.3 }}
					allowEscapeViewBox={{ x: true, y: true }}
				/>
				<Area
					type="monotone"
					dataKey="rate"
					stroke={color}
					strokeWidth={2}
					fill={`url(#${gradientId})`}
					baseValue={domain[0]}
					dot={false}
					isAnimationActive={false}
					activeDot={{
						r: 3,
						fill: color,
						stroke: "var(--background)",
						strokeWidth: 1.5,
					}}
				/>
			</AreaChart>
		</div>
	);
}
