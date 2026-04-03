"use client";

import { formatRate, FRANKFURTER_CURRENCIES } from "@/lib/currencies";
import {
	formatSignedRateChange,
	getHistoricalRateDomain,
	getHistoricalRateStats,
	type HistoricalRatePoint,
} from "@/lib/historical-rates";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { ArrowDown, ArrowUp, Loader2, Minus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	getHistoricalPeriodDays,
	HISTORICAL_PERIODS,
	useHistoricalPeriodQueryState,
} from "./query-state";

function useHistoricalRate(base: string, target: string, days: number) {
	const [data, setData] = useState<HistoricalRatePoint[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (
			!FRANKFURTER_CURRENCIES.has(base) ||
			!FRANKFURTER_CURRENCIES.has(target)
		) {
			setData(null);
			setError(
				"Historical data is not available for this currency pair.",
			);
			setLoading(false);
			return;
		}

		const controller = new AbortController();
		setLoading(true);
		setError(null);
		setData(null);

		fetch(
			`/api/currency/history?base=${encodeURIComponent(base)}&target=${encodeURIComponent(target)}&days=${days}`,
			{ signal: controller.signal },
		)
			.then(res => {
				if (!res.ok) throw new Error("Failed to fetch historical data");
				return res.json();
			})
			.then((json: { rates: Record<string, Record<string, number>> }) => {
				const points = Object.entries(json.rates)
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([date, rates]) => ({
						date,
						rate: rates[target]!,
					}));
				setData(points);
				setLoading(false);
			})
			.catch((err: Error) => {
				if (err.name === "AbortError") return;
				setError(err.message);
				setLoading(false);
			});

		return () => controller.abort();
	}, [base, target, days]);

	return { data, loading, error };
}

function formatXTick(dateStr: string, totalDays: number): string {
	const date = new Date(`${dateStr}T00:00:00`);
	const month = date.toLocaleDateString("en-US", { month: "short" });
	const day = date.getDate();

	if (totalDays <= 90) return `${month} ${day}`;

	const year = date.getFullYear().toString().slice(2);
	return `${month} '${year}`;
}

function ChartTooltip({
	active,
	payload,
	base,
	target,
}: {
	active?: boolean;
	payload?: Array<{ payload: HistoricalRatePoint }>;
	base: string;
	target: string;
}) {
	if (!active || !payload?.[0]) return null;
	const point = payload[0].payload;
	const date = new Date(`${point.date}T00:00:00`);

	return (
		<div className="bg-popover text-popover-foreground rounded-lg border px-4 py-2.5 shadow-lg">
			<p className="text-muted-foreground text-xs">
				{date.toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				})}
			</p>
			<p className="mt-1 font-mono text-sm font-semibold">
				1 {base} = {formatRate(point.rate)} {target}
			</p>
		</div>
	);
}

