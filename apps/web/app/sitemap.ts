import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	if (!process.env.APP_URL) throw Error("env: APP_URL is not set");

	const sitemaps = [
		"/pricing",
		"/contact",
		"/signup",
		"/login",
		"/report-a-bug",
		"/legal/privacy-policy",
	].map(slug => ({
		url: process.env.APP_URL + slug,
		lastModified: new Date(),
	}));

	return [
		{
			url: process.env.APP_URL,
			priority: 1,
			changeFrequency: "monthly",
			lastModified: new Date(),
		},
		...sitemaps,
	];
}
