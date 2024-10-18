import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";
import React from "react";

type PricingOption = {
	title: string;
	price: string;
	description: string;
	perks: string[];
	redirect?: string;
};

const options: PricingOption[] = [
	{
		title: "Free",
		price: "Free",
		description: "Basic features for individual use.",
		perks: ["10,000 entries", "1 user", "1 workspace", "100 workflow runs"],
	},
	{
		title: "Pro",
		price: "$10/mo",
		description: "Unlock advanced features for teams and businesses.",
		perks: [
			"Unlimited entries",
			"5 users",
			"3 workspaces",
			"10,000 workflow runs",
		],
	},
	{
		title: "Lifetime",
		price: "$119",
		description: "Lorem ipsuem",
		perks: [
			"Unlimited entries",
			"1 users",
			"1 workspace",
			"10,000 monthly workflow runs",
		],
	},
	{
		title: "Enterprise",
		price: "Custom Pricing",
		description: "Custom solution for large enterprises.",
		perks: [
			"Dedicated account manager",
			"Custom integrations",
			"Advanced security",
		],
	},
];

export function PricingCardGroup() {
	return (
		<div className="md:grid-row-2 grid grid-cols-1 grid-rows-1 gap-4 md:grid-cols-2 lg:flex lg:items-start lg:justify-center">
			{options.map((option, index) => {
				const { title, price, description, perks } = option;
				return (
					<React.Fragment key={index}>
						<div className="flex flex-col items-start gap-4 rounded-lg border p-8 lg:max-w-[360px]">
							<Button size="icon" variant="outline" disabled>
								<Sparkles className="h-4 w-4" />
							</Button>
							<h2 className="text-xl">{title}</h2>
							<p className="text-[#A3A3A3]">{description}</p>
							<h1 className="text-2xl">{price}</h1>
							<Separator />
							<div className="flex flex-col gap-4">
								{perks.map((perk, index) => (
									<React.Fragment key={index}>
										<p className="text-sm text-[#A3A3A3]">
											✦ &nbsp;{perk}
										</p>
									</React.Fragment>
								))}
							</div>
							<Button
								className="w-full"
								variant={
									title === "Lifetime" ? "default" : (
										"secondary"
									)
								}>
								Get started
							</Button>
						</div>
					</React.Fragment>
				);
			})}
		</div>
	);
}
