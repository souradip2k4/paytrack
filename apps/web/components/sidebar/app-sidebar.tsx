"use client";

import * as React from "react";

import { options, PricingCard } from "@/components/pricing";
import { TUseSession } from "@/lib/query";
import { useStore } from "@/lib/store";
import { authClient } from "@budgetbee/core/auth-client";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@budgetbee/ui/core/dialog";
import { Separator } from "@budgetbee/ui/core/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@budgetbee/ui/core/sidebar";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: authData } = authClient.useSession() as TUseSession;
	const upgradePlanOpen = useStore(s => s.modal_upgrade_plan_open);

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
				<Dialog
					open={upgradePlanOpen}
					onOpenChange={s =>
						useStore.setState({ modal_upgrade_plan_open: s })
					}>
					<DialogTrigger asChild>
						{!authData?.subscription?.isSubscribed && (
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
						)}
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
