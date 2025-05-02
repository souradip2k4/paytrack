export type PricingOption = {
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

export const options: PricingOption[] = [
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
		title: "Unlimited",
		price: "Custom Pricing",
		description: "Custom solution for large enterprises.",
		perks: [
			"Everything in Pro tier",
			"Unlimited users",
			"Unlimited projects",
			// "Custom integrations",
		],
	},
];

export const formatPrice = (price: PricingOption["price"]) => {
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
