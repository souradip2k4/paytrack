import { getAllPairSlugs } from "@/lib/currencies";
import { getSiteUrl } from "@budgetbee/ui/lib/utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = getSiteUrl();
	const staticPages = ["/exchange-rates"].map(slug => ({
		url: siteUrl + slug,
		lastModified: new Date(),
		changeFrequency: "daily" as const,
		priority: 1,
	}));

	const allPairSlugs = getAllPairSlugs();

	const exchangeRatePages = allPairSlugs.map(pair => ({
		url: `${siteUrl}/exchange-rates/${pair}`,
		lastModified: new Date(),
		changeFrequency: "daily" as const,
		priority: 0.7,
	}));

	return [...staticPages, ...exchangeRatePages];
}
