"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { MonthlyChart } from "@/components/charts";
import { WeeklyBarChart } from "@/components/charts/weekly-charts";
import { WeeklyAreaChart } from "@/components/charts/weekly-area-chart";
import LoadingSection from "@/components/loading-section";
import { H3 } from "./ui/typography";

type DataPoint = {
    sum: string;
    avg: string;
    points: { date: string; amount: number; income: number; expense: number }[];
};

export default function Dashboard() {
    const { user } = useUser();
    const query = useQuery<any, any, DataPoint | null>({
        queryKey: ["entries", user?.id],
        queryFn: async ({ queryKey }: { queryKey: QueryKey }) => {
            if (!queryKey[1]) return null;
            const from = format(startOfMonth(new Date()), "yyyy-MM-dd");
            const to = format(endOfMonth(new Date()), "yyyy-MM-dd");
            try {
                const res = await axios.get(
                    `/api/users/${queryKey[1]}/entries/_datapoints?from=${from}&to=${to}`,
                );
                return res.data as DataPoint;
            } catch {
                return null;
            }
        },
    });

    if (query.isLoading) return <LoadingSection />;
    if (query.isError) throw new Error(query.error);
    if (typeof query.data === "undefined") return <LoadingSection />;

    return (
        <div className="flex flex-col p-8 gap-6">
            <H3 className="mt-0">Monthly Report</H3>
            <div className="grid grid-cols-3 gap-6">
                <Card className="space-y-4">
                    <CardHeader className="pb-0">
                        <CardTitle>Total</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <CardTitle className="text-2xl">
                            ₹ {Math.ceil(Number(query.data?.sum))}
                        </CardTitle>
                        <CardDescription>+20% from last month</CardDescription>
                    </CardContent>
                </Card>

                <Card className="space-y-4">
                    <CardHeader className="pb-0">
                        <CardTitle>Average</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <CardTitle className="text-2xl">
                            ₹ {Math.ceil(Number(query.data?.avg))}
                        </CardTitle>
                        <CardDescription>+20% from last month</CardDescription>
                    </CardContent>
                </Card>
            </div>

            <div>
                {query.data && <MonthlyChart chartData={query.data.points} />}
            </div>

            <H3>Weekly Report</H3>
            <div className="grid grid-cols-3 gap-6">
                <WeeklyBarChart />
                <WeeklyAreaChart />
            </div>
        </div>
    );
}
