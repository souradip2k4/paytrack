import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DocumentType } from "@/lib/documents/schema";

type ToolLink = {
	type: DocumentType;
	href: string;
	title: string;
	description: string;
};

const ALL: ToolLink[] = [
	{
		type: "invoice",
		href: "/invoice-generator",
		title: "Invoice Generator",
		description:
			"Bill clients with line items, taxes and a clear due date.",
	},
	{
		type: "receipt",
		href: "/receipt-generator",
		title: "Receipt Generator",
		description:
			"Confirm a completed payment with a clean PDF receipt.",
	},
	{
		type: "estimate",
		href: "/estimate-generator",
		title: "Estimate Generator",
		description:
			"Send a quote with scope, pricing and a validity window.",
	},
];

export function RelatedDocumentTools({
	current,
}: {
	current: DocumentType;
}) {
	const others = ALL.filter(tool => tool.type !== current);
	return (
		<section className="mt-14 space-y-6">
			<div className="space-y-2">
				<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
					More document tools
				</h2>
				<p className="text-muted-foreground max-w-2xl text-base leading-7">
					Same editor, different shape. Switch tool to start fresh
					without losing the draft you have here.
				</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{others.map(tool => (
					<Link
						key={tool.type}
						href={tool.href}
						className="border-border bg-card hover:border-foreground/30 group flex items-start justify-between gap-4 rounded-2xl border p-5 transition-colors">
						<div>
							<div className="text-foreground font-semibold">
								{tool.title}
							</div>
							<p className="text-muted-foreground mt-1 text-sm">
								{tool.description}
							</p>
						</div>
						<ArrowRight className="text-muted-foreground group-hover:text-foreground mt-1 size-4 transition-colors" />
					</Link>
				))}
			</div>
		</section>
	);
}
