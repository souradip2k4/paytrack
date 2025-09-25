"use client";

import { DatePicker } from "@/components/date-picker";
import React from "react";

export default function Page() {
	const [date, setDate] = React.useState<Date>();
	return (
		<div className="p-24">
			<DatePicker modal date={date} onDateChange={setDate} />
		</div>
	);
}
