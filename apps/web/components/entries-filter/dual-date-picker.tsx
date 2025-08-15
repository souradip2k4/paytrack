"use client";

import { useStore } from "@/lib/store";
import {
	endOfMonth,
	endOfYear,
	startOfMonth,
	startOfYear,
	subDays,
	subYears,
} from "date-fns";
import React from "react";
import { type DateRange } from "react-day-picker";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Separator } from "../ui/separator";

export function DualDatePicker() {
	const from = useStore(s => s.filter_date_from);
	const to = useStore(s => s.filter_date_to);
	const range = React.useMemo<DateRange>(
		() => ({
			from,
			to,
		}),
		[from, to],
	);
	const setFilterDateFrom = useStore(s => s.set_filter_date_from);
	const setFilterDateTo = useStore(s => s.set_filter_date_to);

	const today = new Date();

	const setXDaysBack = (x: number) => {
		setFilterDateFrom(subDays(today, x));
		setFilterDateTo(today);
	};

	return (
		<div className="flex">
			<div className="flex flex-col pt-8">
				<Button
					variant="ghost"
					className="w-full justify-start"
					onClick={() => {
						setFilterDateFrom(today);
						setFilterDateTo(today);
					}}
					size="sm">
					Today
				</Button>
				<Button
					variant="ghost"
					className="w-full justify-start"
					onClick={() => setXDaysBack(7)}
					size="sm">
					Last 7 days
				</Button>
				<Button
					variant="ghost"
					className="w-full justify-start"
					onClick={() => setXDaysBack(30)}
					size="sm">
					Last 30 days
				</Button>
				<Button
					variant="ghost"
					className="w-full justify-start"
					onClick={() => {
						setFilterDateFrom(startOfMonth(today));
						setFilterDateTo(endOfMonth(today));
					}}
					size="sm">
					This month
				</Button>
				<Button
					variant="ghost"
					className="w-full justify-start"
					onClick={() => {
						setFilterDateFrom(startOfYear(today));
						setFilterDateTo(endOfYear(today));
					}}
					size="sm">
					This year
				</Button>
				<Button
					variant="ghost"
					className="w-full justify-start"
					onClick={() => {
						const year = today.getUTCFullYear();
						const lastYear = subYears(year, 1);
						setFilterDateFrom(startOfYear(lastYear));
						setFilterDateTo(endOfYear(lastYear));
					}}
					size="sm">
					Last year
				</Button>
			</div>
			<Separator orientation="vertical" />
			<Calendar
				mode="range"
				selected={range}
				numberOfMonths={2}
				onSelect={e => {
					if (!e) return;
					if (e.to) setFilterDateTo(e.to);
					if (e.from) setFilterDateFrom(e.from);
				}}
			/>
		</div>
	);
}
