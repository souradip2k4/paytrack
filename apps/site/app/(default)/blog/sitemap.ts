import { getAllBlogPosts } from "@/lib/blog";
import { getSiteUrl } from "@budgetbee/ui/lib/utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = getSiteUrl();

	const staticPages = ["/blog"].map(slug => ({
		url: siteUrl + slug,
		lastModified: new Date(),
		priority: 1,
		changeFrequency: "daily" as const,
	}));

	const blogPosts = await getAllBlogPosts();
	const blogPages = blogPosts.map(post => ({
		url: `${siteUrl}${post.route}`,
		lastModified: post.lastModified,
		changeFrequency: "weekly" as const,
	}));

	return [...staticPages, ...blogPages];
}
