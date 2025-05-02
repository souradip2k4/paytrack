"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { addDays, format } from "date-fns";
import LoadingSpinner from "../loading-spinner";
import { padDates } from "./pad-dates";
import { formatMoney } from "@/lib/money-utils";

const chartConfig = {
    income: {
        label: "Income",
        color: "hsl(var(--chart-1))",
    },
    expense: {
        label: "Expense",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

type Datapoint = {
    date: string;
    total: number;
    income: number;
    expense: number;
};

export function DailyExpenseLineChart() {
    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("income");

    const { user } = useUser();

    const [range, setRange] = React.useState({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    const { data, isLoading, isFetched } = useQuery<any, any, Datapoint[]>({
        queryKey: ["entries/by-date", "GET", range],
        queryFn: async () => {
            if (!user) return;
            const from = format(range.from, "yyyy-MM-dd");
            const to = format(range.to, "yyyy-MM-dd");
            const res = await axios.get(
                `/api/users/${user?.id}/entries/by-date?from=${from}&to=${to}`,
            );
            return res.data;
        },
        enabled: !!user && !!user?.id,
    });

    const total = React.useMemo(
        () => ({
            income: data?.reduce((acc, curr) => acc + curr.income, 0) || 0,
            expense: data?.reduce((acc, curr) => acc + curr.expense, 0) || 0,
        }),
        [data],
    );

    const chartData = React.useMemo(
        () => (!data ? [] : padDates(data, range.from, range.to)),
        [data, range],
    );

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row [.border-b]:pb-0">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle className="font-normal">Past 30 days.</CardTitle>
                    <CardDescription>
                        Showing your spending history for the past 30 days.
                    </CardDescription>
                </div>
                <div className="flex">
                    {["income", "expense"].map(key => {
                        const chart = key as keyof typeof chartConfig;
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(chart)}>
                                <span className="text-muted-foreground text-xs">
                                    {chartConfig[chart].label}
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                    {formatMoney(total[
                                        key as keyof typeof total
                                    ])}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                {isLoading && (
                    <div className="flex aspect-auto h-[250px] w-full items-center justify-center">
                        <LoadingSpinner />
                    </div>
                )}
                {isFetched && (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={value => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    });
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[150px]"
                                        nameKey="date"
                                        labelFormatter={value => {
                                            return value;
                                        }}
                                    />
                                }
                            />
                            <Line
                                dataKey={activeChart}
                                type="linear"
                                stroke={`var(--color-${activeChart})`}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
