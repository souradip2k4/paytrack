import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	if (!process.env.NEXT_PUBLIC_SITE_URL)
		throw Error("env: NEXT_PUBLIC_SITE_URL is not set");

	const sitemaps = [
		"/pricing",
		"/legal/privacy-policy",
		"/legal/terms-and-conditions",
		"/legal/refund-policy",
		"/legal/cookie-policy",
	].map(slug => ({
		url: process.env.NEXT_PUBLIC_SITE_URL + slug,
		lastModified: new Date(),
	}));

	return [
		{
			url: process.env.NEXT_PUBLIC_SITE_URL,
			priority: 1,
			changeFrequency: "monthly",
			lastModified: new Date(),
		},
		...sitemaps,
	];
}
