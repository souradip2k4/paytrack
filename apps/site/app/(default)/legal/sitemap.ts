import { getSiteUrl } from "@budgetbee/ui/lib/utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = getSiteUrl();

	const staticPages = [
		"/legal/privacy-policy",
		"/legal/terms-and-conditions",
		"/legal/refund-policy",
		"/legal/cookie-policy",
	].map(slug => ({
		url: siteUrl + slug,
		lastModified: new Date(),
		priority: 0.7,
		changeFrequency: "daily" as const,
	}));

	return staticPages;
}
