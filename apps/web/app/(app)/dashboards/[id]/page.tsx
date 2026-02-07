"use client";

import { useDashboardView } from "@/lib/query/dashboard-queries";
import { useDashboardStore } from "@/lib/store";
import { DashboardToolbar } from "@/components/dashboard/dashboard-toolbar";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { WidgetSettingsDialog } from "@/components/dashboard/widget-settings-dialog";
import type { WidgetConfig } from "@/lib/types/dashboard";
import { useParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import * as React from "react";

export default function DashboardViewPage() {
	const params = useParams<{ id: string }>();
	const { data: dashboard, isLoading } = useDashboardView(params.id);

	const isEditing = useDashboardStore((s) => s.isEditing);
	const draftWidgets = useDashboardStore((s) => s.draftWidgets);
	const setDraftWidgets = useDashboardStore((s) => s.setDraftWidgets);
	const resetDraft = useDashboardStore((s) => s.resetDraft);

	// Sync draft widgets when dashboard loads
	React.useEffect(() => {
		if (dashboard?.widgets) {
			setDraftWidgets(dashboard.widgets as WidgetConfig[]);
		}
	}, [dashboard, setDraftWidgets]);

	// Reset editing state on unmount
	React.useEffect(() => {
		return () => resetDraft([]);
	}, [resetDraft]);

	if (isLoading) {
		return (
			<div className="text-muted-foreground flex h-64 items-center justify-center">
				<LoaderCircle className="size-6 animate-spin" />
			</div>
		);
	}

	if (!dashboard) {
		return (
			<div className="text-muted-foreground flex h-64 items-center justify-center">
				<p>Dashboard not found</p>
			</div>
		);
	}

	const widgets = isEditing ? draftWidgets : (dashboard.widgets as WidgetConfig[]) ?? [];

	return (
		<div className="flex h-full flex-col">
			<DashboardToolbar dashboard={dashboard} />

			{widgets.length === 0 ? (
				<div className="text-muted-foreground flex flex-1 items-center justify-center">
					<p className="text-sm">
						{isEditing
							? "Click \"Add Widget\" to get started."
							: "This dashboard has no widgets yet. Click Edit to add some."}
					</p>
				</div>
			) : (
				<DashboardGrid widgets={widgets} />
			)}

			<WidgetSettingsDialog />
		</div>
	);
}
