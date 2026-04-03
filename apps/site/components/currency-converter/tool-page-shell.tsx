import { Badge } from "@budgetbee/ui/core/badge";
import { Button } from "@budgetbee/ui/core/button";
import { Card, CardContent } from "@budgetbee/ui/core/card";
import { cn, getAppUrl } from "@budgetbee/ui/lib/utils";
import { ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type ToolHeroStat = {
	label: string;
	value: string;
};

type ToolHeroProps = {
	eyebrow: string;
	title: string;
	description: string;
	stats: ToolHeroStat[];
	align?: "left" | "center";
	backHref?: string;
	backLabel?: string;
	actions?: ReactNode;
};

type ToolLinkCardProps = {
	href: string;
	title: string;
	description: string;
	eyebrow?: string;
};

type ToolLinkGridItem = {
	href: string;
	label: string;
	meta?: string;
};

export function ToolPageShell({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">{children}</div>
	);
}

export function ToolHero({
	eyebrow,
	title,
	description,
	stats,
	align = "left",
	backHref,
	backLabel,
	actions,
}: ToolHeroProps) {
	return (
		<section className="border-border/60 relative overflow-hidden rounded-[2rem] border bg-[linear-gradient(180deg,rgba(34,197,94,0.14),transparent_45%),radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_35%)] px-6 py-8 sm:px-8 sm:py-10">
			<div className="bg-background/70 absolute inset-0 backdrop-blur-[1px]" />
			<div className="relative space-y-8">
				<div
					className={cn(
						"space-y-4",
						align === "center" && "mx-auto max-w-3xl text-center",
					)}>
					{backHref && backLabel ?
						<Link
							href={backHref}
							className={cn(
								"text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors",
								align === "center" && "justify-center",
							)}>
							<ChevronLeft className="h-4 w-4" />
							{backLabel}
						</Link>
					:	null}
					<Badge
						variant="outline"
						className={cn(
							"border-border/70 bg-background/80 rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em]",
							align === "center" && "mx-auto",
						)}>
						{eyebrow}
					</Badge>
					<div className="space-y-3">
						<h1 className="text-accent-foreground text-3xl font-[Instrument_Serif] leading-none sm:text-4xl lg:text-6xl">
							{title}
						</h1>
						<p
							className={cn(
								"text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg",
								align === "center" && "mx-auto",
							)}>
							{description}
						</p>
					</div>
					{actions ?
						<div
							className={cn(
								"flex flex-wrap gap-3 pt-2",
								align === "center" && "justify-center",
							)}>
							{actions}
						</div>
					:	null}
				</div>

				<div className="grid gap-3 sm:grid-cols-3">
					{stats.map(stat => (
						<Card
							key={stat.label}
							className="border-border/60 bg-background/85 gap-0 py-0 shadow-sm shadow-black/5">
							<CardContent className="space-y-1 p-4">
								<p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.12em]">
									{stat.label}
								</p>
								<p className="text-foreground text-sm font-semibold sm:text-base">
									{stat.value}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}

export function ToolSection({
	title,
	description,
	children,
	className,
}: {
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={cn("mt-14 space-y-6 sm:mt-16", className)}>
			<div className="space-y-2">
				<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
					{title}
				</h2>
				{description ?
					<p className="text-muted-foreground max-w-2xl text-base leading-7">
						{description}
					</p>
				:	null}
			</div>
			{children}
		</section>
	);
}

export function ToolLinkCard({
	href,
	title,
	description,
	eyebrow,
}: ToolLinkCardProps) {
	return (
		<Link href={href} className="group block">
			<Card className="border-border/60 bg-card/80 group-hover:border-primary/40 h-full gap-0 py-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:shadow-black/5">
				<CardContent className="space-y-3 p-5">
					{eyebrow ?
						<p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.14em]">
							{eyebrow}
						</p>
					:	null}
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-2">
							<h3 className="text-foreground text-lg font-semibold">
								{title}
							</h3>
							<p className="text-muted-foreground text-sm leading-6">
								{description}
							</p>
						</div>
						<ArrowRight className="text-muted-foreground group-hover:text-primary mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

export function ToolLinkGrid({
	items,
	className,
}: {
	items: ToolLinkGridItem[];
	className?: string;
}) {
	return (
		<div className={cn("grid gap-3 sm:grid-cols-2", className)}>
			{items.map(item => (
				<Link
					key={item.href}
					href={item.href}
					className="border-border/60 bg-card/70 hover:border-primary/40 hover:bg-accent/40 group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors">
					<div>
						<p className="text-sm font-medium">{item.label}</p>
						{item.meta ?
							<p className="text-muted-foreground mt-1 text-xs">
								{item.meta}
							</p>
						:	null}
					</div>
					<ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
				</Link>
			))}
		</div>
	);
}

export function CTACardOne({
	title,
	description,
	ctaLabel = "Start tracking for free",
	href = getAppUrl(),
}: {
	title: string;
	description: string;
	ctaLabel?: string;
	href?: string;
}) {
	return (
		<section className="mt-16 sm:mt-20">
			<div className="border-input from-input to-primary overflow-hidden rounded-[1rem] border bg-gradient-to-b">
				<div className="bg-background/80 px-6 py-8 text-center backdrop-blur-sm sm:px-10 sm:py-10">
					<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
						{title}
					</h2>
					<p className="text-muted-foreground mx-auto mt-3 max-w-xl leading-7">
						{description}
					</p>
					<Button asChild className="mt-6 rounded-full" size="lg">
						<Link href={href ?? ""}>
							{ctaLabel}
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
