"use client";

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
import { LayoutDashboard, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function DashboardsPage() {
	const { data: dashboards, isLoading } = useDashboardViews();
	const { mutateAsync: deleteDashboard, isPending: isDeleting } =
		useDashboardMutation();

	// only used to show loading state
	const [deleteId, setDeleteId] = React.useState<string | null>(null);

	const handleDelete = (
		id: string,
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		e.preventDefault();
		e.stopPropagation();
		setDeleteId(id);
		deleteDashboard({ type: "delete", payload: { id } });
	};

	return (
		<div className="p-4">
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
							<Card className="hover:bg-accent/50 cursor-pointer gap-0 transition-colors">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										{d.name}
									</CardTitle>
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										isLoading={
											isDeleting && deleteId === d.id
										}
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
		</div>
	);
}
