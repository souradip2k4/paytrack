"use client";

import { useDashboardStore } from "@/lib/store";
import type { WidgetConfig } from "@/lib/types/dashboard";
import {
	AggregationSchema,
	ChartTypeSchema,
	DataSourceSchema,
	IntervalSchema,
	MetricSchema,
} from "@/lib/types/dashboard";
import { Button } from "@budgetbee/ui/core/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@budgetbee/ui/core/dialog";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@budgetbee/ui/core/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// UI label: "Metric" - maps to dataSource field
const DATA_SOURCE_OPTIONS = [
	{ value: "transaction_distribution_category", label: "By Category" },
	{ value: "transaction_distribution_status", label: "By Status" },
] as const;

const CHART_TYPES = [
	{ value: "bar", label: "Bar Chart" },
	{ value: "line", label: "Line Chart" },
	{ value: "donut", label: "Donut Chart" },
] as const;

// UI label: "Transaction Type" - maps to metric field
const TRANSACTION_TYPES = [
	{ value: "credit", label: "Credit" },
	{ value: "debit", label: "Debit" },
	{ value: "balance", label: "Balance" },
] as const;

const AGGREGATIONS = [
	{ value: "sum", label: "Sum" },
	{ value: "avg", label: "Average (daily)" },
	{ value: "count", label: "Count" },
	{ value: "min", label: "Min" },
	{ value: "max", label: "Max" },
] as const;

const INTERVALS = [
	{ value: "day", label: "Day" },
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month" },
] as const;

