import { readMDXFile, readMarkdownFile } from "@budgetbee/ui/lib/markdown";
import fs from "node:fs";
import path from "node:path";

const BLOG_DIR_SEGMENTS = ["content", "blogs"] as const;
const MARKDOWN_EXTENSIONS = [".md", ".mdx"] as const;
const MARKDOWN_FILE_PATTERN = /\.mdx?$/i;
const DEFAULT_SITE_URL = "https://www.budget-bee.app";

export type BlogSeoMetadata = {
	title?: string;
	description?: string;
	keywords?: string[];
	image?: string;
};

export type BlogFrontmatter = {
	title: string;
	description: string;
	published_at: string;
	updated_at?: string;
	author?: string;
	tags?: string[];
	keywords?: string[];
	image?: string;
	draft?: boolean;
	metadata?: BlogSeoMetadata;
};

export type BlogPostSummary = {
	slug: string;
	slugSegments: string[];
	route: string;
	sourcePath: string;
	lastModified: Date;
	readingTime: number;
	frontmatter: BlogFrontmatter;
};

export type BlogPost = BlogPostSummary & {
	content: string;
	compiledSource: string;
};

function trimTrailingSlash(value: string): string {
	return value.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
	return trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
}

export function resolveBlogImageUrl(
	image: string | undefined,
	route: string,
	title?: string,
): string {
	const siteUrl = getSiteUrl();
	if (!image) {
		const query = new URLSearchParams({
			title: title || "Budgetbee Blog",
			route,
		});
		return `${siteUrl}/blog-og?${query.toString()}`;
	}
	if (/^https?:\/\//i.test(image)) return image;
	if (image.startsWith("/")) return `${siteUrl}${image}`;
	return `${siteUrl}/${image}`;
}

function resolveBlogsDirectory(): string {
	const cwd = process.cwd();
	const candidates = [
		path.join(cwd, ...BLOG_DIR_SEGMENTS),
		path.join(cwd, "apps", "site", ...BLOG_DIR_SEGMENTS),
	];

	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) return candidate;
	}

	return candidates[0] || path.join(cwd, ...BLOG_DIR_SEGMENTS);
}

function walkMarkdownFiles(directory: string): string[] {
	if (!fs.existsSync(directory)) return [];

	const entries = fs.readdirSync(directory, { withFileTypes: true });
	const files = entries.flatMap(entry => {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return walkMarkdownFiles(fullPath);
		if (entry.isFile() && MARKDOWN_FILE_PATTERN.test(entry.name)) return [fullPath];
		return [];
	});

	return files.sort((a, b) => a.localeCompare(b));
}

function toSlugSegments(filePath: string): string[] {
	const relativePath = path
		.relative(resolveBlogsDirectory(), filePath)
		.replaceAll(path.sep, "/");

	return relativePath
		.replace(MARKDOWN_FILE_PATTERN, "")
		.split("/")
		.filter(Boolean);
}

function toRoute(slugSegments: string[]): string {
	return `/blog/${slugSegments.join("/")}`;
}

function toReadableTitle(slug: string): string {
	return slug
		.split("-")
		.filter(Boolean)
		.map(word => word[0]!.toUpperCase() + word.slice(1))
		.join(" ");
}

function stringValue(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : undefined;
}

function stringArrayValue(value: unknown): string[] | undefined {
	if (Array.isArray(value)) {
		const normalized = value
			.map(item => (typeof item === "string" ? item.trim() : ""))
			.filter(Boolean);
		return normalized.length > 0 ? normalized : undefined;
	}

	if (typeof value === "string") {
		const normalized = value
			.split(",")
			.map(item => item.trim())
			.filter(Boolean);
		return normalized.length > 0 ? normalized : undefined;
	}

	return undefined;
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return value as Record<string, unknown>;
	}
	return undefined;
}

function normalizeDate(value: unknown, fallback: Date): string {
	const maybeDate = stringValue(value);
	if (!maybeDate) return fallback.toISOString();
	if (Number.isNaN(new Date(maybeDate).getTime())) return fallback.toISOString();
	return maybeDate;
}

