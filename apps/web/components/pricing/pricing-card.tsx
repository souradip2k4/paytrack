"use client";

import { useStore } from "@/lib/store";
import { cn } from "@budgetbee/ui/lib/utils";
import { authClient } from "@budgetbee/core/auth-client";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "@budgetbee/ui/core/button";
import { Label } from "@budgetbee/ui/core/label";
import { Switch } from "@budgetbee/ui/core/switch";
import { PricingOption } from "./pricing";

export function PricingCard({ option }: { option: PricingOption }) {
	const switchId = React.useId();
	const router = useRouter();

	const isFree = option.price === null;
	const yearlyBilling = useStore(s => s.yearly_billing);
	const setYearlyBilling = useStore(s => s.set_yearly_billing);

	const { data: currencyInfo } = useQuery({
		queryKey: ["price"],
		queryFn: async () => {
			if (!process.env.NEXT_PUBLIC_CURRENCY_API_URL) return;
			const priceUrl =
				process.env.NEXT_PUBLIC_CURRENCY_API_URL + "/get-price/1";
			const res = await axios.get(priceUrl);

			const rate = res.data.rate;
			const currency = res.data.currency;

			if (!rate || !currency) return { rate: 1, currency: "USD" };
			return { rate, currency: res.data.currency };
		},
		initialData: { rate: 1, currency: "USD" },
	});

	const price = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currencyInfo?.currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(
		option.price ?
			yearlyBilling ? option.price.yearly.amount
			:	option.price.monthly.amount
		:	0,
	);

	const [pending, startTransition] = React.useTransition();

	const { data: authData, isPending: isSessionPending } =
		authClient.useSession();

	const handleBuy = () => {
		startTransition(async () => {
			if (!authData || !authData.user || !authData.user.id) {
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
					:	option.price.monthly.price_slug,
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
				<div className="bg-primary text-primary-foreground absolute -right-11 top-4 w-36 rotate-45 py-1 text-center text-sm font-semibold shadow-md">
					<p>Popular</p>
				</div>
			)}
			<CardHeader className="border-b">
				<CardTitle className="text-md text-muted-foreground font-normal">
					{option.title}
				</CardTitle>
				<CardDescription className="text-primary-foreground mt-2 text-4xl font-[Instrument_Serif]">
					{price}{" "}
					<span className="text-xl">
						{yearlyBilling ? "/year" : "/month"}
					</span>
					{/*option.highlight && (
                        <Badge className="rounded-full">
                            Save {option.price?.yearly.percent_off}%
                        </Badge>
                    )*/}
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
					disabled={isSessionPending}
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
