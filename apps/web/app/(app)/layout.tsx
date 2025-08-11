import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<React.Fragment>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className="border">
					<header className="flex h-[48px] shrink-0 items-center gap-2 border-b">
						<div className="flex w-full items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<span className="bg-border mr-2 h-4 w-px"></span>
							<AppHeader />
						</div>
					</header>
					<div className="flex-1 overflow-y-auto">{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</React.Fragment>
	);
}
