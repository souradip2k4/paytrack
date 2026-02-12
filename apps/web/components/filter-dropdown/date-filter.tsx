"use client";

import { FilterFields, useFilterStore } from "@/lib/store";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import { DatePicker, DatePickerInline } from "../date-picker";

function formatLabel(date: Date) {
	return format(date, "dd MMM yyyy");
}

export function DateFilter({ id, field }: { id: string; field: FilterFields }) {
	const stack = useFilterStore(s => s.filter_stack);
	const stackItemIndex = stack.findIndex(s => s.id === id);
	const item = stack[stackItemIndex];
	const operation = item?.operation ?? "from";

	const fromDate =
		item?.values[0]?.value instanceof Date ?
			item.values[0].value
		:	undefined;
	const toDate =
		item?.values[1]?.value instanceof Date ?
			item.values[1].value
		:	undefined;

	const updateDate = (date: Date, valueIndex: number) => {
		useFilterStore.setState(s => {
			const idx = s.filter_stack.findIndex(x => x.id === id);
			if (idx === -1) {
				s.filter_stack.push({
					id,
					operation: "from",
					field,
					values: [
						{
							id: nanoid(4),
							label: formatLabel(date),
							value: date,
						},
					],
				});
			} else {
				const entry = s.filter_stack[idx];
				if (!entry)
					return { filter_stack: structuredClone(s.filter_stack) };
				const newValue = {
					id: nanoid(4),
					label: formatLabel(date),
					value: date,
				};
				if (valueIndex === 0) {
					entry.values[0] =
						entry.values[0] ?
							{
								...entry.values[0],
								value: date,
								label: formatLabel(date),
							}
						:	newValue;
				} else if (valueIndex === 1) {
					if (entry.values[1]) {
						entry.values[1].value = date;
						entry.values[1].label = formatLabel(date);
					} else {
						entry.values.push(newValue);
					}
				}
			}
			return { filter_stack: structuredClone(s.filter_stack) };
		});
	};

	if (operation === "between") {
		return (
			<div className="flex flex-col gap-2 p-2">
				<DatePicker
					date={fromDate}
					onDateChange={d => updateDate(d, 0)}
					className="border-input w-full rounded-md border px-3 py-1.5 text-sm">
					{fromDate ? formatLabel(fromDate) : "From"}
				</DatePicker>
				<DatePicker
					date={toDate}
					onDateChange={d => updateDate(d, 1)}
					className="border-input w-full rounded-md border px-3 py-1.5 text-sm">
					{toDate ? formatLabel(toDate) : "To"}
				</DatePicker>
			</div>
		);
	}

	return (
		<DatePickerInline
			date={fromDate}
			onDateChange={d => updateDate(d, 0)}
		/>
	);
}
