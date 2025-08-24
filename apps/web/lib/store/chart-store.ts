import { endOfMonth, format, startOfMonth } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChartStore = {
	tr_chart_type: "bar" | "line";
	tr_chart_metric: "credit" | "debit" | "balance";
	tr_chart_grouping: boolean;
	tr_chart_reverse_order: boolean;
	tr_chart_date_start: string;
	tr_chart_date_end: string;
};

export const useChartStore = create<ChartStore>()(
	persist(
		(set, get) => ({
			tr_chart_type: "bar",
			tr_chart_metric: "credit",
			tr_chart_grouping: false,
			tr_chart_reverse_order: false,
			tr_chart_date_start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
			tr_chart_date_end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
		}),
		{ name: "chart::config" },
	),
);
