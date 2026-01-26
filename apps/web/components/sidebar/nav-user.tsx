"use client";

import { TUseSession } from "@/lib/query";
import { useStore } from "@/lib/store";
import { avatarUrl } from "@/lib/utils";
import { authClient } from "@budgetbee/core/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@budgetbee/ui/core/avatar";
import { Badge } from "@budgetbee/ui/core/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@budgetbee/ui/core/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@budgetbee/ui/core/sidebar";
import { Skeleton } from "@budgetbee/ui/core/skeleton";
import { getInitials } from "@budgetbee/ui/lib/utils";
import {
	Check,
	ChevronsUpDown,
	LogOut,
	Plus,
	ReceiptCent,
	Sparkles,
	UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export function NavUser() {
	const { isMobile } = useSidebar();

	const { data: authData, isPending: isSessionLoading } =
		authClient.useSession() as TUseSession;

	const { data: organizations, isPending: isOrganizationsLoading } =
		authClient.useListOrganizations();
	const { data: activeMember, isPending: isMemberLoading } =
		authClient.useActiveMember();
	const activeOrganizationName = React.useMemo(
		() =>
			organizations?.find(org => org.id === activeMember?.organizationId)
				?.name,
		[organizations, activeMember],
	);

	const handleOrganizationSwitch = async (organizationId: string | null) => {
		await authClient.organization.setActive({ organizationId });
		window.location.reload();
	};



	const initial = React.useMemo(
		() => getInitials(authData?.user?.name),
		[authData],
	);

	const router = useRouter();

	const handlePortalRedirect = async () => {
		const portal = await authClient.customer.portal();
		if (portal.error) return toast.error("Failed to redirect to portal");
		router.push(portal.data.url);
	};

	return (
		<SidebarMenu suppressHydrationWarning>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
							{isSessionLoading || isOrganizationsLoading ?
								<Skeleton className="bg-secondary-foreground/20 h-8 w-8 rounded-full" />
								: <Avatar className="h-8 w-8 rounded-lg">
									{!authData?.session.activeOrganizationId && (
										<AvatarImage
											src={avatarUrl(
												authData?.user.image,
											)}
											alt={authData?.user.name}
										/>
									)}
									<AvatarFallback className="rounded-lg">
										{!authData?.session.activeOrganizationId ? initial : getInitials(activeOrganizationName)}
									</AvatarFallback>
								</Avatar>
							}

							<div className="grid flex-1 text-left text-sm leading-tight">
								{isSessionLoading || isOrganizationsLoading ?
									<Skeleton className="bg-secondary-foreground/20 h-3 w-12" />
									: <span className="truncate">
										{activeOrganizationName ||
											authData?.user.name}
									</span>
								}
								{isSessionLoading ?
									<Skeleton className="bg-secondary-foreground/20 mt-1 h-3 w-full" />
									: <span className="text-muted-foreground truncate text-xs">
										{authData?.user.email}
									</span>
								}
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="text-muted-foreground w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								{isSessionLoading ?
									<Skeleton className="bg-secondary-foreground/20 h-8 w-8 rounded-full" />
									: <Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={avatarUrl(
												authData?.user.image,
											)}
											alt={authData?.user.name}
										/>
										<AvatarFallback className="rounded-lg">
											{initial}
										</AvatarFallback>
									</Avatar>
								}
								<div className="grid flex-1 text-left text-sm leading-tight">
									{isSessionLoading ?
										<Skeleton className="bg-secondary-foreground/20 h-3 w-12" />
										: <span className="truncate">
											{authData?.user.name}
										</span>
									}
									{isSessionLoading ?
										<Skeleton className="bg-secondary-foreground/20 mt-1 h-3 w-full" />
										: <span className="text-muted-foreground truncate text-xs">
											{authData?.user.email}
										</span>
									}
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						{/* ORGANIZATIONS */}
						<DropdownMenuGroup>
							<DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
								Organizations
							</DropdownMenuLabel>
							{organizations?.map(org => (
								<DropdownMenuItem
									key={org.id}
									onClick={() =>
										handleOrganizationSwitch(org.id)
									}
									disabled={isMemberLoading}
									className="cursor-pointer">
									<Avatar className="h-6 w-6">
										<AvatarFallback className="text-xs">
											{getInitials(org.name)}
										</AvatarFallback>
									</Avatar>
									<span className="flex-1 truncate">
										{org.name}
									</span>
									{activeMember?.organizationId ===
										org.id && <Check className="size-4" />}
								</DropdownMenuItem>
							))}
							<DropdownMenuItem
								onClick={() => handleOrganizationSwitch(null)}
								disabled={isMemberLoading}
								className="cursor-pointer">
								<Avatar className="h-6 w-6">
									<AvatarFallback className="text-xs">
										<UserIcon className="size-4" />
									</AvatarFallback>
								</Avatar>
								<span className="flex-1 truncate">
									No organization
								</span>
								{!activeMember?.organizationId && (
									<Check className="size-4" />
								)}
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => handleOrganizationSwitch(null)}
								disabled={
									isMemberLoading ||
									!authData?.subscription?.isSubscribed
								}
								className="cursor-pointer"
								asChild>
								<Link href="/organizations/new">
									<Plus className="size-4" />
									<span className="flex-1 truncate">
										Create organization
									</span>
									{!authData?.subscription?.isSubscribed ?
										<Badge className="border-none bg-gradient-to-tr from-green-200/75 via-green-500/75 to-teal-500/75">
											PRO
										</Badge>
										: null}
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							{authData?.subscription?.isSubscribed ?
								<DropdownMenuItem
									onClick={() => handlePortalRedirect()}>
									<ReceiptCent />
									View billing portal
								</DropdownMenuItem>
								: <DropdownMenuItem
									onClick={() =>
										useStore.setState({
											modal_upgrade_plan_open: true,
										})
									}>
									<Sparkles />
									Upgrade to Pro
								</DropdownMenuItem>
							}
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
