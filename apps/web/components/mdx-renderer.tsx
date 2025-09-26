"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

type MDXRendererProps = {
	source: string | MDXRemoteSerializeResult;
	components?: Record<string, React.ComponentType<any>>;
};

const defaultComponents = {
	h1: (props: any) => (
		<h1
			className="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight [&:not(:first-child)]:mt-8"
			{...props}
		/>
	),
	h2: (props: any) => (
		<h2
			className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 [&:not(:first-child)]:mt-8"
			{...props}
		/>
	),
	h3: (props: any) => (
		<h3
			className="scroll-m-20 text-2xl font-semibold tracking-tight [&:not(:first-child)]:mt-8"
			{...props}
		/>
	),
	h4: (props: any) => (
		<h4
			className="scroll-m-20 text-xl font-semibold tracking-tight [&:not(:first-child)]:mt-6"
			{...props}
		/>
	),
	p: (props: any) => (
		<p
			className="!text-lg leading-7 [&:not(:first-child)]:mt-4"
			{...props}
		/>
	),
	code: (props: any) => (
		<code
			className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
			{...props}
		/>
	),
	pre: (props: any) => (
		<pre
			className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white"
			{...props}
		/>
	),
	blockquote: (props: any) => (
		<blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
	),
	ul: (props: any) => (
		<ul
			className="my-6 ml-6 list-inside list-disc [&>li]:mt-2"
			{...props}
		/>
	),
	ol: (props: any) => (
		<ol
			className="my-6 ml-6 list-inside list-decimal [&>li]:mt-2"
			{...props}
		/>
	),
	a: (props: any) => <a className="underline decoration-dotted" {...props} />,
	hr: (props: any) => <hr className="mt-8" {...props} />,
};

export function MDXRenderer({ source, components = {} }: MDXRendererProps) {
	const parsedSource =
		typeof source === "string" ? JSON.parse(source) : source;
	return (
		<div className="prose prose-lg max-w-none">
			<MDXRemote
				{...parsedSource}
				components={{ ...defaultComponents, ...components }}
			/>
		</div>
	);
}
