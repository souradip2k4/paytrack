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
import { options, PricingCard } from "../pricing";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
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
				<Dialog>
					<DialogTrigger asChild>
						<Card className="mb-2">
							<CardHeader>
								<CardTitle className="font-normal">
									Upgrade to pro ✨
								</CardTitle>
								<CardDescription>
									Unlock ai features, teams, commerical
									license and priority support while also
									supporting the devs.
								</CardDescription>
							</CardHeader>
						</Card>
					</DialogTrigger>

					<DialogContent className="min-w-fit max-w-fit">
						<DialogHeader>
							<DialogTitle className="font-normal">
								Upgrade your plan
							</DialogTitle>
						</DialogHeader>

						<div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[360px_360px]">
							{options
								.filter(x => x.price !== null)
								.map((option, index) => (
									<React.Fragment key={index}>
										<PricingCard option={option} />
									</React.Fragment>
								))}
						</div>
					</DialogContent>
				</Dialog>

				<Separator />

				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
