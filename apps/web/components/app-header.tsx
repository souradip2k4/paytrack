"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { navs } from "./sidebar/nav-main";
import { TransactionDialog } from "./transaction-editor";
import { Button } from "./ui/button";
import { BadgeInfo, Info, ListPlus, SquarePen } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function AppHeader() {
    const pathname = usePathname();

    const match = React.useMemo(() => {
        for (const nav of navs) {
            const match = nav.items.find(x => x.url.startsWith(pathname));
            if (match) return match;
        }
        return undefined;
    }, [pathname]);

    return (
        <React.Fragment>
            <div className="flex items-center justify-center gap-2">
                {match && match.icon && (
                    <span className="from-primary/95 to-primary/25 border-primary rounded border bg-gradient-to-tr">
                        {
                            <match.icon
                                className="stroke-primary-foreground m-1 h-4 w-4"
                                absoluteStrokeWidth
                            />
                        }
                    </span>
                )}
                <h1 className="text-muted-foreground m-0">{match?.title}</h1>
            </div>

            {pathname.startsWith("/transactions") && (
                <div className="ml-auto flex gap-2">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" className="border" variant="secondary"><SquarePen /> Edit</Button>
                            </TooltipTrigger>
                            <TooltipContent className="py-3 border shadow-xl bg-accent">
                                <div className="gap-2 flex items-center justify-center">
                                    <BadgeInfo className="size-4 text-muted-foreground" />
                                    <p>Edit transactions.</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TransactionDialog />
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" className="size-8 border" variant="secondary"><ListPlus /></Button>
                            </TooltipTrigger>
                            <TooltipContent className="py-3 border shadow-xl bg-accent">
                                <div className="gap-2 flex items-center justify-center">
                                    <BadgeInfo className="size-4 text-muted-foreground" />
                                    <p>Add multiple transactions.</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </React.Fragment>
    );
}
