import { cn } from "@budgetbee/ui/lib/utils";
import { Link2 } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentType, ReactNode } from "react";
import { MdxCodeBlock } from "./mdx-code-block";

type MDXRendererProps = {
	source: string;
	components?: Record<string, ComponentType<any>>;
};

function getTextContent(node: ReactNode): string {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}
	if (Array.isArray(node)) return node.map(getTextContent).join("");
	if (node && typeof node === "object" && "props" in node) {
		const maybeChildren = (node as { props?: { children?: ReactNode } }).props
			?.children;
		return getTextContent(maybeChildren);
	}
	return "";
}

function slugifyHeading(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[`~!@#$%^&*()+={}\[\]|\\:;"'<>,.?/]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function Heading({
	as,
	className,
	children,
	id,
	...props
}: {
	as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	className: string;
	children: ReactNode;
	id?: string;
	[key: string]: any;
}) {
	const Tag = as;
	const fallbackId = slugifyHeading(getTextContent(children));
	const finalId = id || fallbackId || undefined;

	return (
		<Tag id={finalId} className={cn("group", className)} {...props}>
			<span>{children}</span>
			{finalId && (
				<a
					href={`#${finalId}`}
					className="text-muted-foreground hover:text-foreground ml-2 inline-flex align-middle opacity-0 transition group-hover:opacity-100"
					aria-label={`Link to ${getTextContent(children)}`}>
					<Link2 className="mt-0.5 size-4" />
				</a>
			)}
		</Tag>
	);
}

const defaultComponents: Record<string, ComponentType<any>> = {
	h1: (props: any) => (
		<Heading
			as="h1"
			className="not-first:mt-8 scroll-m-20 text-balance text-4xl font-[Instrument_Serif] font-normal tracking-tight"
			{...props}
		/>
	),
	h2: (props: any) => (
		<Heading
			as="h2"
			className="not-first:mt-8 scroll-m-20 pb-2 text-3xl font-[Instrument_Serif] font-normal tracking-tight first:mt-0"
			{...props}
		/>
	),
	h3: (props: any) => (
		<Heading
			as="h3"
			className="not-first:mt-8 scroll-m-20 text-2xl font-[Instrument_Serif] font-normal tracking-tight"
			{...props}
		/>
	),
	h4: (props: any) => (
		<Heading
			as="h4"
			className="not-first:mt-6 scroll-m-20 text-xl font-[Instrument_Serif] font-normal tracking-tight"
			{...props}
		/>
	),
	h5: (props: any) => (
		<Heading
			as="h5"
			className="not-first:mt-6 scroll-m-20 text-lg font-[Instrument_Serif] font-normal tracking-tight"
			{...props}
		/>
	),
	h6: (props: any) => (
		<Heading
			as="h6"
			className="not-first:mt-6 scroll-m-20 text-base font-[Instrument_Serif] font-normal tracking-tight"
			{...props}
		/>
	),
	p: (props: any) => (
		<p
			className="text-muted-foreground not-first:mt-4 text-lg! font-normal leading-7"
			{...props}
		/>
	),
	code: (props: any) => (
		<code
			className={cn(
				"font-mono text-sm",
				!props.className &&
					"bg-muted rounded px-[0.3rem] py-[0.2rem] font-normal",
			)}
			{...props}
		/>
	),
	pre: MdxCodeBlock,
	blockquote: (props: any) => (
		<blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
	),
	ul: (props: any) => (
		<ul
			className="text-muted-foreground my-6 ml-6 list-inside list-disc [&>li]:mt-2"
			{...props}
		/>
	),
	ol: (props: any) => (
		<ol
			className="text-muted-foreground my-6 ml-6 list-inside list-decimal [&>li]:mt-2"
			{...props}
		/>
	),
	a: (props: any) => <a className="underline decoration-dotted" {...props} />,
	hr: (props: any) => <hr className="mt-8" {...props} />,
	table: (props: any) => (
		<div className="relative w-full rounded border">
			<table
				className="w-full caption-bottom text-sm"
				data-slot="table"
				{...props}
			/>
		</div>
	),
	thead: (props: any) => (
		<thead data-slot="table-header" className="bg-card" {...props} />
	),
	tbody: (props: any) => (
		<tbody
			className="[&_tr:last-child]:border-0"
			data-slot="table-body"
			{...props}
		/>
	),
	tfoot: (props: any) => (
		<tfoot
			className="bg-muted/50 border-t font-medium [&>tr]:last:border-b-0"
			data-slot="table-footer"
			{...props}
		/>
	),
	tr: (props: any) => (
		<tr
			className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
			data-slot="table-row"
			{...props}
		/>
	),
	th: (props: any) => (
		<th
			className="text-foreground h-10 whitespace-nowrap px-2 text-left align-middle font-medium"
			data-slot="table-head"
			{...props}
		/>
	),
	td: (props: any) => (
		<td
			className="whitespace-nowrap p-2 align-middle *:ring-inset"
			data-slot="table-cell"
			{...props}
		/>
	),
	caption: (props: any) => (
		<caption
			className="text-muted-foreground mt-4 text-sm"
			data-slot="table-caption"
			{...props}
		/>
	),
};

export function MDXRenderer({ source, components = {} }: MDXRendererProps) {
	return (
		<div className="prose prose-lg max-w-none">
			<MDXRemote source={source} components={{ ...defaultComponents, ...components }} />
		</div>
	);
}
