"use client";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { InteractiveBarChart } from "@/components/charts";
import LoadingSection from "@/components/loading-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney } from "@/lib/money-utils";
import { useUser } from "@clerk/nextjs";
import { QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, subDays } from "date-fns";
import { H3 } from "./ui/typography";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Pick } from "@prisma/client/runtime/library";
import { Button } from "./ui/button";

type DataPoints = {
    sum: {
        total: number;
        income: number;
        expense: number;
    };
    avg: {
        total: number;
        income: number;
        expense: number;
    };
    date: { date: string; total: number; income: number; expense: number }[];
    category: {
        name: string;
        total: number;
        income: number;
        expense: number;
    }[];
    max: {
        income: { date: Date; value: number }[];
        expense: { date: Date; value: number }[];
    };
};

function AmountCard({
    value,
    title,
}: {
    title: string;
    value: { total: number; income: number; expense: number } | undefined;
}) {
    return (
        <Card className="space-y-4">
            <CardHeader className="pb-0">
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                <div className="flex justify-between">
                    <p>Income</p>
                    <p>{formatMoney(value?.income)}</p>
                </div>
                <div className="flex justify-between">
                    <p>Expense</p>
                    <p>{formatMoney(value?.expense)}</p>
                </div>
                <Separator />
                <div className="flex justify-between">
                    <p>Total</p>
                    <CardTitle>{formatMoney(value?.total)}</CardTitle>
                </div>
            </CardContent>
        </Card>
    );
}

function TopEntriesCard({ values }: { values: DataPoints["max"] }) {
    const keys = [{ key: "income", name: "Income" }, { key: "expense", name: "Expense" }] as const
    return (
        <Card className="size-full">
            <CardHeader>
                <CardTitle>Most earned / spent</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="income">
                    <TabsList>
                        {keys.map(({ key, name }) => <TabsTrigger key={key} value={key}>{name}</TabsTrigger>)}
                    </TabsList>
                    {keys.map(({ key, name }) => (
                        <TabsContent key={key} value={key}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">{name}</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {values[key].map((value) => (
                                        <TableRow key={value.date.toString()}>
                                            <TableCell className="font-medium">{format(value.date, "EEE d MMM, yyyy")}</TableCell>
                                            <TableCell className="text-right">{formatMoney(value.value)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card >
    )
}

export default function Dashboard() {
    const { user } = useUser();
    const query = useQuery<any, any, DataPoints | null>({
        queryKey: ["entries", user?.id],
        queryFn: async ({ queryKey }: { queryKey: QueryKey }) => {
            if (!queryKey[1]) return null;
            const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
            const to = format(new Date(), "yyyy-MM-dd");
            try {
                const res = await axios.get(
                    `/api/users/${queryKey[1]}/entries/_datapoints?from=${from}&to=${to}`,
                );
                return res.data as DataPoints;
            } catch {
                return null;
            }
        },
    });

    if (query.isLoading) return <LoadingSection />;
    if (query.isError) throw new Error(query.error);
    if (typeof query.data === "undefined") return <LoadingSection />;

    return (
        <div className="flex flex-col gap-6">
            <H3 className="mt-0">Your cashflow report</H3>

            <div className="grid grid-rows-[repeat(2,auto)] grid-cols-1 lg:grid-rows-1 lg:grid-cols-[3fr_1fr] gap-4">
                <div className="grid grid-rows-[repeat(2,auto)] gap-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <AmountCard title="Total" value={query.data?.sum} />
                        <AmountCard title="Average" value={query.data?.avg} />
                    </div>
                    {query.data?.date && (
                        <InteractiveBarChart chartData={query.data.date} />
                    )}

                </div>
                <div>{query.data && <TopEntriesCard values={query.data.max} />}</div>
            </div>

        </div>
    );
}
