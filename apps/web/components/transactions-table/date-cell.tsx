"use client";

import { useLocalSettingsStore } from "@/lib/store";
import { Column, Row } from "@tanstack/react-table";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";

const formatDate = (date: Date, fmt: string, relativeDates: boolean) => {
	if (relativeDates && Math.abs(differenceInDays(date, new Date())) <= 7) {
		return formatDistanceToNow(date, { addSuffix: true });
	}
	return format(date, fmt);
};

export const DateCell = ({
	row,
	column,
}: {
	row: Row<any>;
	column: Column<any>;
}) => {
	const date = row.getValue(column.id) as string;
	const dateFormat = useLocalSettingsStore(s => s.settings_date_format);
	const relativeDates = useLocalSettingsStore(s => s.settings_relative_dates);
	return (
		<div>
			<p className="text-muted-foreground">
				{formatDate(new Date(date), dateFormat, relativeDates)}
			</p>
		</div>
	);
};
