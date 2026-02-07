"use client";

import { CreateDashboardDialog } from "@/components/dashboard/create-dashboard-dialog";
import {
	useDashboardMutation,
	useDashboardViews,
} from "@/lib/query/dashboard-queries";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function DashboardsPage() {
	const { data: dashboards, isLoading } = useDashboardViews();
	const mutation = useDashboardMutation();
	const [createOpen, setCreateOpen] = React.useState(false);

	const handleCreate = (name: string) => {
		mutation.mutate({ type: "create", payload: { name } });
	};

	const handleDelete = (
		id: string,
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		e.preventDefault();
		e.stopPropagation();
		mutation.mutate({ type: "delete", payload: { id } });
	};

	return (
		<div className="p-4">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-lg">Dashboards</h1>
				<Button size="sm" onClick={() => setCreateOpen(true)}>
					<Plus className="size-4" />
					New Dashboard
				</Button>
			</div>

			{isLoading ?
				<div className="text-muted-foreground py-12 text-center text-sm">
					Loading dashboards...
				</div>
			: !dashboards || dashboards.length === 0 ?
				<div className="text-muted-foreground py-12 text-center">
					<LayoutDashboard className="mx-auto mb-2 size-10 opacity-40" />
					<p className="text-sm">
						No dashboards yet. Create one to get started.
					</p>
				</div>
			:	<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{dashboards.map(d => (
						<Link key={d.id} href={`/dashboards/${d.id}`}>
							<Card className="hover:bg-accent/50 cursor-pointer transition-colors">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										{d.name}
									</CardTitle>
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										onClick={(
											e: React.MouseEvent<HTMLButtonElement>,
										) => handleDelete(d.id, e)}>
										<Trash2 className="size-3.5" />
									</Button>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground text-xs">
										{d.widgets?.length ?? 0} widget
										{(d.widgets?.length ?? 0) !== 1 ?
											"s"
										:	""}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			}

			<CreateDashboardDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				onCreate={handleCreate}
			/>
		</div>
	);
}
