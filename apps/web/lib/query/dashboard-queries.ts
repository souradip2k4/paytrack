import { serializeFilterStack, useFilterStore } from "@/lib/store/filter-store";
import {
	computePatch,
	enqueueMutation,
	flushQueue,
	getLocalDb,
	useSyncStore,
} from "@/lib/sync";
import type { DashboardView, WidgetConfig } from "@/lib/types/dashboard";
import { authClient } from "@budgetbee/core/auth-client";
import { getDb } from "@budgetbee/core/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthGuard } from "../query";
import { triggerPull } from "../sync/pull";

export const useDashboardViews = () => {
	const { user_id, active_organization_id } = useAuthGuard();
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: ["dashboard", "list", user_id, active_organization_id],
		staleTime: 0,
		queryFn: async () => {
			if (!user_id) return [];

			const localDb = getLocalDb();
			const orgId = active_organization_id ?? null;

			const records = await localDb.dashboard_views
				.filter(
					r =>
						r.deleted_at === null &&
						(orgId !== null ?
							r.organization_id === orgId
						:	r.organization_id === null && r.user_id === user_id),
				)
				.toArray();

			// Sort newest first by created_at
			records.sort((a, b) =>
				(b.created_at as string ?? "").localeCompare(a.created_at as string ?? ""),
			);

			triggerPull("dashboard_views", queryClient, user_id, orgId).catch(
				console.error,
			);

			return records as unknown as (DashboardView & {
				id: string;
				created_at: string;
				updated_at: string;
			})[];
		},
		enabled: !!user_id,
	});
};

export const useDashboardView = (id: string | undefined) => {
	const { user_id, active_organization_id } = useAuthGuard();
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: ["dashboard", "get", id, user_id, active_organization_id],
		staleTime: 0,
		queryFn: async () => {
			if (!id || !user_id) return null;

			const localDb = getLocalDb();

			const record = await localDb.dashboard_views.get(id);
			if (!record || record.deleted_at !== null) return null;

			// Background pull to refresh this specific record
			const orgId = active_organization_id ?? null;
			triggerPull("dashboard_views", queryClient, user_id, orgId).catch(
				console.error,
			);

			return record as unknown as DashboardView & {
				id: string;
				created_at: string;
				updated_at: string;
			};
		},
		enabled: !!id && !!user_id,
	});
};

export type DashboardMutationProps =
	| { type: "create"; payload: { name: string; widgets?: WidgetConfig[] } }
	| {
			type: "update";
			payload: {
				id: string;
				name?: string;
				widgets?: WidgetConfig[];
				is_default?: boolean;
			};
	  }
	| { type: "delete"; payload: { id: string } };

export const useDashboardMutation = () => {
	const queryClient = useQueryClient();
	const { data: authData } = authClient.useSession();

	return useMutation({
		mutationKey: [
			"dashboard",
			"mut",
			authData?.user?.id,
			authData?.session?.activeOrganizationId,
		],
		mutationFn: async (data: DashboardMutationProps) => {
			if (!authData?.user?.id) return;

			const localDb = getLocalDb();
			const userId = authData.user.id;
			const orgId = authData.session?.activeOrganizationId ?? null;
			const syncClientId = useSyncStore.getState().clientId;

			if (data.type === "create") {
				const id = crypto.randomUUID();
				const now = new Date().toISOString();
				const record = {
					id,
					name: data.payload.name,
					widgets: data.payload.widgets ?? [],
					is_default: false,
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
					localDb.dashboard_views,
					localDb.mutation_queue,
					async () => {
						await localDb.dashboard_views.put(record);
						await enqueueMutation({
							table: "dashboard_views",
							operation: "insert",
							record_id: id,
							patch: record,
						});
					},
				);
				queryClient.invalidateQueries({
					queryKey: ["dashboard"],
					exact: false,
				});
				flushQueue().catch(console.error);
				return record;
			} else if (data.type === "update") {
				const existing = await localDb.dashboard_views.get(
					data.payload.id,
				);
				const afterState: Record<string, unknown> = {};
				if (data.payload.name !== undefined)
					afterState.name = data.payload.name;
				if (data.payload.widgets !== undefined)
					afterState.widgets = data.payload.widgets;
				if (data.payload.is_default !== undefined)
					afterState.is_default = data.payload.is_default;

				const patch = computePatch(existing ?? {}, afterState);
				await localDb.transaction(
					"rw",
					localDb.dashboard_views,
					localDb.mutation_queue,
					async () => {
						await localDb.dashboard_views.update(data.payload.id, {
							...patch,
							_sync_state: "pending",
						});
						await enqueueMutation({
							table: "dashboard_views",
							operation: "update",
							record_id: data.payload.id,
							patch,
						});
					},
				);
				queryClient.invalidateQueries({
					queryKey: ["dashboard"],
					exact: false,
				});
				flushQueue().catch(console.error);
				return { id: data.payload.id, ...patch };
			} else if (data.type === "delete") {
				const now = new Date().toISOString();
				await localDb.transaction(
					"rw",
					localDb.dashboard_views,
					localDb.mutation_queue,
					async () => {
						await localDb.dashboard_views.update(data.payload.id, {
							deleted_at: now,
							_sync_state: "pending",
						});
						await enqueueMutation({
							table: "dashboard_views",
							operation: "delete",
							record_id: data.payload.id,
							patch: {},
						});
					},
				);
				queryClient.invalidateQueries({
					queryKey: ["dashboard"],
					exact: false,
				});
				flushQueue().catch(console.error);
			}
		},
		onSuccess: (_, variables) => {
			if (variables.type === "create") toast.success("Dashboard created");
			else if (variables.type === "update")
				toast.success("Dashboard saved");
			else if (variables.type === "delete")
				toast.success("Dashboard deleted");
		},
		onError: () => {
			toast.error("Failed to perform dashboard operation");
		},
	});
};

