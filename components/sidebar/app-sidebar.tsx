"use client";

import * as React from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const navMainItems = [
	{
		group_title: "Application",
		items: [
			{
				title: "Home",
				url: "/entries",
			},
			{
				title: "Insights",
				url: "/insights",
			},
		],
	},
	{
		group_title: "Developers",
		items: [
			{
				title: "API Keys",
				url: "/tokens",
			},
		],
	},
	{
		group_title: "Settings",
		items: [
			{
				title: "Account settings",
				url: "/account",
			},
			{
				title: "App settings",
				url: "/settings",
			},
			{
				title: "Plans & billing",
				url: "/billing",
			},
		],
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="#">
								<img
									src="/images/budgetbee.svg"
									className="flex aspect-square size-8 items-center justify-center rounded-lg"
								/>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate">Budgetbee</span>
									<span className="text-muted-foreground truncate text-xs">
										Free plan
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain navs={navMainItems} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
