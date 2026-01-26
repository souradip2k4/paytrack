"use client";

import { cn } from "@budgetbee/ui/lib/utils";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@budgetbee/ui/core/sidebar";
import {
	ArrowBigUp,
	ArrowUpRight,
	Bolt,
	Building2,
	Command,
	Home,
	ReceiptCent,
	UserCircle,
	BellPlus,
	type LucideIcon,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useFeatureFlag } from "@/components/feature-flag-provider";
import { authClient } from "@budgetbee/core/auth-client";
import { useActiveMember } from "@/lib/organization";

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
				title: "Your organization",
				url: "/organizations/settings",
				icon: Users,
				shortcutKey: "o",
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
	const { data: authData } = authClient.useSession()

	const { isEnabled: isSubscriptionEnabled } = useFeatureFlag("useSubscriptions");

	React.useEffect(() => {
		if (isSubscriptionEnabled) {

		}
	}, [isSubscriptionEnabled]);

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
									/*if (item.title === "Subscriptions" && !isSubscriptionEnabled) return null;*/

									const isActive = pathname.startsWith(
										item.url,
									);
									return (
										<SidebarMenuItem hidden={item.title === "Your organization" && !authData?.session.activeOrganizationId} key={i}>
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
																"bg-muted text-muted-foreground pointer-events-none relative ml-auto inline-flex select-none items-center justify-center rounded px-[0.3rem] py-0 font-mono text-xs brightness-125",
																{
																	"bg-accent":
																		isActive,
																},
															)}>
															<ArrowBigUp className="size-3" />
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
