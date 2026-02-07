"use client";

import { useDashboardStore } from "@/lib/store";
import type { WidgetConfig } from "@/lib/types/dashboard";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { GripVertical, Settings, Trash2 } from "lucide-react";
import { WidgetRenderer } from "./widget-renderer";

interface WidgetCardProps {
	widget: WidgetConfig;
}

export function WidgetCard({ widget }: WidgetCardProps) {
	const isEditing = useDashboardStore(s => s.isEditing);
	const openWidgetSettings = useDashboardStore(s => s.openWidgetSettings);
	const deleteWidget = useDashboardStore(s => s.deleteWidget);

	return (
		<Card className="flex h-full flex-col overflow-hidden py-0">
			<CardHeader className="[.border-b]:pb-2 flex flex-row items-center gap-2 border-b px-3 py-2">
				{isEditing && (
					<div className="drag-handle cursor-grab active:cursor-grabbing">
						<GripVertical className="text-muted-foreground size-4" />
					</div>
				)}
				<CardTitle className="flex size-7 min-w-0 flex-1 items-center truncate text-sm font-medium">
					{widget.title}
				</CardTitle>
				{isEditing && (
					<div className="flex shrink-0 gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="size-7"
							onClick={() => openWidgetSettings(widget)}>
							<Settings className="size-3.5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="size-7"
							onClick={() => deleteWidget(widget.id)}>
							<Trash2 className="size-3.5" />
						</Button>
					</div>
				)}
			</CardHeader>
			<CardContent className="min-h-0 flex-1 p-2">
				<WidgetRenderer widget={widget} />
			</CardContent>
		</Card>
	);
}
