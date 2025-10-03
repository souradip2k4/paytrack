import fs from "fs";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import path from "path";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
// import remarkToc from "remark-toc";

export type MarkdownContent = {
	content: string;
	frontmatter: Record<string, any>;
	slug: string;
	readingTime?: number;
};

export type MDXContent = MarkdownContent & { compiledSource: string };

type DataOrError<D, T> = { data: D; error: null } | { data: null; error: T };

/**
 * Read a single markdown file and extract frontmatter + content
 * @param fullPath - Slug of the file. If segment is /blog/my-post, it will look for @/content/blog/my-post.mdx
 */
export async function readMarkdownFile(
	fullPath: string,
): Promise<DataOrError<MarkdownContent, any>> {
	const contents = fs.readFileSync(fullPath, "utf8");
	const { data: frontmatter, content } = matter(contents);
	const slug = path.basename(fullPath);
	const readingTime = getApproxReadingTime(content);

	return {
		data: {
			content,
			frontmatter,
			slug,
			readingTime,
		},
		error: null,
	};
}

/** Read and compile MDX file for rendering */
export async function readMDXFile(
	filePath: string,
): Promise<DataOrError<MDXContent, any>> {
	const { data: markdown, error } = await readMarkdownFile(filePath);

	if (error) {
		return { data: null, error };
	}

	const compiledSource = await serialize(markdown!.content, {
		mdxOptions: {
			remarkPlugins: [remarkGfm],
			rehypePlugins: [rehypeHighlight, rehypeSlug],
		},
		parseFrontmatter: false, // already parsed
	});

	return {
		data: {
			content: markdown!.content,
			frontmatter: markdown!.frontmatter,
			slug: markdown!.slug,
			readingTime: markdown!.readingTime,
			compiledSource: JSON.stringify(compiledSource),
		},
		error: null,
	};
}

function getApproxReadingTime(content: string): number {
	const wordsPerMinute = 200;
	const words = content.trim().split(/\s+/).length;
	return Math.ceil(words / wordsPerMinute);
}

export async function getMarkdownBySlug(
	slug: string,
	extensions: string[] = [".md", ".mdx"],
): Promise<DataOrError<MarkdownContent, any>> {
	const fullDirPath = path.resolve("./content");
	for (const ext of extensions) {
		const filePath = path.join(fullDirPath, `${slug}${ext}`);
		if (fs.existsSync(filePath)) return await readMarkdownFile(filePath);
	}
	return { data: null, error: "Not found" };
}

export async function getMDXBySlug(
	slug: string,
	extensions: string[] = [".md", ".mdx"],
): Promise<DataOrError<MDXContent, any>> {
	const fullDirPath = path.resolve("./content");
	for (const ext of extensions) {
		const filePath = path.join(fullDirPath, `${slug}${ext}`);
		if (fs.existsSync(filePath)) return await readMDXFile(filePath);
	}
	return { data: null, error: "Not found" };
}

// components/MDXRenderer.tsx
/*
export const getStaticProps: GetStaticProps = async () => {
  const posts = await readMarkdownDirectory('./content/blog');
  
  // Sort by date if available
  const sortedPosts = posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date || 0);
    const dateB = new Date(b.frontmatter.date || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return {
    props: { posts: sortedPosts }
  };
};
*/
