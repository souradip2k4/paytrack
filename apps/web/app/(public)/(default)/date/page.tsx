"use client";

import { DatePicker } from "@/components/date-picker";
import { format } from "date-fns";
import React from "react";

export default function Page() {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    return (
        <div className="p-24">
            <DatePicker modal date={date} onDateChange={setDate}>
                <span className="text-muted-foreground">{date ? format(date, "yyyy / MM / dd") : "Pick a date"}</span>
            </DatePicker>
        </div>
    );
}
