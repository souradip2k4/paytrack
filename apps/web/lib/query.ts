import { authClient } from "@/lib/auth-client";
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import {
	serializeFilterStack,
	useChartStore,
	useDisplayStore,
	useFilterStore,
} from "@/lib/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type TAuthClientSession = ReturnType<typeof authClient.useSession>;
type TDataFromSession = TAuthClientSession["data"];
export type TUseSession = Omit<TAuthClientSession, "data"> & {
	data: TDataFromSession & {
		subscription: {
			isSubscribed: boolean;
			productId: string | null | undefined;
		};
	};
};

export const useSubscriptions = () => {
	const { data } = authClient.useSession();
	const query = useQuery({
		queryKey: ["subscriptions", "get", data?.user?.id],
		queryFn: async () => {
			if (!data || !data.user.id) return [];
			const res = await db(await bearerHeader())
				.from("subscriptions")
				.select("*")
				.eq("user_id", data.user.id)
				.order("name");
			if (res.error) return [];
			return res.data;
		},
	});
	return query;
};

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

export const useCreateCategories = () => {
	const queryClient = useQueryClient();
	const { data: authData } = authClient.useSession();
	const query = useMutation({
		mutationKey: ["cat", "post"],
		mutationFn: async (data: string) => {
			if (!authData || !authData.user?.id) return;
			const res = await db(await bearerHeader())
				.from("categories")
				.insert({
					name: data,
					user_id: authData.user?.id,
					organization_id: authData.session?.activeOrganizationId,
				});
			if (res.error) {
				toast.error("Failed to create category");
				return;
			}
			return res.data;
		},
		onSuccess: () => {
			toast.success("Category created successfully");
			queryClient.invalidateQueries({
				queryKey: ["cat", "get"],
			});
			queryClient.refetchQueries({
				queryKey: ["cat", "get"],
			});
		},
	});
	return query;
};

export const useTransactions = () => {
	const { data: authData, error: authError } = authClient.useSession();

	const filterStack = useFilterStore(s => s.filter_stack);
	const pageSize = useDisplayStore(s => s.display_page_size);
	const applyFilter = useFilterStore(s => s.filter_apply);
	const applyDisplay = useDisplayStore(s => s.apply_display);

	const query = useQuery<any>({
		queryKey: ["tr", "get", filterStack, pageSize],
		queryFn: async () => {
			if (authData === null) return [];

			const res = await applyDisplay(
				applyFilter(
					db(await bearerHeader())
						.from("transactions")
						.select("*")
						.order("transaction_date", {
							ascending: false,
						}),
				),
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
	const filterStack = useFilterStore(s => s.filter_stack);
	const { data: authData, error: authError } = authClient.useSession();
	const res = useQuery({
		queryKey: ["tr", "dist", start_date, end_date, filterStack],
		queryFn: async () => {
			if (authData === null) return [];
			const res = await db(await bearerHeader()).rpc(
				"get_transaction_distribution_by_category",
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
	});

	return res;
};
