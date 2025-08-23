"use client";

import { ReceiptCent } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import { navs } from "./sidebar/nav-main";
import { TransactionDialog } from "./transaction-editor";

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

            {pathname.startsWith("/app") && (
                <div className="ml-auto flex gap-2">
                    <TransactionDialog />
                </div>
            )}
        </React.Fragment>
    );
}
