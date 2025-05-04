"use client";

import { useStore } from "@/lib/store";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Calendar } from "../ui/calendar";

export type DateRange = {
    from?: Date;
    to?: Date;
};

export function DualDatePicker() {
    const from = useStore(s => s.filter_date_from);
    const to = useStore(s => s.filter_date_to);
    const setFilterDateFrom = useStore(s => s.set_filter_date_from);
    const setFilterDateTo = useStore(s => s.set_filter_date_to);

    const setDateFilters = (date: DateRange) => {
        if (date.from) setFilterDateFrom(date.from);
        if (date.to) setFilterDateTo(date.to);
    };
    return (
        <div className="flex">
            <div className="flex flex-col pt-8">
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    Today
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    Last 7 days
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    Last 30 days
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    This month
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    This year
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    Last year
                </Button>
            </div>
            <Separator orientation="vertical" />
            <Calendar
                mode="single"
                selected={from}
                onSelect={(e) => {
                    if (e) setFilterDateFrom(e)
                }}
            />
            <Separator orientation="vertical" />
            <Calendar
                mode="single"
                selected={to}
                onSelect={(e) => {
                    if (e) setFilterDateTo(e)
                }}
            />
        </div>
    );
}
