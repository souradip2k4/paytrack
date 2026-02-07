import { serializeFilterStack, useFilterStore } from "@/lib/store/filter-store";
import type { DashboardView, WidgetConfig } from "@/lib/types/dashboard";
import { authClient } from "@budgetbee/core/auth-client";
import { getDb } from "@budgetbee/core/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthGuard } from "../query";

export const useDashboardViews = () => {
	const { withAuth, user_id, active_organization_id } = useAuthGuard();
	return useQuery({
		queryKey: ["dashboard", "list", user_id, active_organization_id],
		queryFn: async () => {
			if (!user_id) return [];
			const db = await getDb();
			const query = db
				.from("dashboard_views")
				.select("*")
				.order("created_at", { ascending: false });
			const res = await withAuth(query);
			if (res.error) return [];
			return res.data as (DashboardView & {
				id: string;
				created_at: string;
				updated_at: string;
			})[];
		},
		enabled: !!user_id,
	});
};

export const useDashboardView = (id: string | undefined) => {
	const { withAuth, user_id, active_organization_id } = useAuthGuard();
	return useQuery({
		queryKey: ["dashboard", "get", id, user_id, active_organization_id],
		queryFn: async () => {
			if (!id || !user_id) return null;
			const db = await getDb();
			const query = db.from("dashboard_views").select("*").eq("id", id);
			const res = await withAuth(query).single();
			if (res.error) return null;
			return res.data as DashboardView & {
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
			const db = await getDb();
			let res: any;

			if (data.type === "create") {
				res = await db
					.from("dashboard_views")
					.insert({
						name: data.payload.name,
						widgets: data.payload.widgets ?? [],
						user_id: authData.user.id,
						organization_id:
							authData.session?.activeOrganizationId ?? null,
					})
					.select()
					.single();
			} else if (data.type === "update") {
				const update: Record<string, any> = {};
				if (data.payload.name !== undefined)
					update.name = data.payload.name;
				if (data.payload.widgets !== undefined)
					update.widgets = data.payload.widgets;
				if (data.payload.is_default !== undefined)
					update.is_default = data.payload.is_default;
				res = await db
					.from("dashboard_views")
					.update(update)
					.eq("id", data.payload.id)
					.select()
					.single();
			} else if (data.type === "delete") {
				res = await db
					.from("dashboard_views")
					.delete()
					.eq("id", data.payload.id);
			}

			if (res?.error) throw res.error;
			return res?.data;
		},
		onSuccess: (_, variables) => {
			if (variables.type === "create") toast.success("Dashboard created");
			else if (variables.type === "update")
				toast.success("Dashboard saved");
			else if (variables.type === "delete")
				toast.success("Dashboard deleted");

			queryClient.invalidateQueries({
				queryKey: ["dashboard"],
				exact: false,
			});
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
