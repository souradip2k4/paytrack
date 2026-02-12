"use client";

import { useDashboardView } from "@/lib/query/dashboard-queries";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@budgetbee/ui/core/breadcrumb";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function DashboardBreadcrumb() {
	const params = useParams<{ id: string }>();
	const { data: dashboard } = useDashboardView(params.id);

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link
							href="/dashboards"
							className="flex items-center gap-2 text-sm">
							<LayoutDashboard className="m-1 size-4" />
							Dashboards
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{dashboard?.name ?? "..."}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}
