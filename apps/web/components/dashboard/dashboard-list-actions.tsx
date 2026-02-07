"use client";

import { useDashboardMutation } from "@/lib/query/dashboard-queries";
import { CreateDashboardDialog } from "./create-dashboard-dialog";
import { Button } from "@budgetbee/ui/core/button";
import { Plus } from "lucide-react";
import * as React from "react";

export function DashboardListActions() {
	const mutation = useDashboardMutation();
	const [createOpen, setCreateOpen] = React.useState(false);

	const handleCreate = (name: string) => {
		mutation.mutate({ type: "create", payload: { name } });
	};

	return (
		<>
			<Button size="sm" onClick={() => setCreateOpen(true)}>
				<Plus className="size-4" />
				New Dashboard
			</Button>
			<CreateDashboardDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				onCreate={handleCreate}
			/>
		</>
	);
}