const formSchema = z.object({
	title: z.string().min(1, "Title is required"),
	dataSource: DataSourceSchema,
	chartType: ChartTypeSchema,
	metric: MetricSchema,
	aggregation: AggregationSchema,
	interval: IntervalSchema,
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
	title: "",
	dataSource: "transaction_distribution_category",
	chartType: "bar",
	metric: "balance",
	aggregation: "sum",
	interval: "day",
};

export function WidgetSettingsDialog() {
	const settingsOpen = useDashboardStore((s) => s.settingsOpen);
	const settingsWidget = useDashboardStore((s) => s.settingsWidget);
	const closeWidgetSettings = useDashboardStore((s) => s.closeWidgetSettings);
	const saveWidget = useDashboardStore((s) => s.saveWidget);

	const titleInputId = React.useId();
	const metricSelectId = React.useId();
	const chartTypeSelectId = React.useId();
	const transactionTypeSelectId = React.useId();
	const aggregationSelectId = React.useId();
	const intervalSelectId = React.useId();

	const {
		reset,
		control,
		handleSubmit,
		register,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	React.useEffect(() => {
		if (settingsOpen) {
			if (settingsWidget) {
				reset({
					title: settingsWidget.title,
					dataSource: settingsWidget.dataSource,
					chartType: settingsWidget.chartType,
					metric: settingsWidget.metric,
					aggregation: settingsWidget.aggregation ?? "sum",
					interval: settingsWidget.interval,
				});
			} else {
				reset(defaultValues);
			}
		}
	}, [settingsOpen, settingsWidget, reset]);

	const onSubmit = (data: FormValues) => {
		const config: WidgetConfig = {
			id: settingsWidget?.id ?? nanoid(12),
			title: data.title,
			dataSource: data.dataSource,
			chartType: data.chartType,
			metric: data.metric,
			aggregation: data.aggregation,
			interval: data.interval,
			layout: settingsWidget?.layout ?? {
				x: 0,
				y: Infinity,
				w: 6,
				h: 4,
				minW: 2,
				minH: 2,
			},
		};

		saveWidget(config);
		closeWidgetSettings();
	};

	return (
		<Dialog open={settingsOpen} onOpenChange={(open) => !open && closeWidgetSettings()}>
			<DialogContent className="gap-0 p-0">
				<form className="contents" onSubmit={handleSubmit(onSubmit)}>
					<DialogHeader className="border-b p-4 px-6">
						<DialogTitle className="font-normal">
							{settingsWidget ? "Edit Widget" : "Add Widget"}
						</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-4 p-6">
						{/* TITLE INPUT */}
						<div className="flex flex-col gap-2">
							<Label htmlFor={titleInputId} className="text-muted-foreground">
								Title
							</Label>
							<Input
								id={titleInputId}
								placeholder="e.g. Monthly Expenses"
								{...register("title")}
							/>
							{errors.title && (
								<p className="text-destructive text-sm">
									{errors.title.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-x-2 gap-y-4">
							{/* METRIC SELECT (dataSource field) */}
							<div className="flex flex-col gap-2">
								<Label
									htmlFor={metricSelectId}
									className="text-muted-foreground">
									Metric
								</Label>
								<Controller
									name="dataSource"
									control={control}
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id={metricSelectId} className="w-full">
												<SelectValue placeholder="Select metric" />
											</SelectTrigger>
											<SelectContent>
												{DATA_SOURCE_OPTIONS.map((item) => (
													<SelectItem key={item.value} value={item.value}>
														{item.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.dataSource && (
									<p className="text-destructive text-sm">
										{errors.dataSource.message}
									</p>
								)}
							</div>

							{/* CHART TYPE SELECT */}
							<div className="flex flex-col gap-2">
								<Label
									htmlFor={chartTypeSelectId}
									className="text-muted-foreground">
									Chart Type
								</Label>
								<Controller
									name="chartType"
									control={control}
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id={chartTypeSelectId} className="w-full">
												<SelectValue placeholder="Select chart type" />
											</SelectTrigger>
											<SelectContent>
												{CHART_TYPES.map((item) => (
													<SelectItem key={item.value} value={item.value}>
														{item.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.chartType && (
									<p className="text-destructive text-sm">
										{errors.chartType.message}
									</p>
								)}
							</div>

							{/* TRANSACTION TYPE SELECT (metric field) */}
							<div className="flex flex-col gap-2">
								<Label
									htmlFor={transactionTypeSelectId}
									className="text-muted-foreground">
									Transaction Type
								</Label>
								<Controller
									name="metric"
									control={control}
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id={transactionTypeSelectId} className="w-full">
												<SelectValue placeholder="Select transaction type" />
											</SelectTrigger>
											<SelectContent>
												{TRANSACTION_TYPES.map((item) => (
													<SelectItem key={item.value} value={item.value}>
														{item.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.metric && (
									<p className="text-destructive text-sm">
										{errors.metric.message}
									</p>
								)}
							</div>

							{/* AGGREGATION SELECT */}
							<div className="flex flex-col gap-2">
								<Label
									htmlFor={aggregationSelectId}
									className="text-muted-foreground">
									Aggregation
								</Label>
								<Controller
									name="aggregation"
									control={control}
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id={aggregationSelectId} className="w-full">
												<SelectValue placeholder="Select aggregation" />
											</SelectTrigger>
											<SelectContent>
												{AGGREGATIONS.map((item) => (
													<SelectItem key={item.value} value={item.value}>
														{item.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.aggregation && (
									<p className="text-destructive text-sm">
										{errors.aggregation.message}
									</p>
								)}
							</div>

							{/* INTERVAL SELECT */}
							<div className="col-span-2 flex flex-col gap-2">
								<Label
									htmlFor={intervalSelectId}
									className="text-muted-foreground">
									Interval
								</Label>
								<Controller
									name="interval"
									control={control}
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger id={intervalSelectId} className="w-full">
												<SelectValue placeholder="Select interval" />
											</SelectTrigger>
											<SelectContent>
												{INTERVALS.map((item) => (
													<SelectItem key={item.value} value={item.value}>
														{item.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.interval && (
									<p className="text-destructive text-sm">
										{errors.interval.message}
									</p>
								)}
							</div>
						</div>
					</div>

					<DialogFooter className="border-t p-3">
						<Button type="submit" size="sm">
							{settingsWidget ? "Save" : "Add Widget"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
