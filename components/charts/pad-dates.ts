import { addDays, differenceInDays, format, startOfDay } from "date-fns";

export function padDates(
	data: { date: string; total: number; income: number; expense: number }[],
	from: Date,
	to: Date,
) {
	const from_date = startOfDay(from);
	const to_date = startOfDay(to);
	const diff = differenceInDays(to_date, from_date);
	console.log(diff);
	return Array.from({ length: diff }, (_, i) => {
		const date = addDays(from_date, i);
		const date_str = format(date, "yyyy-MM-dd");
		const entry = data.find(x => x.date === date_str);
		if (entry) return { ...entry, date };
		return {
			date,
			total: 0,
			income: 0,
			expense: 0,
		};
	});
}
