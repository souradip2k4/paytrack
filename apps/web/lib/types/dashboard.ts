import { z } from "zod";

export const DataSourceSchema = z.enum([
	"transaction_distribution_category",
	"transaction_distribution_status",
]);
export type DataSource = z.infer<typeof DataSourceSchema>;

export const ChartTypeSchema = z.enum(["bar", "line", "donut", "number"]);
export type ChartType = z.infer<typeof ChartTypeSchema>;

export const AggregationSchema = z.enum(["sum", "avg", "count", "min", "max"]);
export type Aggregation = z.infer<typeof AggregationSchema>;

export const MetricSchema = z.enum(["credit", "debit", "balance"]);
export type Metric = z.infer<typeof MetricSchema>;

export const IntervalSchema = z.enum(["day", "week", "month"]);
export type Interval = z.infer<typeof IntervalSchema>;

export const WidgetLayoutSchema = z.object({
	x: z.number(),
	y: z.number(),
	w: z.number(),
	h: z.number(),
	minW: z.number().optional(),
	minH: z.number().optional(),
});
export type WidgetLayout = z.infer<typeof WidgetLayoutSchema>;

export const WidgetConfigSchema = z.object({
	id: z.string(),
	title: z.string(),
	chartType: ChartTypeSchema,
	dataSource: DataSourceSchema,
	metric: MetricSchema,
	aggregation: AggregationSchema.optional(),
	interval: IntervalSchema.optional(),
	layout: WidgetLayoutSchema,
});
export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

export const DashboardViewSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1),
	widgets: z.array(WidgetConfigSchema),
	is_default: z.boolean().optional(),
});
export type DashboardView = z.infer<typeof DashboardViewSchema>;
