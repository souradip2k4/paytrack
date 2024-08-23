"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { AreaChart } from "@tremor/react";
import axios from "axios";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { IoCalendarClearOutline } from "react-icons/io5";

type MonthlyEntry = {
    date: Date;
    amount: number;
};

function getDaysCount(date: Date) {
    const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return newDate.getDate();
}

function fillMissingDates(
    data: MonthlyEntry[],
    ref: Date = new Date(),
): MonthlyEntry[] {
    const days = getDaysCount(ref);
    const filledDate = new Array<MonthlyEntry>(days);
    let curr = 0;

    for (let i = 0; i < days; i++) {
        const date = new Date(ref.getFullYear(), ref.getMonth(), i + 1);
        const entry = { date, amount: 0 };
        if (
            curr < data.length &&
            data[curr].date.toDateString() === date.toDateString()
        ) {
            entry.amount += data[curr].amount;
            curr++;
        }
        filledDate[i] = entry;
    }
    return filledDate;
}

const dataFormatter = (number: number) => {
    const sign = number >= 0 ? "" : "-";
    number = Math.abs(number);
    return `${sign}$${Intl.NumberFormat("us").format(number).toString()}`;
};

export function MonthlyAreaChart() {
    const { user } = useUser();

    const [month, _] = useState(new Date().getMonth());
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(Date.now()),
        to: endOfMonth(Date.now()),
    });

    const query = useQuery<any, any, Prisma.EntryCreateInput[]>({
        queryKey: ["entries", user?.id],
        queryFn: async ({ queryKey }: { queryKey: QueryKey }) => {
            if (!queryKey[1]) return [];
            if (date === undefined || date.to === undefined || date.from === undefined) return [];
            const from = format(date.from, 'yyyy-MM-dd');
            const to = format(date.to, 'yyyy-MM-dd');
            const res = await axios.get(
                `/api/users/${queryKey[1]}/entries?from=${from}&to=${to}`,
            );
            return JSON.parse(res.data);
        },
    });

    const monthlyData = useMemo(() => {
        if (!query.data) return [];
        const formatted_data = query.data.map(({ date, amount }) => {
            date = new Date(date);
            amount = Number(amount);
            return { date, amount };
        });
        const filtered_data = formatted_data.filter(
            (data) => data.date.getMonth() === month,
        ); // redundant
        const sorted_data = filtered_data.toSorted((a, b) =>
            Math.sign(a.date.getTime() - b.date.getTime()),
        );
        const reduced_data = sorted_data.reduce((acc, curr) => {
            const last = acc[acc.length - 1];
            if (last && last.date.toDateString() === curr.date.toDateString()) {
                last.amount += curr.amount;
                return acc;
            }
            acc.push(curr);
            return acc;
        }, [] as MonthlyEntry[]);

        if (reduced_data.length <= 0) return reduced_data;
        const filled_data = fillMissingDates(reduced_data, new Date());
        return filled_data.map((data) => {
            let amount = data.amount;
            return {
                ...data,
                label: format(data.date, "EEE, MMM dd"),
                Income: amount > 0 ? amount : 0,
                Expense: amount < 0 ? -amount : 0,
            };
        });
    }, [query.data, month]);

    console.log(monthlyData);

    return (
        <div>
            <div className={cn("grid gap-2")}>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                            )}
                        >
                            <IoCalendarClearOutline className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            {/* <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">Newsletter Revenue</h3>
            <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">$34,567</p> */}
            <div className="grid grid-cols-1">
                <AreaChart
                    className="h-80"
                    data={monthlyData}
                    index="label"
                    categories={["Income", "Expense"]}
                    colors={["blue", "purple"]}
                    valueFormatter={dataFormatter}
                    yAxisWidth={60}
                    allowDecimals
                    showAnimation
                />
            </div>
        </div>
    );
}
