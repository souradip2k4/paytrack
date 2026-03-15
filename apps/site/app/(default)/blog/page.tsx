import { getAllBlogPosts } from "@/lib/blog";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Blog | Budgetbee",
	description: "Articles, updates, and guides from the Budgetbee team.",
};

export default async function BlogPage() {
	const posts = await getAllBlogPosts();

	return (
		<div className="mx-auto my-24 max-w-4xl px-4">
			<div className="space-y-3 pb-10">
				<h1 className="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight">
					Blog
				</h1>
				<p className="text-muted-foreground">
					Articles, updates, and guides from Budgetbee.
				</p>
			</div>

			<div className="space-y-6">
				{posts.map(post => (
					<article
						key={post.slug}
						className="border-border/70 space-y-2 rounded-xl border p-5 transition hover:bg-white/5">
						<Link href={post.route} className="block space-y-2">
							<h2 className="text-xl font-semibold">{post.frontmatter.title}</h2>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{post.frontmatter.description}
							</p>
							<div className="text-muted-foreground text-xs">
								{format(new Date(post.frontmatter.published_at), "MMMM d, yyyy")}
							</div>
						</Link>
					</article>
				))}
			</div>
		</div>
	);
}