function optionalDate(value: unknown): string | undefined {
	const maybeDate = stringValue(value);
	if (!maybeDate) return undefined;
	if (Number.isNaN(new Date(maybeDate).getTime())) return undefined;
	return maybeDate;
}

function normalizeFrontmatter(
	rawFrontmatter: Record<string, unknown>,
	slug: string,
	lastModified: Date,
): BlogFrontmatter {
	const metadataRecord = recordValue(rawFrontmatter.metadata);
	const metadata = metadataRecord
		? {
				title: stringValue(metadataRecord.title),
				description: stringValue(metadataRecord.description),
				keywords: stringArrayValue(metadataRecord.keywords),
				image: stringValue(metadataRecord.image),
			}
		: undefined;

	const title = stringValue(rawFrontmatter.title) || toReadableTitle(slug);
	const description =
		stringValue(rawFrontmatter.description) ||
		`Read "${title}" on the Budgetbee blog.`;

	return {
		title,
		description,
		published_at: normalizeDate(rawFrontmatter.published_at, lastModified),
		updated_at: optionalDate(rawFrontmatter.updated_at),
		author: stringValue(rawFrontmatter.author),
		tags: stringArrayValue(rawFrontmatter.tags),
		keywords: stringArrayValue(rawFrontmatter.keywords),
		image: stringValue(rawFrontmatter.image),
		draft: rawFrontmatter.draft === true,
		metadata,
	};
}

function buildSummaryFromFile(
	filePath: string,
	rawFrontmatter: Record<string, unknown>,
	readingTime: number | undefined,
): BlogPostSummary {
	const slugSegments = toSlugSegments(filePath);
	const slug = slugSegments.join("/");
	const route = toRoute(slugSegments);
	const lastModified = fs.statSync(filePath).mtime;
	const frontmatter = normalizeFrontmatter(rawFrontmatter, slug, lastModified);

	return {
		slug,
		slugSegments,
		route,
		sourcePath: filePath,
		lastModified,
		readingTime: readingTime || 1,
		frontmatter,
	};
}

function publishedTime(frontmatter: BlogFrontmatter): number {
	const time = new Date(frontmatter.published_at).getTime();
	return Number.isNaN(time) ? 0 : time;
}

function findBlogFile(slugSegments: string[]): string | null {
	const blogDirectory = resolveBlogsDirectory();
	const basePath = path.join(blogDirectory, slugSegments.join("/"));

	for (const extension of MARKDOWN_EXTENSIONS) {
		const filePath = `${basePath}${extension}`;
		if (fs.existsSync(filePath)) return filePath;
	}

	return null;
}

export async function getAllBlogPosts(options?: {
	includeDrafts?: boolean;
}): Promise<BlogPostSummary[]> {
	const includeDrafts = options?.includeDrafts === true;
	const blogDirectory = resolveBlogsDirectory();
	const filePaths = walkMarkdownFiles(blogDirectory);

	const posts = await Promise.all(
		filePaths.map(async filePath => {
			const { data, error } = await readMarkdownFile(filePath);
			if (error || !data) return null;
			return buildSummaryFromFile(filePath, data.frontmatter, data.readingTime);
		}),
	);

	return posts
		.filter((post): post is BlogPostSummary => post !== null)
		.filter(post => includeDrafts || !post.frontmatter.draft)
		.sort(
			(a, b) => publishedTime(b.frontmatter) - publishedTime(a.frontmatter),
		);
}

export async function getBlogPostBySlug(
	slugInput: string[] | string,
): Promise<BlogPost | null> {
	const slugSegments = (Array.isArray(slugInput) ? slugInput : slugInput.split("/"))
		.map(segment => segment.trim())
		.filter(Boolean);

	if (slugSegments.length === 0) return null;

	const filePath = findBlogFile(slugSegments);
	if (!filePath) return null;

	const { data, error } = await readMDXFile(filePath);
	if (error || !data) return null;

	const summary = buildSummaryFromFile(
		filePath,
		data.frontmatter,
		data.readingTime,
	);

	return {
		...summary,
		content: data.content,
		compiledSource: data.compiledSource,
	};
}
