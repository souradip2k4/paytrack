"use client";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	ArrowUpRight,
	Bolt,
	Command,
	Home,
	MessageCircleQuestion,
	ReceiptCent,
	UserCircle,
	type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface NavMainItem {
	group_title?: string;
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
	}[];
}

export const navs: NavMainItem[] = [
	{
		items: [
			{
				title: "Home",
				url: "/home",
				icon: Home,
			},
			{
				title: "Transactions",
				url: "/app",
				icon: ReceiptCent,
			},
			/*{
                title: "Subscriptions",
                url: "/sub",
                icon: BellPlus
            },
            {
                title: "Budgets",
                url: "/budget",
                icon: DiamondPercent
            }*/
		],
	},
	{
		group_title: "More",
		items: [
			{
				title: "Settings",
				url: "/settings",
				icon: Bolt,
			},
			{
				title: "Your account",
				url: "/accounts",
				icon: UserCircle,
			},
			{
				title: "Help",
				url: "/help",
				icon: MessageCircleQuestion,
			},
			{
				title: "Shortcuts",
				url: "/shortcuts",
				icon: Command,
			},
		],
	},
];

export function NavMain() {
	return (
		<React.Fragment>
			{navs.map((x, i) => (
				<React.Fragment key={i}>
					<SidebarGroup>
						{x.group_title && (
							<SidebarGroupLabel>
								{x.group_title}
							</SidebarGroupLabel>
						)}
						<SidebarGroupContent>
							<SidebarMenu>
								{x.items.map((item, i) => {
									return (
										<SidebarMenuItem key={i}>
											<SidebarMenuButton
												size="sm"
												asChild>
												<Link href={item.url}>
													{item.icon && (
														<item.icon className="size-4" />
													)}
													{item.title}
													{(item.title === "Help" ||
														item.title ===
															"Shortcuts") && (
														<ArrowUpRight className="size-4" />
													)}
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</React.Fragment>
			))}
		</React.Fragment>
	);
}
