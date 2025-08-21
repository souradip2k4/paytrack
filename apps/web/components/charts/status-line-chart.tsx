"use client";

import { LoaderCircle } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { bearerHeader } from "@/lib/bearer";

export const description = "A linear line chart";

const chartConfig = {
    debit: {
        label: "Debit",
        color: "var(--primary)",
    },
    credit: {
        label: "Credit",
        color: "var(--destructive)",
    },
    balance: {
        label: "Balance",
        color: "gray",
    },
} satisfies ChartConfig;

export function StatusLineChart() {
    const { data, isLoading } = useQuery({
        queryKey: ["tr", "agg:status"],
        queryFn: async () => {
            const res = await db(bearerHeader()).rpc("get_transaction_distribution_by_status", {
                start_date: "2025-08-01",
                end_date: "2025-08-31",
                user_id: "s350kzENPqoPvpKylkcY41fFqUoKeJvj",
            });
            if (res.error) throw res.error;
            console.log(JSON.stringify(res.data, null, 2));
            return res.data;
        },
    });

    const chartData = React.useMemo(() => {
        if (!data) return [];
        return data?.filter((x: any) => x.status === "paid") || [];
    }, [data]);

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="font-normal">By Status</CardTitle>
                {/*<CardDescription>January - June 2024</CardDescription>*/}
            </CardHeader>
            <CardContent>
                {isLoading && <LoaderCircle className="mx-auto animate-spin" />}
                {!isLoading && data && (
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                                top: 12,
                                bottom: 12,
                            }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={value => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    });
                                }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={value => {
                                    if (value >= 1000) {
                                        return `${(value / 1000).toFixed(0)}k`;
                                    }
                                    return value.toString();
                                }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                            />
                            <Line
                                dataKey="debit"
                                type="monotone"
                                stroke="var(--color-debit)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-debit)",
                                    strokeWidth: 1,
                                    r: 2,
                                }}
                                activeDot={{
                                    r: 4,
                                }}
                            />
                            <Line
                                dataKey="credit"
                                type="monotone"
                                stroke="var(--color-credit)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-credit)",
                                    strokeWidth: 1,
                                    r: 2,
                                }}
                                activeDot={{
                                    r: 4,
                                }}
                            />
                            <Line
                                dataKey="balance"
                                type="monotone"
                                stroke="var(--color-balance)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-balance)",
                                    strokeWidth: 1,
                                    r: 2,
                                }}
                                activeDot={{
                                    r: 4,
                                }}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
