import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "./auth-client";
import { bearerHeader } from "./bearer";
import { useChartStore } from "./chart-store";
import { db } from "./db";
import { useFilterStore } from "./store";

export const useCategories = () => {
	const { data } = authClient.useSession();
	const query = useQuery({
		queryKey: ["cat", "get", data?.user?.id],
		queryFn: async () => {
			if (!data || !data.user.id) return [];
			const res = await db(await bearerHeader())
				.from("categories")
				.select("*")
				.eq("user_id", data.user.id)
				.order("name");
			if (res.error) return [];
			return res.data;
		},
	});
	return query;
};

export const useTransactions = () => {
	const { data: authData, error: authError } = authClient.useSession();

	const filterStack = useFilterStore(s => s.filter_stack);
	const pageSize = useFilterStore(s => s.display_page_size);
	const applyFilter = useFilterStore(s => s.apply_filter);

	const query = useQuery<any>({
		queryKey: ["tr", "get", filterStack, pageSize],
		queryFn: async () => {
			if (authData === null) return [];

			const res = await applyFilter(
				db(await bearerHeader())
					.from("transactions")
					.select("*")
					.order("transaction_date", {
						ascending: false,
					}),
			);

			if (res.error) {
				toast.error("Failed to fetch transactions");
				return [];
			}

			return res.data;
		},
		enabled: authError === null && authData !== null,
	});

	return query;
};

type TransactionDistribution = {
	day: string;
	debit: number;
	credit: number;
	balance: number;
	name: string;
	category_id: string;
};

export const useTransactionDistributionByCategories = () => {
	const start_date = useChartStore(s => s.tr_chart_date_start);
	const end_date = useChartStore(s => s.tr_chart_date_end);

	const { data: authData, error: authError } = authClient.useSession();

	const res = useQuery({
		queryKey: ["tr", "dist", start_date, end_date],
		queryFn: async () => {
			if (authData === null) return [];
			const res = await db(await bearerHeader()).rpc(
				"get_transaction_distribution_by_category",
				{
					params: {
						start_date,
						end_date,
						user_id: authData.user.id,
					},
				},
			);
			if (res.error) throw res.error;
			return res.data as TransactionDistribution[];
		},
		enabled: authError === null && authData !== null,
	});

	return res;
};
