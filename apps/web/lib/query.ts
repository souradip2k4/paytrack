import {
	serializeFilterStack,
	useChartStore,
	useDisplayStore,
	useFilterStore,
} from "@/lib/store";
import {
	applyFiltersLocal,
	computePatch,
	enqueueMutation,
	flushQueue,
	getLocalDb,
	useSyncStore,
} from "@/lib/sync";
import { authClient } from "@budgetbee/core/auth-client";
import { getDb } from "@budgetbee/core/db";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { triggerPull } from "./sync/pull";

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
	const { user_id, active_organization_id } = useAuthGuard();
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["subscriptions", "get", user_id, active_organization_id],
		staleTime: 0,
		queryFn: async () => {
			if (!user_id) return [];

			const localDb = getLocalDb();
			const orgId = active_organization_id ?? null;

			let records = await localDb.subscriptions
				.filter(
					r =>
						r.deleted_at === null &&
						(orgId !== null ?
							r.organization_id === orgId
						:	r.organization_id === null && r.user_id === user_id),
				)
				.sortBy("title" as any);

			triggerPull("subscriptions", queryClient, user_id, orgId).catch(
				console.error,
			);

			return records;
		},
		enabled: !!user_id,
	});
	return query;
};

export const useCategories = () => {
	const { user_id, active_organization_id } = useAuthGuard();
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["cat", "get", user_id, active_organization_id],
		staleTime: 0,
		queryFn: async () => {
			if (!user_id) return [];

			const localDb = getLocalDb();
			const orgId = active_organization_id ?? null;

			let records = await localDb.categories
				.filter(
					r =>
						r.deleted_at === null &&
						(orgId !== null ?
							r.organization_id === orgId
						:	r.organization_id === null && r.user_id === user_id),
				)
				.sortBy("name");

			triggerPull("categories", queryClient, user_id, orgId).catch(
				console.error,
			);

			return records;
		},
	});
	return query;
};

export const useCategoryMap = () => {
	const { data } = useCategories();
	return React.useMemo(() => {
		if (!data) return new Map();
		// @ts-ignore
		return data.reduce((acc, cat) => {
			acc.set(cat.id, cat);
			return acc;
		}, new Map<string, (typeof data)[0]>());
	}, [data]);
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

			const localDb = getLocalDb();
			const syncClientId = useSyncStore.getState().clientId;
			const userId = authData.user.id;
			const orgId = authData.session?.activeOrganizationId ?? null;

			if (data.type === "create") {
				const id = crypto.randomUUID();
				const now = new Date().toISOString();
				const record = {
					id,
					name: data.payload.name,
					color: data.payload.color ?? null,
					user_id: userId,
					organization_id: orgId,
					created_at: now,
					updated_at: now,
					deleted_at: null,
					_sync_state: "pending" as const,
					_client_id: syncClientId,
					_synced_at: null,
				};
				await localDb.transaction(
					"rw",
					localDb.categories,
					localDb.mutation_queue,
					async () => {
						await localDb.categories.put(record);
						await enqueueMutation({
							table: "categories",
							operation: "insert",
							record_id: id,
							patch: record,
						});
					},
				);
			} else if (data.type === "update") {
				const existing = await localDb.categories.get(data.payload.id);
				const patch = computePatch(existing ?? {}, {
					name: data.payload.name,
					color: data.payload.color,
				} as Record<string, unknown>);
				await localDb.transaction(
					"rw",
					localDb.categories,
					localDb.mutation_queue,
					async () => {
						await localDb.categories.update(data.payload.id, {
							...patch,
							_sync_state: "pending",
						});
						await enqueueMutation({
							table: "categories",
							operation: "update",
							record_id: data.payload.id,
							patch,
						});
					},
				);
			} else if (data.type === "delete") {
				if (data.payload.cascade) {
					// Cascade delete via RPC — direct server call, then remove from Dexie
					const db = await getDb();
					const res = await db.rpc("delete_category", {
						p_category_id: data.payload.id,
						p_cascade_delete: true,
						p_user_id: userId,
						p_organization_id: orgId,
					});
					if (res.error) throw res.error;
					// Clean up Dexie: remove category + null out category_id on related transactions
					const affected = await localDb.transactions
						.filter(t => t.category_id === data.payload.id)
						.toArray();
					await localDb.categories.delete(data.payload.id);
					if (affected.length > 0) {
						await localDb.transactions.bulkPut(
							affected.map(t => ({
								...t,
								category_id: null,
							})),
						);
					}
				} else {
					const now = new Date().toISOString();
					await localDb.transaction(
						"rw",
						localDb.categories,
						localDb.mutation_queue,
						async () => {
							await localDb.categories.update(data.payload.id, {
								deleted_at: now,
								_sync_state: "pending",
							});
							await enqueueMutation({
								table: "categories",
								operation: "delete",
								record_id: data.payload.id,
								patch: {},
							});
						},
					);
				}
			} else {
				throw new Error("Invalid operation type");
			}

			// Invalidate so UI re-reads from Dexie immediately
			queryClient.invalidateQueries({
				queryKey: ["cat", "get"],
				exact: false,
			});

			// Flush queue async
			flushQueue().catch(console.error);
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
		},
		onError: () => {
			toast.error("Failed to perform operation");
		},
	});
	return query;
};

