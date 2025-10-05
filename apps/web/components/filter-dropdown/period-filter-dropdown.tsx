"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChartStore } from "@/lib/store";
import {
    addDays,
    endOfMonth,
    endOfWeek,
    format,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import { Calendar } from "lucide-react";

const periodOptions = [
    {
        label: "This week",
        start_date: format(startOfWeek(new Date()), "yyyy-MM-dd"),
        end_date: format(endOfWeek(new Date()), "yyyy-MM-dd"),
    },
    {
        label: "This month",
        start_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        end_date: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    },
    {
        label: "Last 7 days",
        start_date: format(addDays(new Date(), -7), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd"),
    },
    {
        label: "Last 14 days",
        start_date: format(addDays(new Date(), -14), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd"),
    },
    {
        label: "Last 30 days",
        start_date: format(addDays(new Date(), -30), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd"),
    },
];

export function PeriodFilterPill() {
    const startDate = useChartStore(s => s.tr_chart_date_start);
    const endDate = useChartStore(s => s.tr_chart_date_end);

    if (startDate === null || endDate === null) return null;

    const period = periodOptions.find(
        p => p.start_date === startDate && p.end_date === endDate,
    )?.label;
    if (!period) return null;

    return (
        <div className="flex overflow-clip rounded-full [&>*]:rounded-none [&>*]:border-r">
            <Button variant="secondary" size="sm">
                Period: {period}
            </Button>
        </div>
    );
}

export function MetricFilterPill() {
    const metric = useChartStore(s => s.tr_chart_metric);
    return (
        <div className="flex overflow-clip rounded-full [&>*]:rounded-none [&>*]:border-r">
            <Button variant="secondary" size="sm" className="capitalize">
                Show: {metric}
            </Button>
        </div>
    );
}

export function PeriodFilterDropdown() {
    const metric = useChartStore(s => s.tr_chart_metric);
    const startDate = useChartStore(s => s.tr_chart_date_start);
    const endDate = useChartStore(s => s.tr_chart_date_end);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary">
                    <Calendar className="size-4" /> Date
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                        Period
                    </DropdownMenuLabel>
                    {periodOptions.map((o, i) => (
                        <DropdownMenuCheckboxItem
                            key={i}
                            checked={
                                o.start_date === startDate &&
                                o.end_date === endDate
                            }
                            onCheckedChange={_ =>
                                useChartStore.setState(_ => ({
                                    tr_chart_date_start: o.start_date,
                                    tr_chart_date_end: o.end_date,
                                }))
                            }>
                            {o.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                        Transaction type
                    </DropdownMenuLabel>
                    {(["credit", "debit", "balance"] as const).map((m, i) => (
                        <DropdownMenuCheckboxItem
                            key={i}
                            checked={m === metric}
                            onCheckedChange={_ =>
                                useChartStore.setState(_ => ({
                                    tr_chart_metric: m,
                                }))
                            }
                            className="capitalize">
                            {m}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
