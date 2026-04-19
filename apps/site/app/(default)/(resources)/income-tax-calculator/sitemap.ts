import { getSiteUrl } from "@budgetbee/ui/lib/utils";
import { MetadataRoute } from "next";

const REGIME_SLUGS = ["new-regime", "old-regime"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const hub = {
		url: getSiteUrl("income-tax-calculator"),
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 1,
	};

	const regimePages = REGIME_SLUGS.map(slug => ({
		url: getSiteUrl("income-tax-calculator", slug),
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.8,
	}));

	return [hub, ...regimePages];
}
