export type PricingOption = {
	title: string;
	price: {
		monthly: {
			amount: number;
			price_slug: string;
		};
		yearly: {
			amount: number;
			price_slug: string;
			percent_off: number;
		};
	} | null;
	description: string;
	perks: string[];
	highlight?: boolean;
	disabled?: boolean;
};

export const options: PricingOption[] = [
	{
		title: "Free",
		price: null,
		description: "Basic features for individual use.",
		perks: ["Single user", "Unlimited entries", "Personal use"],
	},
	{
		title: "Pro",
		price: {
			monthly: {
				amount: 199,
				price_slug: "pro",
			},
			yearly: {
				amount: 169,
				price_slug: "pro-yearly",
				percent_off: 33,
			},
		},
		description: "More advanced features (coming soon)",
		perks: [
			"Everthing in Free tier",
			"Sync with Excel or Google Sheets",
			"Third-party integrations",
			"AI Features",
			"Zapier, n8n, make.com intgration",
			"Commercial use",
		],
		highlight: true,
	},
	{
		title: "Teams",
		price: {
			monthly: {
				amount: 789,
				price_slug: "teams",
			},
			yearly: {
				amount: 732,
				price_slug: "teams-yearly",
				percent_off: 33,
			},
		},
		description: "More advanced features (coming soon)",
		perks: [
			"Everything in Pro tier",
			"Organization features",
			"API access",
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

	return "10";
};
