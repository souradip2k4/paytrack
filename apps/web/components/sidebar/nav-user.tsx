"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { avatarUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

export function NavUser() {
	const { isMobile } = useSidebar();

	const { data } = useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			const { data, error } = await authClient.getSession();
			console.log(data);
			if (error) {
				toast.error("Failed to get session");
				return null;
			}
			return data;
		},
	});

	const { isPending: isSessionLoading } = authClient.useSession();

	const initial = React.useMemo(() => {
		let [fn, ln] = data?.user?.name?.split(" ") ?? [];
		return `${fn?.at(0)?.toUpperCase() || ""}${ln?.at(0)?.toUpperCase() || ""}`;
	}, [data]);

	return (
		<SidebarMenu suppressHydrationWarning>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
							{isSessionLoading ?
								<Skeleton className="bg-secondary-foreground/20 h-8 w-8 rounded-full" />
							:	<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={avatarUrl(data?.user.image)}
										alt={data?.user.name}
									/>
									<AvatarFallback className="rounded-lg">
										{initial}
									</AvatarFallback>
								</Avatar>
							}

							<div className="grid flex-1 text-left text-sm leading-tight">
								{isSessionLoading ?
									<Skeleton className="bg-secondary-foreground/20 h-3 w-12" />
								:	<span className="truncate">
										{data?.user.name}
									</span>
								}
								{isSessionLoading ?
									<Skeleton className="bg-secondary-foreground/20 mt-1 h-3 w-full" />
								:	<span className="text-muted-foreground truncate text-xs">
										{data?.user.email}
									</span>
								}
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								{isSessionLoading ?
									<Skeleton className="bg-secondary-foreground/20 h-8 w-8 rounded-full" />
								:	<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={avatarUrl(data?.user.image)}
											alt={data?.user.name}
										/>
										<AvatarFallback className="rounded-lg">
											{initial}
										</AvatarFallback>
									</Avatar>
								}
								<div className="grid flex-1 text-left text-sm leading-tight">
									{isSessionLoading ?
										<Skeleton className="bg-secondary-foreground/20 h-3 w-12" />
									:	<span className="truncate">
											{data?.user.name}
										</span>
									}
									{isSessionLoading ?
										<Skeleton className="bg-secondary-foreground/20 mt-1 h-3 w-full" />
									:	<span className="text-muted-foreground truncate text-xs">
											{data?.user.email}
										</span>
									}
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link href="/pricing">
									<Sparkles />
									Upgrade to Pro
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem variant="destructive" asChild>
							<Link href="/logout">
								<LogOut />
								Log out
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
