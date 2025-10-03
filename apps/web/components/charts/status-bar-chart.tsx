"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { authClient } from "@/lib/auth-client";
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import {
    serializeFilterStack,
    useChartStore,
    useFilterStore,
} from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { addDays, differenceInDays, format } from "date-fns";
import { LoaderCircle } from "lucide-react";
import * as React from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ReferenceLine,
    XAxis,
    YAxis,
} from "recharts";

export const description =
    "Bar chart showing transaction distribution by status.";

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

const statusColors: Record<"paid" | "pending" | "overdue", string> = {
    paid: "#10b981",
    pending: "#f59e0b",
    overdue: "#ef4444",
};

type TransactionDistribution = {
    day: string;
    debit: number;
    credit: number;
    balance: number;
    status: "paid" | "pending" | "overdue";
};

export function StatusBarChart() {
    const { data: authData, isPending: isSessionLoading } =
        authClient.useSession();
    const metric = useChartStore(s => s.tr_chart_metric);
    const start_date = useChartStore(s => s.tr_chart_date_start);
    const end_date = useChartStore(s => s.tr_chart_date_end);
    const reverse_order = useChartStore(s => s.tr_chart_reverse_order);
    const filterStack = useFilterStore(s => s.filter_stack);

    const { data: transactionData, isLoading: isTransactionsLoading } =
        useQuery({
            queryKey: ["st", "agg", authData?.user.id, filterStack],
            queryFn: async () => {
                const res = await db(await bearerHeader()).rpc(
                    "get_transaction_distribution_by_status",
                    {
                        params: {
                            user_id: authData?.user?.id,
                            organization_id:
                                authData?.session?.activeOrganizationId,
                            filters: serializeFilterStack(filterStack),
                        },
                    },
                );
                if (res.error) throw res.error;
                return res.data as TransactionDistribution[];
            },
            enabled: !isSessionLoading,
        });

    const statuses = React.useMemo(() => ["paid", "pending", "overdue"], []);

    const chartData: Record<string, string | number>[] = React.useMemo(() => {
        if (!transactionData || !statuses) return [];
        if (transactionData.length === 0) return [];

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        const dataByDate: Record<
            string,
            Record<string, number>
        > = transactionData.reduce(
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
    }, [transactionData, statuses, start_date, end_date, metric]);

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b p-4 px-6 !pb-4 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <CardTitle className="font-normal">By Status</CardTitle>
                </div>
                <div className="flex">
                    {/*
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
                        <Label
                            className="grow"
                            htmlFor={reverseOrderSwitchId}>
                            Reverse order
                        </Label>
                        <Switch
                            id={reverseOrderSwitchId}
                            checked={reverse_order}
                            onCheckedChange={_ =>
                                useChartStore.setState(_ => ({
                                    tr_chart_reverse_order:
                                        !reverse_order,
                                }))
                            }
                        />
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
                    */}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="relative aspect-auto h-[320px] w-full">
                    {isTransactionsLoading ?
                        <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
                            <LoaderCircle className="mx-auto animate-spin" />
                        </div>
                        : chartData && chartData.length === 0 ?
                            <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
                                <p>No data available</p>
                            </div>
                            : <BarChart
                                accessibilityLayer
                                data={chartData}
                                reverseStackOrder={reverse_order}>
                                <CartesianGrid vertical={false} />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={value => {
                                        const v = Number.parseFloat(value);
                                        if (Number.isNaN(v)) return "";
                                        return Intl.NumberFormat("en-US", {
                                            notation: "compact",
                                            maximumFractionDigits: 2,
                                            compactDisplay: "short",
                                        }).format(v);
                                    }}
                                />
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
                                <ReferenceLine
                                    y={0}
                                    strokeWidth={2}
                                    stroke="hsl(var(--primary))"
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
                                            fill={
                                                statusColors[
                                                status as keyof typeof statusColors
                                                ]
                                            }
                                            strokeWidth={1}
                                        />
                                    );
                                })}
                            </BarChart>
                    }
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
