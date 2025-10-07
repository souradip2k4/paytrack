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
import { TUseSession } from "@/lib/query";
import { useStore } from "@/lib/store";
import { avatarUrl } from "@/lib/utils";
import {
    Activity,
    ChevronsUpDown,
    LogOut,
    Logs,
    MessageCircleQuestion,
    ReceiptCent,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export function NavUser() {
    const { isMobile } = useSidebar();

    const { data: authData, isPending: isSessionLoading } =
        authClient.useSession() as TUseSession;

    const initial = React.useMemo(() => {
        let [fn, ln] = authData?.user?.name?.split(" ") ?? [];
        return `${fn?.at(0)?.toUpperCase() || ""}${ln?.at(0)?.toUpperCase() || ""}`;
    }, [authData]);

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
                            {isSessionLoading ?
                                <Skeleton className="bg-secondary-foreground/20 h-8 w-8 rounded-full" />
                                : <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={avatarUrl(authData?.user.image)}
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
                        <DropdownMenuGroup>
                            {/*authData?.subscription?.isSubscribed ?
								<DropdownMenuItem asChild>
									<Link href="/priority-support">
										<MessageCircleQuestion />
										Priority Support
									</Link>
								</DropdownMenuItem>
							:	<DropdownMenuItem asChild>
									<Link href="/support">
										<MessageCircleQuestion />
										Support
									</Link>
								</DropdownMenuItem>
							*/}
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
                            <DropdownMenuItem asChild>
                                <Link href="/changelog">
                                    <Logs />
                                    Changelog
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="https://budgetbee.openstatus.dev/">
                                    <Activity />
                                    Status
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