export type WidgetDataRow = {
	period: string;
	metric: string;
	aggregate: number;
};

export type WidgetStatRow = {
	aggregate: number;
};

export const useWidgetData = (widget: WidgetConfig | null) => {
	const { data: authData } = authClient.useSession();
	const filterStack = useFilterStore(s => s.filter_stack);

	// Serialize filter stack to JSONB format for the SQL function
	const filters = serializeFilterStack(filterStack);

	return useQuery({
		queryKey: [
			"dashboard",
			"widget",
			widget?.id,
			widget?.dataSource,
			widget?.metric,
			widget?.aggregation,
			widget?.interval,
			filters,
		],
		queryFn: async () => {
			if (!widget || !authData?.user?.id) return null;
			if (!navigator.onLine) return null;
			const db = await getDb();

			// Map dataSource to the metric field for get_transaction_aggregate
			const metricMap: Record<string, string> = {
				transaction_distribution_category: "category_id",
				transaction_distribution_status: "status",
			};

			const p_metric = metricMap[widget.dataSource] ?? "category_id";

			const res = await db.rpc("get_transaction_aggregate", {
				p_user_id: authData.user.id,
				p_organization_id:
					authData.session?.activeOrganizationId ?? null,
				p_filters: filters,
				p_metric,
				p_interval: widget.interval ?? "day",
				p_aggregate_fn: widget.aggregation ?? "sum",
				p_transaction_type: widget.metric,
			});

			if (res.error) throw res.error;

			return res.data as WidgetDataRow[];
		},
		enabled:
			!!widget && widget.chartType !== "number" && !!authData?.user?.id,
	});
};

export const useWidgetStat = (widget: WidgetConfig | null) => {
	const { data: authData } = authClient.useSession();
	const filterStack = useFilterStore(s => s.filter_stack);
	const filters = serializeFilterStack(filterStack);

	return useQuery({
		queryKey: [
			"dashboard",
			"widget-stat",
			widget?.id,
			widget?.metric,
			widget?.aggregation,
			filters,
		],
		queryFn: async () => {
			if (!widget || !authData?.user?.id) return null;
			if (!navigator.onLine) return null;
			const db = await getDb();

			const res = await db.rpc("get_transaction_stat", {
				p_user_id: authData.user.id,
				p_organization_id:
					authData.session?.activeOrganizationId ?? null,
				p_filters: filters,
				p_aggregate_fn: widget.aggregation ?? "sum",
				p_transaction_type: widget.metric,
			});

			if (res.error) throw res.error;

			const rows = res.data as WidgetStatRow[];
			return rows?.[0] ?? null;
		},
		enabled:
			!!widget && widget.chartType === "number" && !!authData?.user?.id,
	});
};
