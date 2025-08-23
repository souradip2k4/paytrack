"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { bearerHeader } from "@/lib/bearer";
import { useChartStore } from "@/lib/chart-store";
import { db } from "@/lib/db";
import { useCategories } from "@/lib/query";
import { useQuery } from "@tanstack/react-query";
import {
    addDays,
    differenceInDays,
    endOfMonth,
    endOfWeek,
    format,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import { LoaderCircle, Settings2 } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export const description = "An interactive bar chart";

const chartConfig = {
    credit: {
        label: "Credit",
        color: "var(--chart-2)",
    },
    debit: {
        label: "Debit",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const generateColor = (index: number) => {
    const colors = [
        "#60a5fa", // Blue
        "#f87171", // Red
        "#34d399", // Green
        "#a78bfa", // Purple
        "#fb923c", // Orange
        "#f472b6", // Pink
        "#2dd4bf", // Teal
        "#818cf8", // Indigo
        "#facc15", // Yellow
        "#fb7185", // Rose
        "#10b981", // Emerald
        "#8b5cf6", // Violet
        "#f59e0b", // Amber
        "#22d3ee", // Cyan
        "#e879f9", // Fuchsia
        "#84cc16", // Lime
        "#38bdf8", // Sky
        "#94a3b8", // Slate
        "#a8a29e", // Stone
        "#a1a1aa", // Zinc
    ];
    return colors[index % colors.length];
};

// Light mode colors
const lightColors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#8b5cf6", // Purple
    "#f97316", // Orange
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#6366f1", // Indigo
    "#eab308", // Yellow
    "#f43f5e", // Rose
    "#059669", // Emerald
    "#7c3aed", // Violet
    "#d97706", // Amber
    "#0891b2", // Cyan
    "#c026d3", // Fuchsia
    "#65a30d", // Lime
    "#0284c7", // Sky
    "#475569", // Slate
    "#57534e", // Stone
    "#52525b", // Zinc
];

// Dark mode colors
const darkColors = [
    "#60a5fa", // Blue
    "#f87171", // Red
    "#34d399", // Green
    "#a78bfa", // Purple
    "#fb923c", // Orange
    "#f472b6", // Pink
    "#2dd4bf", // Teal
    "#818cf8", // Indigo
    "#facc15", // Yellow
    "#fb7185", // Rose
    "#10b981", // Emerald
    "#8b5cf6", // Violet
    "#f59e0b", // Amber
    "#22d3ee", // Cyan
    "#e879f9", // Fuchsia
    "#84cc16", // Lime
    "#38bdf8", // Sky
    "#94a3b8", // Slate
    "#a8a29e", // Stone
    "#a1a1aa", // Zinc
];

type TransactionDistribution = {
    day: string;
    debit: number;
    credit: number;
    balance: number;
    status: "paid" | "pending" | "overdue";
};

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

export function StatusBarChart() {
    const reverseOrderSwitchId = React.useId();

    const metric = useChartStore(s => s.tr_chart_metric);
    const start_date = useChartStore(s => s.tr_chart_date_start);
    const end_date = useChartStore(s => s.tr_chart_date_end);
    const reverse_order = useChartStore(s => s.tr_chart_reverse_order);

    const { data, isLoading } = useQuery({
        queryKey: ["st", "agg", start_date, end_date],
        queryFn: async () => {
            const res = await db(await bearerHeader()).rpc(
                "get_transaction_distribution_by_status",
                {
                    params: {
                        start_date,
                        end_date,
                        user_id: "ZOtqlAP5YAZPU4WnV2lWDtVxzSH7obWw",
                    },
                },
            );
            if (res.error) {
                throw res.error;
            }
            console.log("> status", res.data);
            return res.data as TransactionDistribution[];
        },
    });

    const statuses = React.useMemo(() => ["paid", "pending", "overdue"], []);

    const chartData: Record<string, string | number>[] = React.useMemo(() => {
        if (!data || !statuses) return [];

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        const dataByDate: Record<string, Record<string, number>> = data.reduce(
            (acc, item) => {
                const key = format(new Date(item.day), "yyyy-MM-dd");
                if (!acc[key]) acc[key] = {};
                const name = item.status;
                if (acc[key][name]) acc[key][name] += item[metric] || 0;
                else acc[key][name] = item[metric] || 0;
                return acc;
            },
            {} as Record<string, Record<string, number>>,
        );

        const allStatuses = new Set<string>();
        statuses.forEach(status => allStatuses.add(status));

        const days = Array.from(
            { length: differenceInDays(endDate, startDate) + 1 },
            (_, i) => {
                const day = addDays(startDate, i);
                const dayKey = format(day, "yyyy-MM-dd");
                let res: Record<string, any> = { day: dayKey };
                allStatuses.forEach(s => {
                    res[s] = 0;
                });
                if (dataByDate[dayKey]) {
                    Object.entries(dataByDate[dayKey]).forEach(
                        ([status, value]) => {
                            res[status] = value;
                        },
                    );
                }
                return res;
            },
        );
        return days;
    }, [data, statuses, start_date, end_date, metric]);

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b p-6 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <CardTitle className="font-normal">
                        Daily transactions
                    </CardTitle>
                </div>
                <div className="flex">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="outline"
                                className="size-8">
                                <Settings2 className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            {/*<div className="flex gap-1 p-2">
                                <Label className="grow">Show categories</Label>
                                <Switch />
                            </div>*/}
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-muted-foreground text-xs">
                                    Period
                                </DropdownMenuLabel>
                                {periodOptions.map((o, i) => (
                                    <DropdownMenuCheckboxItem
                                        key={i}
                                        checked={
                                            o.start_date === start_date &&
                                            o.end_date === end_date
                                        }
                                        onCheckedChange={_ =>
                                            useChartStore.setState(_ => ({
                                                tr_chart_date_start:
                                                    o.start_date,
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
                                {(["credit", "debit", "balance"] as const).map(
                                    (m, i) => (
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
                                    ),
                                )}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <div className="flex gap-1 p-2">
                                <Label className="grow" htmlFor={reverseOrderSwitchId}>Reverse order</Label>
                                <Switch id={reverseOrderSwitchId} checked={reverse_order} onCheckedChange={_ => useChartStore.setState(_ => ({ tr_chart_reverse_order: !reverse_order }))} />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                {isLoading ?
                    <LoaderCircle className="mx-auto animate-spin" />
                    : <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full">
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            reverseStackOrder={reverse_order}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="day"
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
                                        nameKey="amount"
                                        labelFormatter={value => {
                                            return new Date(
                                                value,
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            });
                                        }}
                                    />
                                }
                            />

                            {statuses.map((status, i) => {
                                return (
                                    <Bar
                                        key={status}
                                        name={status}
                                        stackId="a"
                                        dataKey={status}
                                        radius={4}
                                        overflow="visible"
                                        className="stroke-card"
                                        fill={generateColor(i + 1)}
                                        strokeWidth={1}
                                    />
                                );
                            })}
                        </BarChart>
                    </ChartContainer>
                }
            </CardContent>
        </Card>
    );
}
