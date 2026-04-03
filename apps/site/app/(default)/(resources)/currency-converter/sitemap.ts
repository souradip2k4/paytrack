import { getAllPairSlugs } from "@/lib/currencies";
import { getSiteUrl } from "@budgetbee/ui/lib/utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = getSiteUrl();

	const staticPages = ["/currency-converter"].map(slug => ({
		url: siteUrl + slug,
		priority: 1,
		lastModified: new Date(),
		changeFrequency: "daily" as const,
	}));

	const allPairSlugs = getAllPairSlugs();
	const currencyPairPages = allPairSlugs.map(pair => ({
		url: `${siteUrl}/currency-converter/${pair}`,
		priority: 0.7,
		lastModified: new Date(),
		changeFrequency: "daily" as const,
	}));

	return [...staticPages, ...currencyPairPages];
}
