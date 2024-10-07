import { H1 } from "@/components/ui/typography";
import Link from "next/link";
import React from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function NavItemGroup({
	text,
	children,
}: {
	text?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="w-full flex flex-col px-4 pt-4">
			{text && (
				<p className="py-1 px-4 text-sm text-muted-foreground">
					{text}
				</p>
			)}
			{children}
		</div>
	);
}

function NavItem({ href, text }: { href: string; text: string }) {
	return (
		<Link
			className="w-full justify-start inline-flex items-center gap-1 px-4 py-2 rounded-sm hover:bg-accent"
			href={href}>
			{text}
			{text === "Automation" && <Badge>new</Badge>}
		</Link>
	);
}

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<React.Fragment>
			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel defaultSize={15} maxSize={50}>
					<div>
						<div className="border-b h-[56px] flex items-center justify-between px-8">
							<H1 className="text-lg">BudgetBee.</H1>
						</div>
						<ScrollArea className="h-[calc(100vh-56px)]">
							<NavItemGroup>
								<NavItem
									href={"/dashboard"}
									text={"Dashboard"}
								/>
							</NavItemGroup>

							<NavItemGroup text="Components">
								<NavItem href={"/entry"} text={"Entry"} />
								<NavItem href={"/category"} text={"Category"} />
								<NavItem href={"/tag"} text={"Tag"} />
							</NavItemGroup>

							<NavItemGroup text="Developers">
								<NavItem
									href={"/automation"}
									text={"Automation"}
								/>
								<NavItem href={"/tokens"} text={"Tokens"} />
							</NavItemGroup>

							<NavItemGroup text="Settings">
								<NavItem href={"/settings"} text={"Settings"} />
								<NavItem href={"/accounts"} text={"Accounts"} />
								<NavItem href={"/billing"} text={"Billing"} />
							</NavItemGroup>
						</ScrollArea>
					</div>
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>{children}</ResizablePanel>
			</ResizablePanelGroup>
		</React.Fragment>
	);
}
