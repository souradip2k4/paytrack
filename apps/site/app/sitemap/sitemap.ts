import { getSiteUrl } from "@budgetbee/ui/lib/utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = getSiteUrl();

	const staticPages = ["/pricing"].map(slug => ({
		url: siteUrl + slug,
		lastModified: new Date(),
		priority: 1,
		changeFrequency: "daily" as const,
	}));

	return [
		{
			url: siteUrl,
			priority: 1,
			changeFrequency: "daily",
			lastModified: new Date(),
		},
		...staticPages,
	];
}
