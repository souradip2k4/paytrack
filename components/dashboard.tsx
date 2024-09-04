"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { MonthlyChart } from "./charts";
import { WeeklyBarChart } from "./charts/weekly-charts";
import { WeeklyAreaChart } from "./charts/weekly-area-chart";

type DataPoint = {
    sum: string;
    avg: string;
    points: { date: string; amount: number; }[];
}

export default function Dashboard() {
    const { user } = useUser();
    const query = useQuery<any, any, DataPoint | null>({
        queryKey: ["entries", user?.id],
        queryFn: async ({ queryKey }: { queryKey: QueryKey }) => {
            if (!queryKey[1]) return null;
            const from = format(startOfMonth(new Date()), 'yyyy-MM-dd');
            const to = format(endOfMonth(new Date()), 'yyyy-MM-dd');
            try {
                const res = await axios.get(
                    `/api/users/${queryKey[1]}/entries/_datapoints?from=${from}&to=${to}`,
                );
                return res.data as DataPoint;
            } catch { return null; }
        },
    });

    if (query.isLoading) return <p>Loading...</p>
    if (query.isError) {
        console.log(query.error)
        return <p>{JSON.stringify(query.error)}</p>
    }
    if (!query.data) return <p>data is undef</p>

    console.log(query.data)

    return (
        <div className="flex flex-col px-8 py-16 gap-6">

            <div className="grid grid-cols-3 gap-6">
                <Card className="space-y-1">
                    <CardHeader>
                        <p>Total expenses</p>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-2xl">{Math.ceil(Number(query.data.sum))}</CardTitle>
                        <CardDescription>+20% from last month</CardDescription>
                    </CardContent>
                </Card>


                <Card className="space-y-1">
                    <CardHeader>
                        <p>Total expenses</p>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-2xl">{Math.ceil(Number(query.data.sum))}</CardTitle>
                        <CardDescription>+20% from last month</CardDescription>
                    </CardContent>
                </Card>

                <Card className="space-y-1">
                    <CardHeader className="space-y-1">
                        <p>Total expenses</p>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-2xl">{Math.ceil(Number(query.data.sum))}</CardTitle>
                        <CardDescription>+20% from last month</CardDescription>
                    </CardContent>
                </Card>
            </div>

            <div>
                <MonthlyChart />
            </div>

            <div className="grid grid-cols-3 gap-6">
                <WeeklyBarChart />
                <WeeklyAreaChart />
            </div>


        </div>
    )
}
