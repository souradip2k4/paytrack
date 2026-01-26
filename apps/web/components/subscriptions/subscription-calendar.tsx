"use client";

import { useStore } from "@/lib/store/store";
import { cn } from "@budgetbee/ui/lib/utils";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { SubscriptionDialog } from "./subscription-dialog";
import { useQuery } from "@tanstack/react-query";
import { getDb } from "@budgetbee/core/db";
import { authClient } from "@budgetbee/core/auth-client";
// import { isSubscriptionOnDate, Subscription } from "./utils";
import React from "react";
// import { SubscriptionSheet } from "./subscription-sheet";

export function SubscriptionCalendar() {
    const {
        modal_subscription_set_open,
        modal_subscription_set_date,
        sheet_subscription_set_open,
        sheet_subscription_set_date
    } = useStore();

    const { data: authData } = authClient.useSession();

    const { data: subscriptions } = useQuery({
        queryKey: ["subscriptions"],
        queryFn: async () => {
            if (!authData?.user?.id) return [];
            const db = await getDb();
            const { data, error } = await db.from("subscriptions").select("*");
            if (error) throw error;
            return data;
        },
        enabled: !!authData?.user?.id,
    });

    const handleDayClick = (date: Date) => {
        sheet_subscription_set_date(date);
        sheet_subscription_set_open(true);
    };

    return (
        <div className="p-4 md:p-8 bg-card rounded-xl border shadow-sm w-full">
            <SubscriptionDialog />
            {/* <SubscriptionSheet /> */}

            {/* <DayPicker
                className="w-full"
                classNames={{
                    months: "w-full",
                    month: "w-full space-y-4",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full mb-4",
                    head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "relative w-full p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                }}
                captionLayout="dropdown"
                disableNavigation
                components={{
                    Day: props => {
                        const { displayMonth, date } = props;
                        const isOutside =
                            displayMonth.getMonth() !== date.getMonth();

                        // Calculate subscriptions for this day
                        const daySubs = subscriptions?.filter(sub => isSubscriptionOnDate(sub, date)) || [];
                        const hasSubs = daySubs.length > 0;
                        const totalAmount = daySubs.reduce((acc, sub) => acc + sub.amount, 0);

                        return (
                            <div
                                aria-disabled={isOutside}
                                className={cn(
                                    "group relative h-24 sm:h-32 w-full p-2 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-start justify-start select-none",
                                    isOutside ? "bg-muted/10 opacity-50" : "bg-card",
                                    "first:rounded-tl-lg last:rounded-tr-lg" // Just heuristic, actually simpler without specific rounding for grid cells unless handled carefully
                                )}
                                onClick={() => handleDayClick(date)}>

                                <div className="flex w-full justify-between items-center">
                                    <span className={cn(
                                        "text-sm font-medium",
                                        format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center shadow-lg transform scale-105" : "text-foreground"
                                    )}>
                                        {format(date, "d")}
                                    </span>
                                </div>

                                {hasSubs && (
                                    <div className="mt-2 w-full space-y-1 overflow-hidden">
                                        <div className="text-[10px] sm:text-xs font-semibold text-primary">
                                            {daySubs.length} Subscription{daySubs.length > 1 ? 's' : ''}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)}
                                        </div>
                                        <div className="flex gap-1 mt-1 flex-wrap">
                                            {daySubs.slice(0, 3).map((sub, idx) => (
                                                <div key={idx} className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                            ))}
                                            {daySubs.length > 3 && <span className="text-[10px] text-muted-foreground leading-none">+</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    },
                }}
            /> */}
        </div>
    );
}
