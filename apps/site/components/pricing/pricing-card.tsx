"use client";

import { authClient } from "@budgetbee/core/auth-client";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { Label } from "@budgetbee/ui/core/label";
import { Switch } from "@budgetbee/ui/core/switch";
import { cn } from "@budgetbee/ui/lib/utils";
import axios from "axios";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { PricingOption } from "./pricing";

export function PricingCard({ option }: { option: PricingOption }) {
	const switchId = React.useId();
	const router = useRouter();

	const isFree = option.price === null;
	const [yearlyBilling, setYearlyBilling] = React.useState(false);

	const [currencyInfo, setCurrencyInfo] = React.useState<{
		rate: number;
		currency: string;
	}>({ rate: 1, currency: "USD" });
	React.useEffect(() => {
		if (!process.env.NEXT_PUBLIC_CURRENCY_API_URL) return;
		const priceUrl =
			process.env.NEXT_PUBLIC_CURRENCY_API_URL + "/get-price/1";
		axios.get(priceUrl).then(res => {
			let rate = res.data.rate ?? 1;
			let currency = res.data.currency ?? "USD";
			setCurrencyInfo({ rate, currency });
		});
	}, []);

	const price = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currencyInfo?.currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(
		option.price ?
			(yearlyBilling ?
				option.price.yearly.amount
			:	option.price.monthly.amount) * currencyInfo.rate
		:	0,
	);

	const [pending, startTransition] = React.useTransition();

	const { data: authData, isPending: isSessionPending } =
		authClient.useSession();

	const handleBuy = () => {
		startTransition(async () => {
			if (!authData || !authData.user || !authData.user.id) {
				router.push(
					process.env.NEXT_PUBLIC_APP_URL +
						`/login?redirect=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL + "/pricing")}`,
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
