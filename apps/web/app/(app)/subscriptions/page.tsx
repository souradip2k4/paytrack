import { SubscriptionCalendar } from "@/components/subscriptions/subscription-calendar";

export default function SubscriptionsPage() {
    return (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 p-4 py-8">
            <h1>Subscriptions</h1>
            <p className="text-muted-foreground">Upgrade to track your subscriptions.</p>
            {/*<SubscriptionCalendar />*/}
        </div>
    );
}