function RateChart({
	data,
	periodDays,
	base,
	target,
}: {
	data: HistoricalRatePoint[];
	periodDays: number;
	base: string;
	target: string;
}) {
	const gradientId = useId();

	if (data.length < 2) return null;

	const stats = getHistoricalRateStats(data);
	if (!stats) return null;

	const color =
		stats.isFlat ? "#94a3b8"
		: stats.isUp ? "#16a34a"
		: "#dc2626";
	const domain = getHistoricalRateDomain(data);
	const tickCount = Math.min(6, data.length);
	const tickInterval = Math.max(1, Math.floor(data.length / tickCount));

	return (
		<ResponsiveContainer width="100%" height={340}>
			<AreaChart
				data={data}
				margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="5%"
							stopColor={color}
							stopOpacity={0.22}
						/>
						<stop offset="95%" stopColor={color} stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid
					strokeDasharray="3 3"
					strokeOpacity={0.08}
					vertical={false}
				/>
				<XAxis
					dataKey="date"
					tickFormatter={d => formatXTick(d as string, periodDays)}
					interval={tickInterval}
					tick={{
						fontSize: 11,
						fill: "currentColor",
						fillOpacity: 0.45,
					}}
					axisLine={false}
					tickLine={false}
					dy={8}
				/>
				<YAxis
					domain={domain}
					tickFormatter={v => formatRate(v as number)}
					tick={{
						fontSize: 11,
						fill: "currentColor",
						fillOpacity: 0.45,
					}}
					axisLine={false}
					tickLine={false}
					width={68}
					dx={-2}
					tickCount={6}
				/>
				<Tooltip
					content={<ChartTooltip base={base} target={target} />}
					cursor={{
						stroke: color,
						strokeOpacity: 0.3,
						strokeDasharray: "4 4",
					}}
				/>
				<Area
					type="monotone"
					dataKey="rate"
					stroke={color}
					strokeWidth={2.25}
					fill={`url(#${gradientId})`}
					baseValue={domain[0]}
					dot={false}
					activeDot={{
						r: 5,
						fill: color,
						stroke: "var(--background)",
						strokeWidth: 2,
					}}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}

function StatsBar({
	data,
	target,
}: {
	data: HistoricalRatePoint[];
	target: string;
}) {
	const stats = getHistoricalRateStats(data);
	if (!stats) return null;

	return (
		<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			<div className="bg-input/30 border-border rounded-2xl border p-4">
				<p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.12em]">
					Latest
				</p>
				<p className="mt-2 font-mono text-sm font-semibold">
					{formatRate(stats.latest)} {target}
				</p>
			</div>
			<div className="bg-input/30 border-border rounded-2xl border p-4">
				<p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.12em]">
					High
				</p>
				<p className="mt-2 font-mono text-sm font-semibold">
					{formatRate(stats.high)} {target}
				</p>
			</div>
			<div className="bg-input/30 border-border rounded-2xl border p-4">
				<p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.12em]">
					Low
				</p>
				<p className="mt-2 font-mono text-sm font-semibold">
					{formatRate(stats.low)} {target}
				</p>
			</div>
			<div className="bg-input/30 border-border rounded-2xl border p-4">
				<p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.12em]">
					Period change
				</p>
				<p className="mt-2 flex items-center gap-1 font-mono text-sm font-semibold">
					{stats.isFlat ?
						<Minus className="text-muted-foreground h-3.5 w-3.5" />
					: stats.isUp ?
						<ArrowUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
					:	<ArrowDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
					}
					<span
						className={
							stats.isFlat ? "text-foreground"
							: stats.isUp ?
								"text-emerald-600 dark:text-emerald-400"
							:	"text-red-600 dark:text-red-400"
						}>
						{formatSignedRateChange(stats.changePct)}
					</span>
				</p>
			</div>
		</div>
	);
}

export function HistoricalRateChart({
	base,
	target,
}: {
	base: string;
	target: string;
}) {
	const [periodKey, setPeriodKey] = useHistoricalPeriodQueryState("30d");
	const periodDays = getHistoricalPeriodDays(periodKey);
	const { data, loading, error } = useHistoricalRate(
		base,
		target,
		periodDays,
	);

	return (
		<Card className="border-border/60 bg-card/80 gap-0 py-0 shadow-lg shadow-black/5">
			<CardHeader className="border-border/60 gap-4 border-b p-6">
				<div className="space-y-1.5">
					<CardTitle className="text-2xl font-[Instrument_Serif] font-normal">
						Historical rate chart
					</CardTitle>
					<CardDescription className="max-w-2xl text-sm leading-6">
						Review recent movement for {base}/{target} and switch
						between short-term and long-term windows.
					</CardDescription>
				</div>

				<div className="flex flex-wrap gap-2">
					{HISTORICAL_PERIODS.map(period => (
						<Button
							key={period.key}
							type="button"
							variant={
								periodKey === period.key ? "secondary" : "ghost"
							}
							size="sm"
							onClick={() => setPeriodKey(period.key)}
							className="rounded-full px-3 text-xs">
							{period.label}
						</Button>
					))}
				</div>
			</CardHeader>

			<CardContent className="space-y-6 p-6">
				{loading ?
					<div className="text-muted-foreground flex items-center justify-center gap-2 py-24">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Loading historical data...</span>
					</div>
				: error ?
					<div className="text-muted-foreground border-border/60 rounded-2xl border border-dashed py-20 text-center text-sm">
						{error}
					</div>
				: data && data.length >= 2 ?
					<>
						<RateChart
							data={data}
							periodDays={periodDays}
							base={base}
							target={target}
						/>
						<StatsBar data={data} target={target} />
					</>
				:	<div className="text-muted-foreground border-border/60 rounded-2xl border border-dashed py-20 text-center text-sm">
						Not enough data for this period.
					</div>
				}
			</CardContent>
		</Card>
	);
}
