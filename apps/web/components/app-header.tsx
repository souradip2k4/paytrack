"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@budgetbee/ui/core/tooltip";
import { BadgeInfo } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import { CreateDashboardDialog } from "./dashboard/create-dashboard-dialog";
import { DashboardBreadcrumb } from "./dashboard/dashboard-breadcrumb";
import { navs } from "./sidebar/nav-main";
import { TransactionDialog } from "./transaction-editor";
import { ViewCategoryPopover } from "./view-category-popover";

export function AppHeader() {
	const pathname = usePathname();

	const isDashboardDetail =
		pathname.startsWith("/dashboards/") && pathname !== "/dashboards";
	const isDashboardList = pathname === "/dashboards";

	const match = React.useMemo(() => {
		for (const nav of navs) {
			const match = nav.items.find(x => x.url.startsWith(pathname));
			if (match) return match;
		}
		return undefined;
	}, [pathname]);

	if (isDashboardDetail) {
		return <DashboardBreadcrumb />;
	}

	return (
		<React.Fragment>
			<div className="flex items-center justify-center gap-2">
				{match && match.icon && (
					<match.icon
						className="stroke-muted-foreground m-1 h-4 w-4"
						absoluteStrokeWidth
					/>
				)}
				<h1 className="text-muted-foreground m-0 text-sm">
					{match?.title}
				</h1>
			</div>

			{isDashboardList && (
				<div className="ml-auto flex gap-2">
					<CreateDashboardDialog />
				</div>
			)}

			{pathname.startsWith("/transactions") && (
				<div className="ml-auto flex gap-2">
					<Tooltip delayDuration={750}>
						<TooltipTrigger asChild>
							<ViewCategoryPopover />
						</TooltipTrigger>
						<TooltipContent className="bg-accent border p-2 shadow-xl">
							<div className="flex items-center justify-center gap-2">
								<BadgeInfo className="text-muted-foreground size-4" />
								<p>View categories.</p>
							</div>
						</TooltipContent>
					</Tooltip>

					<TransactionDialog />

					{/*<Tooltip delayDuration={750}>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								className="size-8 border"
								variant="secondary">
								<ListPlus />
							</Button>
						</TooltipTrigger>
						<TooltipContent className="bg-accent border p-2 shadow-xl">
							<div className="flex items-center justify-center gap-2">
								<BadgeInfo className="text-muted-foreground size-4" />
								<p>Add multiple transactions.</p>
							</div>
						</TooltipContent>
					</Tooltip>*/}
				</div>
			)}
		</React.Fragment>
	);
}
