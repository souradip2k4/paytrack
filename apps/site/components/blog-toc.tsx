"use client";

import { cn } from "@budgetbee/ui/lib/utils";
import Link from "next/link";
import React from "react";

type TocItem = {
	id: string;
	text: string;
	level: number;
};

type BlogTocProps = {
	contentRootId: string;
};

function collectHeadings(contentRoot: HTMLElement): TocItem[] {
	const headingElements = Array.from(
		contentRoot.querySelectorAll<HTMLElement>("h1[id], h2[id], h3[id], h4[id]"),
	).filter(heading => heading.id && (heading.textContent || "").trim().length > 0);

	return headingElements.map(heading => ({
		id: heading.id,
		text: (heading.textContent || "").trim(),
		level: Number(heading.tagName.slice(1)),
	}));
}

function levelIndent(level: number): string {
	if (level <= 1) return "pl-0";
	if (level === 2) return "pl-2";
	if (level === 3) return "pl-4";
	return "pl-6";
}

export function BlogToc({ contentRootId }: BlogTocProps) {
	const [items, setItems] = React.useState<TocItem[]>([]);
	const [activeId, setActiveId] = React.useState<string>("");

	React.useEffect(() => {
		const contentRoot = document.getElementById(contentRootId);
		if (!contentRoot) return;

		const nextItems = collectHeadings(contentRoot);
		setItems(nextItems);
		if (nextItems.length > 0) setActiveId(nextItems[0]!.id);

		const headingElements = Array.from(
			contentRoot.querySelectorAll<HTMLElement>("h1[id], h2[id], h3[id], h4[id]"),
		);

		const observer = new IntersectionObserver(
			entries => {
				const visibleEntries = entries
					.filter(entry => entry.isIntersecting)
					.sort(
						(a, b) =>
							a.boundingClientRect.top - b.boundingClientRect.top,
					);

				const topEntry = visibleEntries[0];
				if (topEntry?.target instanceof HTMLElement) {
					setActiveId(topEntry.target.id);
				}
			},
			{
				rootMargin: "-20% 0px -65% 0px",
				threshold: 0,
			},
		);

		headingElements.forEach(heading => observer.observe(heading));

		return () => observer.disconnect();
	}, [contentRootId]);

	return (
		<aside className="hidden lg:fixed lg:top-28 lg:right-8 lg:block lg:max-h-[calc(100vh-8rem)] lg:w-64 lg:overflow-auto lg:pr-2">
			<div className="space-y-4 rounded-xl border p-4">
				<Link
					href="/blog"
					className="text-muted-foreground hover:text-foreground block text-sm transition">
					{"<- Back to blogs"}
				</Link>

				<div className="space-y-2">
					<p className="text-sm font-medium">On this page</p>
					<div className="bg-border h-px" />
				</div>

				{items.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						No headings found.
					</p>
				) : (
					<ul className="space-y-2">
						{items.map(item => (
							<li key={item.id} className={levelIndent(item.level)}>
								<a
									href={`#${item.id}`}
									className={cn(
										"hover:text-foreground block text-sm transition",
										activeId === item.id
											? "text-foreground"
											: "text-muted-foreground",
									)}>
									{item.text}
								</a>
							</li>
						))}
					</ul>
				)}
			</div>
		</aside>
	);
}
