"use client";

import {
	FilterClear,
	FilterDialog,
	FilterPills,
} from "@/components/filter-dropdown";
import { useDashboardMutation } from "@/lib/query/dashboard-queries";
import { useDashboardStore } from "@/lib/store";
import type { DashboardView, WidgetConfig } from "@/lib/types/dashboard";
import { Button } from "@budgetbee/ui/core/button";
import { Input } from "@budgetbee/ui/core/input";
import { Pencil, Plus, Save, X } from "lucide-react";
import * as React from "react";

interface DashboardToolbarProps {
	dashboard: DashboardView & { id: string };
}

export function DashboardToolbar({ dashboard }: DashboardToolbarProps) {
	const mutation = useDashboardMutation();

	const isEditing = useDashboardStore(s => s.isEditing);
	const setIsEditing = useDashboardStore(s => s.setIsEditing);
	const draftWidgets = useDashboardStore(s => s.draftWidgets);
	const setDraftWidgets = useDashboardStore(s => s.setDraftWidgets);
	const openWidgetSettings = useDashboardStore(s => s.openWidgetSettings);

	const [draftName, setDraftName] = React.useState(dashboard.name);

	React.useEffect(() => {
		setDraftName(dashboard.name);
	}, [dashboard.name]);

	const handleEdit = () => {
		setDraftWidgets(dashboard.widgets as WidgetConfig[]);
		setIsEditing(true);
	};

	const handleCancel = () => {
		setDraftWidgets(dashboard.widgets as WidgetConfig[]);
		setDraftName(dashboard.name);
		setIsEditing(false);
	};

	const handleSave = () => {
		mutation.mutate(
			{
				type: "update",
				payload: {
					id: dashboard.id,
					name: draftName,
					widgets: draftWidgets,
				},
			},
			{ onSuccess: () => setIsEditing(false) },
		);
	};

	const handleAddWidget = () => {
		openWidgetSettings(null);
	};

	if (isEditing) {
		return (
			<div className="flex items-center justify-between border-b px-4 py-2">
				<div className="flex items-center gap-2">
					<Input
						value={draftName}
						onChange={e => setDraftName(e.target.value)}
						className="h-8 w-60"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="outline"
						onClick={handleAddWidget}>
						<Plus className="size-4" />
						Add Widget
					</Button>
					<Button size="sm" variant="outline" onClick={handleCancel}>
						<X className="size-4" />
						Cancel
					</Button>
					<Button
						size="sm"
						onClick={handleSave}
						disabled={mutation.isPending}>
						<Save className="size-4" />
						Save
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-start justify-between border-b p-2">
			<div className="flex flex-wrap gap-2">
				<FilterDialog />
				<FilterClear />
				<FilterPills />
			</div>
			<div className="flex gap-2">
				<Button size="sm" variant="outline" onClick={handleEdit}>
					<Pencil className="mr-1 size-4" />
					Edit
				</Button>
			</div>
		</div>
	);
}
