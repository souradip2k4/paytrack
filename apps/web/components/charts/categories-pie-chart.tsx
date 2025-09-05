"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { authClient } from "@/lib/auth-client";
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import { getColor } from "@/lib/hash";
import { useChartStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { LoaderCircle } from "lucide-react";
import React from "react";
import { Cell, Pie, PieChart } from "recharts";

export const description =
    "Donut chart showing the distribution of transactions by category.";

type PieLabelProps = {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    name: string;
};

type PieLabelLineProps = {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
};

export function CategoriesPieChart() {
    const { data: authData, isPending: isSessionLoading } = authClient.useSession();
    const start = useChartStore(s => s.tr_chart_date_start)
    const end = useChartStore(s => s.tr_chart_date_end)
    const { data: chartData, isLoading } = useQuery({
        queryKey: ["chart", "by-cat", authData?.user.id, start, end],
        queryFn: async () => {
            const res = await db(await bearerHeader()).rpc(
                "get_transaction_by_category",
                {
                    params: {
                        start_date: format(start, "yyyy-MM-dd"),
                        end_date: format(end, "yyyy-MM-dd"),
                        user_id: authData?.user.id
                    },
                },
            );
            if (res.error) throw res.error;
            const mapped = res.data.map((x: any, i: number) => ({
                name: x.name ?? "Uncategorized",
                amount: Math.abs(Number(x.amount)) || 0,
                fill: getColor(x.name ?? "Uncategorized"),
            }));
            return mapped;
        },
        enabled: !isSessionLoading,
    });

    const chartConfig: ChartConfig = React.useMemo(() => {
        const cf: Record<string, { label: string; color: string }> = {};
        for (const x of chartData ?? []) {
            cf[x.name ?? "Uncategorized"] = {
                label: x.name ?? "Uncategorized",
                color: "red",
            };
        }
        return { amount: { label: "Amount" }, ...cf } satisfies ChartConfig;
    }, [chartData]);

    const [activeIdx, setActiveIdx] = React.useState<number | null>(null);

    const label = React.useCallback(
        ({ cx, cy, midAngle, outerRadius, percent, name }: PieLabelProps) => {
            if (percent < 0.02) return <></>;
            const RADIAN = Math.PI / 180;
            const radius = outerRadius + 30;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            console.log(percent);
            return (
                <text
                    x={x}
                    y={y}
                    fill="currentColor"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    className="text-xs font-medium"
                    style={{ transition: "none" }}>
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                </text>
            );
        },
        [activeIdx],
    );

    const labelLine = React.useCallback(
        ({ cx, cy, midAngle, outerRadius, percent }: PieLabelLineProps) => {
            if (percent < 0.02) return <></>;

            const RADIAN = Math.PI / 180;
            const radius1 = outerRadius + 5;
            const radius2 = outerRadius + 25;
            const x1 = cx + radius1 * Math.cos(-midAngle * RADIAN);
            const y1 = cy + radius1 * Math.sin(-midAngle * RADIAN);
            const x2 = cx + radius2 * Math.cos(-midAngle * RADIAN);
            const y2 = cy + radius2 * Math.sin(-midAngle * RADIAN);

            return (
                <polyline
                    points={`${x1},${y1} ${x2},${y2}`}
                    className="fill-none stroke-current opacity-60"
                    style={{ transition: "none" }}
                    strokeWidth={1}
                />
            );
        },
        [activeIdx],
    );

    React.useEffect(() => {
        console.log(activeIdx);
    }, [activeIdx]);

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center border-b">
                <CardTitle className="font-normal">By Categories</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 items-center justify-center pb-0">
                {isLoading && <LoaderCircle className="mx-auto animate-spin" />}
                {!isLoading && chartData && (
                    <ChartContainer config={chartConfig} className="mx-auto">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="amount"
                                nameKey="name"
                                label={label}
                                labelLine={labelLine}
                                innerRadius="60%"
                                outerRadius="80%"
                                cornerRadius={4}
                                paddingAngle={1}
                                onMouseEnter={(_, i) => setActiveIdx(i)}
                                onMouseLeave={() => setActiveIdx(null)}>
                                {chartData?.map((c: any, i: number) => (
                                    <Cell
                                        key={`cell-${i}`}
                                        fill={c.fill}
                                        className={cn("opacity-30", {
                                            "opacity-100":
                                                activeIdx === i ||
                                                activeIdx === null,
                                        })}
                                    />
                                ))}
                            </Pie>

                            <ChartLegend
                                content={<ChartLegendContent nameKey="name" />}
                                className="mt-6 -translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                            />
                        </PieChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
