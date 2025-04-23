"use client";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import React from "react";

interface NavMainItem {
	group_title: string;
	items: {
		title: string;
		url: string;
	}[];
}

interface NavMainProps {
	navs: NavMainItem[];
}

export function NavMain({ navs }: NavMainProps) {
	return (
		<React.Fragment>
			{navs.map((x, i) => (
				<React.Fragment key={i}>
					<SidebarGroup>
						<SidebarGroupLabel>{x.group_title}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{x.items.map((item, i) => {
									return (
										<SidebarMenuItem key={i}>
											<SidebarMenuButton asChild>
												<Link href={item.url}>
													{item.title}
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
