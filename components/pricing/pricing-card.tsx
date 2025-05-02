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
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { PricingOption, formatPrice } from "./pricing";


export function PricingCard({ option }: { option: PricingOption }) {
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
