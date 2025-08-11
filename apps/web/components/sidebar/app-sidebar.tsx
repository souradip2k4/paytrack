"use client";

import * as React from "react";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "../ui/separator";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link href="/home">
								<img
									src="/images/budgetbee.svg"
									className="flex aspect-square size-6 items-center justify-center rounded"
								/>
								<p className="truncate">Budgetbee</p>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain />
			</SidebarContent>
			<SidebarFooter>
				<Link href="/pricing">
					<Card className="mb-2">
						<CardHeader>
							<CardTitle className="font-normal">
								Upgrade to pro ✨
							</CardTitle>
							<CardDescription>
								Unlock ai features, teams, commerical license
								and priority support while also supporting the
								devs.
							</CardDescription>
						</CardHeader>
					</Card>
				</Link>

				<Separator />

				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
