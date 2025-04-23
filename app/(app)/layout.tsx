import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
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
				<SidebarInset>
					<header className="flex h-[48px] shrink-0 items-center gap-2 border-b">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 h-4"
							/>
						</div>
					</header>
					<div className="flex-1 overflow-y-auto p-8">{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</React.Fragment>
	);
}
