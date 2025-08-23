"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { PricingOption } from "./pricing";

export function PricingCard({ option }: { option: PricingOption }) {
    const switchId = React.useId();
    const router = useRouter();

    const isFree = option.price === null;
    const yearlyBilling = useStore(s => s.yearly_billing);
    const setYearlyBilling = useStore(s => s.set_yearly_billing);
    const price =
        option.price ?
            "$" +
            (yearlyBilling ?
                option.price.yearly.amount
                : option.price.monthly.amount) +
            " per month"
            : "$0";

    const [pending, startTransition] = React.useTransition();

    const { data, isLoading } = authClient.useSession();

    const handleBuy = () => {
        startTransition(async () => {
            if (!data || !data.user || !data.user.id) {
                router.push(
                    `/login?redirect=${encodeURIComponent("/pricing")}`,
                );
                return;
            }

            if (!option.price) return;

            const res = await authClient.checkout({
                slug:
                    yearlyBilling ?
                        option.price.yearly.price_slug
                        : option.price.monthly.price_slug,
            });
            if (res.error) {
                toast.error("Failed to checkout, please try again later.");
                return;
            }
            if (res.data.redirect) {
                router.push(res.data.url);
            }
        });
    };

    return (
        <Card
            className={cn(
                option.highlight &&
                "border-primary relative overflow-hidden shadow-lg",
            )}>
            {option.highlight && (
                <div className="absolute top-4 -right-11 w-36 rotate-45 bg-primary py-1 text-center text-sm font-semibold text-primary-foreground shadow-md">
                    <p>Popular</p>
                </div>
            )}
            <CardHeader className="border-b">
                <CardTitle className="text-2xl font-normal">
                    {option.title}
                </CardTitle>
                <CardDescription className="mt-2">
                    {price}{" "}
                    {option.highlight && (
                        <Badge className="rounded-full">
                            Save {option.price?.yearly.percent_off}%
                        </Badge>
                    )}
                </CardDescription>
            </CardHeader>

            <div className="flex border-b px-4 pb-6">
                {isFree && <p>Free for individuals</p>}
                {!isFree && (
                    <React.Fragment>
                        <div className="flex items-center">
                            <Switch
                                id={switchId}
                                checked={yearlyBilling}
                                onCheckedChange={setYearlyBilling}
                            />
                            <Label htmlFor={switchId} className="ml-2">
                                Yearly billing
                            </Label>
                        </div>
                    </React.Fragment>
                )}
            </div>

            <CardContent className="h-full">
                <ul className="space-y-3">
                    {option.perks.map((perk, perkIndex) => (
                        <li key={perkIndex} className="flex items-start">
                            <p className="inline-flex">
                                <Check className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-green-500" />
                                <span>{perk}</span>
                            </p>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    disabled={isLoading}
                    isLoading={pending}
                    variant={option.highlight ? "default" : "secondary"}
                    onClick={handleBuy}
                    className="w-full">
                    {option.price ? "Choose" : "Get started"}
                </Button>
            </CardFooter>
        </Card>
    );
}
