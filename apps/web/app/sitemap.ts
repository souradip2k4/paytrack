import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	if (!process.env.NEXT_PUBLIC_APP_URL) throw Error("env: NEXT_PUBLIC_APP_URL is not set");

	const sitemaps = [
		"/pricing",
		"/contact",
		"/signup",
		"/login",
		"/report-a-bug",
		"/legal/privacy-policy",
	].map(slug => ({
		url: process.env.NEXT_PUBLIC_APP_URL + slug,
		lastModified: new Date(),
	}));

	return [
		{
			url: process.env.NEXT_PUBLIC_APP_URL,
			priority: 1,
			changeFrequency: "monthly",
			lastModified: new Date(),
		},
		...sitemaps,
	];
}
