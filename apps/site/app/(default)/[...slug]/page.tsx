import { MDXRenderer } from "@budgetbee/ui/core/mdx-renderer";
import { getMDXBySlug } from "@budgetbee/ui/lib/markdown";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function CMSPage({
	params,
}: {
	params: Promise<{ slug: string[] }>;
}) {
	const { slug } = await params;

	const { data: content, error } = await getMDXBySlug(slug.join("/"));
	if (error) return notFound();

	return (
		<div className="mx-auto my-24 max-w-4xl px-4">
			<div className="space-y-4 pb-12">
				<h1 className="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight [&:not(:first-child)]:mt-8">
					{content!.frontmatter?.title}
				</h1>
				<div className="divide-muted-foreground/50 text-muted-foreground flex divide-x [&>*]:px-4 [&>*]:first:!pl-0">
					{content!.frontmatter?.author && (
						<p>Written by {content!.frontmatter?.author}</p>
					)}
					{content!.frontmatter?.published_at && (
						<p>
							Published on{" "}
							{format(
								new Date(content!.frontmatter?.published_at),
								"MMMM d, yyyy",
							)}
						</p>
					)}
					{content!.readingTime && (
						<p>{content!.readingTime} mintue(s) read</p>
					)}
				</div>
			</div>

			{content && (
				<article>
					<MDXRenderer source={content!.compiledSource} />
				</article>
			)}
		</div>
	);
}
