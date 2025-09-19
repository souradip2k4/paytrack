"use client";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
	ArrowUpRight,
	BellPlus,
	Bolt,
	Command,
	Home,
	MessageCircleQuestion,
	ReceiptCent,
	UserCircle,
	type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavMainItem {
	group_title?: string;
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
		shortcutKey?: string;
	}[];
}

export const navs: NavMainItem[] = [
	{
		items: [
			{
				title: "Home",
				url: "/home",
				icon: Home,
				shortcutKey: "h",
			},
			{
				title: "Transactions",
				url: "/transactions",
				icon: ReceiptCent,
				shortcutKey: "t",
			},
			{
				title: "Subscriptions",
				url: "/subscriptions",
				icon: BellPlus,
				shortcutKey: "s",
			},
		],
	},
	{
		group_title: "More",
		items: [
			{
				title: "Settings",
				url: "/settings",
				icon: Bolt,
				shortcutKey: "x",
			},
			{
				title: "Your account",
				url: "/accounts",
				icon: UserCircle,
				shortcutKey: "a",
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
	const pathname = usePathname();
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
									const isActive = pathname.startsWith(
										item.url,
									);
									return (
										<SidebarMenuItem key={i}>
											<SidebarMenuButton
												size="sm"
												className={cn({
													"bg-accent hover:bg-accent":
														isActive,
												})}
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
													{item.shortcutKey && (
														<kbd
															className={cn(
																"bg-muted text-muted-foreground relative ml-auto rounded px-[0.3rem] py-0 font-mono text-xs brightness-125",
																{
																	"bg-accent":
																		isActive,
																},
															)}>
															{item.shortcutKey}
														</kbd>
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

{
	/*{
				title: "Subscriptions",
				url: "/subscriptions",
				icon: BellPlus,
				shortcutKey: "s",
			},
			{
				title: "Budgets",
				url: "/budgets",
				icon: DiamondPercent,
				shortcutKey: "b",
			},*/
}