export type TransactionMutationProps =
	| {
			type: "create";
			payload: Record<string, unknown>;
	  }
	| {
			type: "update";
			payload: { id: string; patch: Record<string, unknown> };
	  }
	| { type: "delete"; payload: { id: string } }
	| { type: "bulk_delete"; payload: { ids: string[] } }
	| {
			type: "bulk_update";
			payload: {
				updates: { id: string; patch: Record<string, unknown> }[];
			};
	  };

export const useTransactionMutation = () => {
	const queryClient = useQueryClient();
	const { data: authData } = authClient.useSession();

	return useMutation({
		mutationKey: ["tr", "mut"],
		mutationFn: async (data: TransactionMutationProps) => {
			if (!authData?.user?.id) return;

			const localDb = getLocalDb();
			const syncClientId = useSyncStore.getState().clientId;
			const userId = authData.user.id;
			const orgId = authData.session?.activeOrganizationId ?? null;

			if (data.type === "create") {
				const id = crypto.randomUUID();
				const now = new Date().toISOString();
				const record = {
					...data.payload,
					id,
					user_id: userId,
					organization_id: orgId,
					created_at: now,
					updated_at: now,
					deleted_at: null,
					_sync_state: "pending" as const,
					_client_id: syncClientId,
					_synced_at: null,
				};
				await localDb.transaction(
					"rw",
					localDb.transactions,
					localDb.mutation_queue,
					async () => {
						await localDb.transactions.put(record);
						await enqueueMutation({
							table: "transactions",
							operation: "insert",
							record_id: id,
							patch: record,
						});
					},
				);
			} else if (data.type === "update") {
				const existing = await localDb.transactions.get(
					data.payload.id,
				);
				const patch = computePatch(
					(existing ?? {}) as Record<string, unknown>,
					data.payload.patch,
				);
				if (Object.keys(patch).length === 0) return;
				await localDb.transaction(
					"rw",
					localDb.transactions,
					localDb.mutation_queue,
					async () => {
						await localDb.transactions.update(data.payload.id, {
							...patch,
							_sync_state: "pending",
						});
						await enqueueMutation({
							table: "transactions",
							operation: "update",
							record_id: data.payload.id,
							patch,
						});
					},
				);
			} else if (data.type === "delete") {
				const now = new Date().toISOString();
				await localDb.transaction(
					"rw",
					localDb.transactions,
					localDb.mutation_queue,
					async () => {
						await localDb.transactions.update(data.payload.id, {
							deleted_at: now,
							_sync_state: "pending",
						});
						await enqueueMutation({
							table: "transactions",
							operation: "delete",
							record_id: data.payload.id,
							patch: {},
						});
					},
				);
			} else if (data.type === "bulk_delete") {
				const now = new Date().toISOString();
				await localDb.transaction(
					"rw",
					localDb.transactions,
					localDb.mutation_queue,
					async () => {
						for (const id of data.payload.ids) {
							await localDb.transactions.update(id, {
								deleted_at: now,
								_sync_state: "pending",
							});
							await enqueueMutation({
								table: "transactions",
								operation: "delete",
								record_id: id,
								patch: {},
							});
						}
					},
				);
			} else if (data.type === "bulk_update") {
				await localDb.transaction(
					"rw",
					localDb.transactions,
					localDb.mutation_queue,
					async () => {
						for (const { id, patch } of data.payload.updates) {
							const existing = await localDb.transactions.get(id);
							const diff = computePatch(
								(existing ?? {}) as Record<string, unknown>,
								patch,
							);
							if (Object.keys(diff).length === 0) continue;
							await localDb.transactions.update(id, {
								...diff,
								_sync_state: "pending",
							});
							await enqueueMutation({
								table: "transactions",
								operation: "update",
								record_id: id,
								patch: diff,
							});
						}
					},
				);
			}

			queryClient.invalidateQueries({
				queryKey: ["tr", "get"],
				exact: false,
			});

			flushQueue().catch(console.error);
		},
		onError: () => {
			toast.error("Failed to perform transaction operation");
		},
	});
};

