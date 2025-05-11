"use client";

import { DailyExpenseLineChart } from "@/components/charts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney } from "@/lib/money-utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { addDays, format, parse } from "date-fns";
import Link from "next/link";
import React from "react";
import { FilterEntriesButton } from "./entries-filter";
import { CategoriesBarChart } from "./charts/categories-bar-chart";

function TopEntriesCard() {
    const keys = [
        { key: "income", name: "Income" },
        { key: "expense", name: "Expense" },
    ] as const;

    const { user } = useUser();

    const [range, setRange] = React.useState({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    const { data, isLoading, isFetched } = useQuery<
        any,
        any,
        {
            date: string;
            total: number;
            income: number;
            expense: number;
        }[]
    >({
        queryKey: ["entries/by-date", "GET"],
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

    const sortedData = React.useMemo(
        () => ({
            income:
                data
                    ?.sort((a, b) => a.income - b.income)
                    .filter(x => x.income > 0) || [],
            expense:
                data
                    ?.sort((a, b) => a.expense - b.expense)
                    .filter(x => x.expense > 0) || [],
        }),
        [data],
    );

    return (
        <Card className="size-full">
            <CardHeader className="border-b">
                <CardTitle className="font-normal">
                    Highest spendings.
                </CardTitle>
                <CardDescription className="font-normal">
                    Showing your highest spendings and earnings in past 30 days.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="income">
                    <TabsList className="gap-1 bg-transparent">
                        {keys.map(({ key, name }) => (
                            <TabsTrigger
                                key={key}
                                value={key}
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none">
                                {name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {keys.map(({ key, name }) => (
                        <TabsContent key={key} value={key}>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 h-[26px]">
                                            <TableHead className="text-primary h-9 border py-2">
                                                Date
                                            </TableHead>
                                            <TableHead className="text-primary h-9 w-24 border py-2 text-right">
                                                {name}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {sortedData[key].map(value => {
                                            const date = parse(
                                                value.date,
                                                "yyyy-MM-dd",
                                                new Date(),
                                            );
                                            return (
                                                <React.Fragment
                                                    key={value.date}>
                                                    <TableRow>
                                                        <TableCell className="border font-medium">
                                                            <Link
                                                                href={`/entries?from=${value.date}&to=${value.date}`}>
                                                                {format(
                                                                    date,
                                                                    "EEE d MMM, yyyy",
                                                                )}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="border text-right">
                                                            {formatMoney(
                                                                value[key],
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="mt-0">Dashboard</h1>
                <div className="flex gap-2">
                    {/*<Button variant="outline" size="icon">
                        <Settings className="size-4" />
                    </Button>*/}
                    <FilterEntriesButton />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-[3fr_1fr]">
                <DailyExpenseLineChart />
                <TopEntriesCard />
            </div>

            {/*<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <CategoriesBarChart />
            </div>*/}
        </div>
    );
}
