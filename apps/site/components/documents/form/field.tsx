"use client";

import { cn } from "@budgetbee/ui/lib/utils";
import type { ReactNode } from "react";

export function Field({
	label,
	children,
	className,
	hint,
}: {
	label: string;
	children: ReactNode;
	className?: string;
	hint?: string;
}) {
	return (
		<label className={cn("flex flex-col gap-1.5 text-sm", className)}>
			<span className="text-foreground/80 font-medium">{label}</span>
			{children}
			{hint ?
				<span className="text-muted-foreground text-xs">{hint}</span>
			:	null}
		</label>
	);
}

export function SectionCard({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<section className="border-border bg-card rounded-2xl border p-5 shadow-xs">
			<header className="mb-4">
				<h3 className="text-foreground text-sm font-semibold">
					{title}
				</h3>
				{description ?
					<p className="text-muted-foreground mt-1 text-xs">
						{description}
					</p>
				:	null}
			</header>
			<div className="flex flex-col gap-4">{children}</div>
		</section>
	);
}
