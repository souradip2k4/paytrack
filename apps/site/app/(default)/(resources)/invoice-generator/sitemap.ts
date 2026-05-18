import { getSiteUrl } from "@budgetbee/ui/lib/utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	return [
		{
			url: getSiteUrl("invoice-generator"),
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.9,
		},
	];
}
