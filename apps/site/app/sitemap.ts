import { getAllBlogPosts, getSiteUrl } from "@/lib/blog";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = getSiteUrl();

	const staticPages = [
		"/blog",
		"/pricing",
		"/legal/privacy-policy",
		"/legal/terms-and-conditions",
		"/legal/refund-policy",
		"/legal/cookie-policy",
	].map(slug => ({
		url: siteUrl + slug,
		lastModified: new Date(),
	}));

	const blogPosts = await getAllBlogPosts();
	const blogPages = blogPosts.map(post => ({
		url: `${siteUrl}${post.route}`,
		lastModified: post.lastModified,
		changeFrequency: "weekly" as const,
	}));

	return [
		{
			url: siteUrl,
			priority: 1,
			changeFrequency: "monthly",
			lastModified: new Date(),
		},
		...staticPages,
		...blogPages,
	];
}
