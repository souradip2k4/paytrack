"use client"

import React from "react";
import { H1 } from "@/components/ui/typography";
import Link from "next/link";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Badge } from "@/components/ui/badge";
import { PanelLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";


function NavItemGroup({
    text,
    children,
}: {
    text?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="w-full flex flex-col items-start sm:px-4 pt-4">
            {text && (
                <p className="py-1 px-4 max-sm:px-2 text-sm text-muted-foreground">
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
            className="w-full justify-start inline-flex items-center gap-1 py-2 px-4 max-sm:px-2 rounded-sm hover:bg-accent"
            href={href}>
            {text}
            {text === "Automation" && <Badge>new</Badge>}
        </Link>
    );
}

export function Sidebar() {
    return (
        <ScrollArea className="h-[calc(100vh-56px)] max-md:h-screen">
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

    )
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={15} maxSize={50}>
                    <div>
                        <div className="border-b h-[56px] flex items-center justify-between px-8">
                            <H1 className="text-md lg:text-lg">BudgetBee.</H1>
                        </div>
                        <Sidebar />
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>{children}</ResizablePanel>
            </ResizablePanelGroup>
        )
    }

    return (
        <div>
            <div className="border-b h-[56px] flex items-center justify-start px-8 max-sm:px-4 gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="outline">
                            <PanelLeft className="" size={16} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="px-4">
                        <SheetHeader>
                            <Sidebar />
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
                <H1 className="text-md md:text-lg">BudgetBee.</H1>
            </div>

            {children}
        </div>

    )
}
