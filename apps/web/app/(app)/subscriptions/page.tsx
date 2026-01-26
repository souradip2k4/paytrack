"use client";

import { SubscriptionCalendar } from "@/components/subscriptions/subscription-calendar";
import { Button } from "@budgetbee/ui/core/button";
import { useStore } from "@/lib/store/store";
import { Plus } from "lucide-react";
import { useFeatureFlag } from "@/components/feature-flag-provider";

export default function SubscriptionsPage() {
    const { modal_subscription_set_open } = useStore();
    const { isEnabled } = useFeatureFlag("useSubscriptions");

    if (!isEnabled) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
                <h1 className="text-2xl font-bold">Feature Not Available</h1>
                <p>Subscriptions tracking feature is currently disabled for your account.</p>
            </div>
        )
    }

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
                    <p className="text-muted-foreground mt-1">Manage your recurring payments and track upcoming bills.</p>
                </div>
                <Button onClick={() => modal_subscription_set_open(true)} className="shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Subscription
                </Button>
            </div>
            <SubscriptionCalendar />
        </div>
    );
}