export const useTransactions = () => {
	const { error: authError } = authClient.useSession();

	const filterStack = useFilterStore(s => s.filter_stack);
	const pageSize = useDisplayStore(s => s.display_page_size);
	const queryClient = useQueryClient();

	const { user_id, active_organization_id } = useAuthGuard();

	const query = useQuery<any>({
		queryKey: [
			"tr",
			"get",
			filterStack,
			pageSize,
			user_id,
			active_organization_id,
		],
		staleTime: 0,
		queryFn: async () => {
			if (!user_id) return [];

			const localDb = getLocalDb();
			const orgId = active_organization_id ?? null;
			const limit = Math.min(
				10000,
				Number.isSafeInteger(Number(pageSize)) ? Number(pageSize) : 100,
			);

			// Read from Dexie — exclude soft-deleted, scope to user/org
			let records = await localDb.transactions
				.filter(
					r =>
						r.deleted_at === null &&
						(orgId !== null ?
							r.organization_id === orgId
						:	r.organization_id === null && r.user_id === user_id),
				)
				.toArray();

			// Apply in-memory filters
			// NOTE: biggest problem of this is that we will need a local copy of the entire table
			// this is not a big deal for now, but it will be for the future (even having ~1GB of data is just too big)
			// TODO: figure out a better way to do this
			records = applyFiltersLocal(records, filterStack);

			// Apply page size
			records = records.slice(0, limit);

			// Background delta pull
			triggerPull("transactions", queryClient, user_id, orgId).catch(
				console.error,
			);

			return records;
		},
		enabled: authError === null && user_id !== null,
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
	const { data: authData, error: authError, isPending: isSessionLoading } = authClient.useSession();
	if (authError) throw authError;
	const res = useQuery({
		queryKey: ["tr", "dist", authData?.user?.id, start_date, end_date, filterStack],
		queryFn: async () => {
			if (!navigator.onLine) return [];
			const db = await getDb();
			const filters = serializeFilterStack(filterStack);
			if (start_date && end_date) {
				filters.push({
					field: "transaction_date",
					operation: "between",
					value: [start_date, end_date],
				});
			}
			const res = await db.rpc(
				"get_transaction_distribution_by_category",
				{
					params: {
						user_id: authData?.user?.id,
						organization_id:
							authData?.session?.activeOrganizationId,
						filters,
					},
				},
			);
			if (res.error) throw res.error;
			return res.data as TransactionDistribution[];
		},
		enabled: !isSessionLoading && authError === null && !!authData?.user?.id,
	});

	return res;
};

export const useAuth = () => {
	const { data: authData, error: authError } = authClient.useSession();
	const withAuth = React.useCallback(
		(
			query: PostgrestFilterBuilder<
				{ PostgrestVersion: "12" },
				any,
				any,
				any
			>,
		) => {
			if (authError) throw authError;
			if (!authData?.session?.activeOrganizationId) {
				query
					.is("organization_id", null)
					.eq("user_id", authData?.user?.id);
			} else {
				query.eq(
					"organization_id",
					authData?.session?.activeOrganizationId,
				);
			}
			return query;
		},
		[authData],
	);
	return withAuth;
};

export const useAuthGuard = () => {
	const { data: authData, error: authError } = authClient.useSession();
	const withAuth = React.useCallback(
		(
			query: PostgrestFilterBuilder<
				{ PostgrestVersion: "12" },
				any,
				any,
				any
			>,
		) => {
			if (authError) throw authError;
			if (!authData?.session?.activeOrganizationId) {
				return query
					.is("organization_id", null)
					.eq("user_id", authData?.user?.id);
			} else {
				return query.eq(
					"organization_id",
					authData?.session?.activeOrganizationId,
				);
			}
		},
		[authData?.session?.activeOrganizationId, authData?.user?.id],
	);
	return {
		withAuth,
		user_id: authData?.user?.id,
		active_organization_id: authData?.session?.activeOrganizationId,
	};
};
