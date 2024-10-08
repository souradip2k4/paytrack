"use client";

import { WeeklyBarChart } from "@/components/charts/weekly-charts";
import LoadingSection from "@/components/loading-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money-utils";
import { useUser } from "@clerk/nextjs";
import { QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, subDays } from "date-fns";
import { MonthlyChart } from "./charts";
import { H3 } from "./ui/typography";

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
			<div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
				<AmountCard title="Total" value={query.data?.sum} />
				<AmountCard title="Average" value={query.data?.avg} />
			</div>

			{query.data?.date && <MonthlyChart chartData={query.data.date} />}

			<div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
				{query.data?.category && (
					<WeeklyBarChart chartData={query.data.category} />
				)}
			</div>
		</div>
	);
}
