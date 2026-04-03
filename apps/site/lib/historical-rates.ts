export type HistoricalRatePoint = {
	date: string;
	rate: number;
};

export type HistoricalRateStats = {
	first: number;
	latest: number;
	high: number;
	low: number;
	change: number;
	changePct: number;
	isUp: boolean;
	isFlat: boolean;
};

export function getHistoricalRateStats(
	data: HistoricalRatePoint[],
): HistoricalRateStats | null {
	if (data.length === 0) return null;

	const rates = data.map(point => point.rate);
	const first = data[0]!.rate;
	const latest = data[data.length - 1]!.rate;
	const high = Math.max(...rates);
	const low = Math.min(...rates);
	const change = latest - first;
	const changePct = first === 0 ? 0 : (change / first) * 100;

	return {
		first,
		latest,
		high,
		low,
		change,
		changePct,
		isUp: change > 0,
		isFlat: change === 0,
	};
}

/**
 * Pads the Y domain so narrow rate moves still read as movement without
 * implying impossible negative exchange rates.
 */
export function getHistoricalRateDomain(
	data: HistoricalRatePoint[],
	{
		paddingRatio = 0.18,
		minPaddingRatio = 0.0015,
	}: {
		paddingRatio?: number;
		minPaddingRatio?: number;
	} = {},
): [number, number] {
	if (data.length === 0) return [0, 1];

	const rates = data.map(point => point.rate);
	const low = Math.min(...rates);
	const high = Math.max(...rates);
	const span = high - low;
	const padding = Math.max(
		span * paddingRatio,
		high * minPaddingRatio,
		0.0001,
	);

	return [Math.max(0, low - padding), high + padding];
}

export function formatSignedRateChange(changePct: number): string {
	return `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`;
}
