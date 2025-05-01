"use client";

import { PayButton } from "@/app/(public)/(default)/appl/pay";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

type PricingOption = {
    title: string;
    price:
    | string
    | { amount: number; validity: "monthly" | "lifetime" | "yearly" };
    description: string;
    perks: string[];
    redirect?: string;
    highlight?: boolean;
    disabled?: boolean;
};

const options: PricingOption[] = [
    {
        title: "Free",
        price: { amount: 0, validity: "monthly" },
        description: "Basic features for individual use.",
        perks: [
            "1 user",
            "1 project",
            "10k entries per month",
            "Non-commercial use",
        ],
    },
    {
        title: "Pro",
        price: { amount: 10, validity: "monthly" },
        description: "More advanced features (coming soon)",
        perks: [
            "Everthing in Free tier",
            "5 users",
            "3 projects",
            "Unlimited entries",
            "API access",
            "24/7 support",
            "Third-party integrations (coming soon)",
            "Commercial use",
        ],
        disabled: true,
    },
    {
        highlight: true,
        title: "Lifetime",
        price: { amount: 119, validity: "lifetime" },
        description: "Limited time plan for lifetime usage.",
        perks: [
            "Unlimited entries",
            "1 users",
            "1 workspace",
            "API access",
            "24/7 support",
            "Third-party integrations (coming soon)",
            "Commercial use",
        ],
    },
    {
        title: "Enterprise",
        price: "Custom Pricing",
        description: "Custom solution for large enterprises.",
        perks: [
            "Everything in Pro tier",
            "Upto 1000 users",
            "Unlimited projects",
            "Custom integrations",
        ],
        disabled: true
    },
];

const formatPrice = (price: PricingOption["price"]) => {
    if (typeof price === "string") return price;

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    });

    const formattedAmount = formatter.format(price.amount);

    switch (price.validity) {
        case "monthly":
            return `${formattedAmount} per month`;
        case "yearly":
            return `${formattedAmount} per year`;
        case "lifetime":
            return `${formattedAmount} one-time`;
        default:
            return formattedAmount;
    }
};

export function PricingCardGroup() {
    return (
        <div className="grid w-full grid-cols-4 gap-4 px-32">
            {options.map((option, index) => (
                <React.Fragment key={index}>
                    <PricingCard option={option} />
                </React.Fragment>
            ))}
        </div>
    );
}

function PricingCard({ option }: { option: PricingOption }) {
    const isFree =
        typeof option.price !== "string" && option.price.amount === 0;
    const yearlyBilling = useStore(s => s.yearly_billing);
    const setYearlyBilling = useStore(s => s.set_yearly_billing);

    const switchId = React.useId();

    return (
        <Card
            className={cn(
                option.highlight &&
                "border-primary relative overflow-hidden shadow-lg",
            )}>
            <CardHeader className="border-b">
                <CardTitle className="text-2xl font-normal">
                    {option.title}
                </CardTitle>
                <CardDescription className="mt-2">
                    {formatPrice(option.price)}
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
                                <Check className="mt-1 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                                <span>{perk}</span>
                            </p>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <PayButton
                    disabled={option.disabled}
                    highlight={option.highlight}
                />
            </CardFooter>
        </Card>
    );
}
