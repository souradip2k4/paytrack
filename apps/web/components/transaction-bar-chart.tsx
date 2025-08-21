"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { db } from "@/lib/db";
import { useCategories } from "@/lib/query";
import { Record } from "@prisma/client/runtime/library";
import { useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { bearerHeader } from "@/lib/bearer";

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
    name: string;
    category_id: string;
};

export function TransactionBarChart() {
    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("credit");

    const total = React.useMemo(
        () => ({
            credit: 0,
            debit: 0,
        }),
        [],
    );

    const { data, isLoading } = useQuery({
        queryKey: ["tr", "agg"],
        queryFn: async () => {
            const res = await db(bearerHeader()).rpc("get_transaction_distribution");
            if (res.error) {
                throw res.error;
            }
            return res.data as TransactionDistribution[];
        },
    });

    const { data: categories, isLoading: isCategoriesLoading } =
        useCategories();

    const chartData = React.useMemo(() => {
        console.time("chart data computing...");
        if (!data || !categories) return { chartData: [], categories: [] };

        const startDate = new Date("2025-08-01");

        const categoryMap: Record<string, string> = categories.reduce(
            (acc, cat) => {
                acc[cat.id] = cat.name;
                return acc;
            },
            {},
        );

        const dataByDate: Record<string, Record<string, number>> = data.reduce(
            (acc, item) => {
                const key = format(new Date(item.day), "yyyy-MM-dd");
                if (!acc[key]) acc[key] = {};
                const name =
                    categoryMap[item.category_id] ||
                    item.name ||
                    "Uncategorized";
                if (acc[key][name]) acc[key][name] += item.debit || 0;
                else acc[key][name] = item.debit || 0;
                return acc;
            },
            {} as Record<string, Record<string, number>>,
        );

        const allCategories = new Set<string>();
        categories.forEach(cat => allCategories.add(cat.name));

        // Generate array for the date range (30 days from start date)
        const days = Array.from({ length: 30 }, (_, i) => {
            const day = addDays(startDate, i);
            const dayKey = format(day, "yyyy-MM-dd");

            let res: Record<string, any> = { day: dayKey };

            // Initialize all categories with 0
            allCategories.forEach(c => {
                res[c] = 0;
            });

            // Add actual data if it exists for this day
            if (dataByDate[dayKey]) {
                Object.entries(dataByDate[dayKey]).forEach(
                    ([category, value]) => {
                        res[category] = value;
                    },
                );
            }

            return res;
        });

        console.timeEnd("chart data computing...");
        return days;
    }, [data, categories]);

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 pt-4 sm:!py-0">
                    <CardTitle className="font-normal">
                        Daily transactions
                    </CardTitle>
                </div>
                <div className="flex"></div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                {isLoading || isCategoriesLoading ?
                    <LoaderCircle className="mx-auto animate-spin" />
                    : <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full">
                        <BarChart
                            accessibilityLayer
                            data={chartData || []}
                            //radius={4}
                            //background={{ fill: "currentColor", radius: 4 }} // Only Top Bar will have background else it will give render errors
                            //overflow="visible"
                            //reverseStackOrder
                            accessibilityLayer>
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

                            {/*<Bar
                            dataKey={activeChart}
                            fill={`var(--color-${activeChart})`}
                        />*/}

                            {categories?.map((c, i) => {
                                return (
                                    <Bar
                                        key={c.name}
                                        name={c.name}
                                        className="mt-8"
                                        stackId="a"
                                        dataKey={c.name}
                                        radius={4}
                                        overflow="visible"
                                        fill={generateColor(i + 1)}
                                        stroke="#fff" // 🎨 Color of the border
                                        strokeWidth={0.5}
                                    />
                                );
                            })}

                            <Bar
                                key={"dfjksjdf"}
                                name={"Uncategorized"}
                                stackId="a"
                                className="mt-8"
                                radius={4}
                                overflow="visible"
                                dataKey={"Uncategorized"}
                                fill={generateColor(0)}
                                stroke="#fff" // 🎨 Color of the border
                                strokeWidth={0.5}
                            />
                        </BarChart>
                    </ChartContainer>
                }
            </CardContent>
        </Card>
    );
}
