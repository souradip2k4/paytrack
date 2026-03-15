import { BlogToc } from "@/components/blog-toc";
import {
	getAllBlogPosts,
	getBlogPostBySlug,
	getSiteUrl,
	resolveBlogImageUrl,
} from "@/lib/blog";
import { MDXRenderer } from "@budgetbee/ui/core/mdx-renderer";
import { Button } from "@budgetbee/ui/core/button";
import { Separator } from "@budgetbee/ui/core/separator";
import { format } from "date-fns";
import { Link2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type BlogPostPageProps = {
	params: Promise<{ slug: string[] }>;
};

function normalizeKeywords(
	post: NonNullable<Awaited<ReturnType<typeof getBlogPostBySlug>>>,
) {
	return (
		post.frontmatter.metadata?.keywords ||
		post.frontmatter.keywords ||
		post.frontmatter.tags
	);
}

export async function generateStaticParams() {
	const posts = await getAllBlogPosts();
	return posts.map(post => ({ slug: post.slugSegments }));
}

export async function generateMetadata({
	params,
}: BlogPostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = await getBlogPostBySlug(slug);

	if (!post || post.frontmatter.draft) return {};

	const siteUrl = getSiteUrl();
	const title = post.frontmatter.metadata?.title || post.frontmatter.title;
	const description =
		post.frontmatter.metadata?.description || post.frontmatter.description;
	const image = resolveBlogImageUrl(
		post.frontmatter.metadata?.image || post.frontmatter.image,
		post.route,
		title,
	);
	const url = `${siteUrl}${post.route}`;

	return {
		title,
		description,
		keywords: normalizeKeywords(post),
		alternates: {
			canonical: url,
		},
		openGraph: {
			type: "article",
			url,
			title,
			description,
			publishedTime: post.frontmatter.published_at,
			modifiedTime:
				post.frontmatter.updated_at || post.frontmatter.published_at,
			authors:
				post.frontmatter.author ? [post.frontmatter.author] : undefined,
			tags: post.frontmatter.tags,
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [image],
		},
	};
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = await params;
	const post = await getBlogPostBySlug(slug);

	if (!post || post.frontmatter.draft) return notFound();

	return (
		<div className="mx-auto my-24 max-w-6xl px-4 lg:pr-80">
			<div className="mx-auto max-w-3xl space-y-6">
				<div className="space-y-4">
					<div className="flex items-start gap-3">
						<h1
							id="blog-post-title"
							className="font-formal scroll-m-20 text-balance text-4xl font-[Instrument_Serif] tracking-tight [&:not(:first-child)]:mt-8">
							{post.frontmatter.title}
						</h1>
						<Button
							asChild
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-foreground mt-1">
							<a href="#blog-post-title" aria-label="Link to post title">
								<Link2 className="size-4" />
							</a>
						</Button>
					</div>
					<p className="text-muted-foreground text-lg! font-[Instrument_Serif] font-normal leading-7">
						{post.frontmatter.description}
					</p>
					<div className="divide-muted-foreground/50 text-muted-foreground flex flex-wrap divide-x text-sm *:px-4 *:first:!pl-0">
						{post.frontmatter.author && (
							<p>Written by {post.frontmatter.author}</p>
						)}
						<p>
							Published on{" "}
							{format(
								new Date(post.frontmatter.published_at),
								"MMMM d, yyyy",
							)}
						</p>
						<p>{post.readingTime} minute(s) read</p>
					</div>
				</div>

				<Separator />

				<article id="blog-content-root">
					<MDXRenderer source={post.content} />
				</article>
			</div>

			<BlogToc contentRootId="blog-content-root" />
		</div>
	);
}
