import {
	serializeFilterStack,
	useChartStore,
	useDisplayStore,
	useFilterStore,
} from "@/lib/store";
import { authClient } from "@budgetbee/core/auth-client";
import { getDb } from "@budgetbee/core/db";
import { PostgrestSingleResponse } from "@supabase/postgrest-js";
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
			const db = await getDb();
			const res = await db
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
			const db = await getDb();
			const res = await db
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

export type CategoryMutationProps =
	| { type: "create"; payload: { name: string; color?: string } }
	| { type: "update"; payload: { id: string; name?: string; color?: string } }
	| { type: "delete"; payload: { id: string; cascade?: boolean } };

/** Explicitly mutates category, will fail if the id is not present in database. */
export const useCategoryMutation = () => {
	const queryClient = useQueryClient();
	const { data: authData } = authClient.useSession();
	const query = useMutation({
		mutationKey: ["cat", "mut"],
		mutationFn: async (data: CategoryMutationProps) => {
			if (!authData || !authData.user?.id) return;

			const db = await getDb();
			let res: PostgrestSingleResponse<null>;
			if (data.type === "create") {
				res = await db.from("categories").insert({
					name: data.payload.name,
					color: data.payload.color,
					user_id: authData.user?.id,
					organization_id: authData.session?.activeOrganizationId,
				});
			} else if (data.type === "update") {
				res = await db
					.from("categories")
					.update({
						name: data.payload.name,
						color: data.payload.color,
						user_id: authData.user?.id,
						organization_id: authData.session?.activeOrganizationId,
					})
					.eq("id", data.payload.id);
			} else if (data.type === "delete") {
				if (data.payload.cascade) {
					res = await db.rpc("delete_category", {
						p_category_id: data.payload.id,
						p_cascade_delete: true,
					});
				} else {
					res = await db
						.from("categories")
						.delete()
						.eq("id", data.payload.id);
				}
			} else {
				throw new Error("Invalid operation type");
			}

			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: (_, variables) => {
			if (variables.type === "create") {
				toast.success("Category created successfully");
			} else if (variables.type === "update") {
				toast.success("Category updated successfully");
			} else if (variables.type === "delete") {
				toast.success("Category deleted successfully");
				if (variables.payload.cascade) {
					queryClient.invalidateQueries({
						queryKey: ["tr", "get"],
						exact: false,
					});
					queryClient.refetchQueries({
						queryKey: ["tr", "get"],
						exact: false,
					});
				}
			}

			queryClient.invalidateQueries({
				queryKey: ["cat", "get"],
				exact: false,
			});
			queryClient.refetchQueries({
				queryKey: ["cat", "get"],
				exact: false,
			});
		},
		onError: () => {
			toast.error("Failed to perform operation");
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

			const db = await getDb();
			const res = await applyDisplay(
				applyFilter(
					db
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
			const db = await getDb();
			const res = await db.rpc(
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
