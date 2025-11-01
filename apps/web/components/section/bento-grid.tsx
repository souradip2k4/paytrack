import { cn } from "@/lib/utils";
import AnalyticsImg from "@/public/images/analytics.png";
import EasyCollaborationImg from "@/public/images/easy_collaboration.png";
import InvoiceImg from "@/public/images/invoice.png";
import MonthlyAnalyticsImg from "@/public/images/monthly_analytics.png";
import { Button } from "@budgetbee/ui/core/button";
import Link from "next/link";
import React from "react";

function BentoGridItem({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"bg-accent/10 dark:bg-card flex flex-col items-center justify-center gap-4 rounded-xl border bg-gray-100 p-4 text-center md:p-8",
				className,
			)}>
			{children}
		</div>
	);
}

export function BentoGrid() {
	return (
		<div className="flex w-full flex-col items-center justify-center gap-8 border-b border-t px-4 py-8 lg:px-36 lg:py-24">
			<h1 className="text-accent-foreground text-4xl">
				The <span className="text-primary">easy</span> way to track
				expenses.
			</h1>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:grid-rows-3 lg:grid-cols-4 lg:grid-rows-2">
				<BentoGridItem className="md:order-1">
					<h2 className="text-xl">Gain valuable insights</h2>
					<p className="text-muted-foreground">
						Our analytics tools make it easier for you to vizualize
						your data and gain insights you never had before.
					</p>
					<img src={AnalyticsImg.src} />
				</BentoGridItem>

				<BentoGridItem className="md:order-3 lg:order-2 lg:col-span-2">
					<h2 className="text-2xl">Track your finances</h2>
					<img src={MonthlyAnalyticsImg.src} />
				</BentoGridItem>
				<BentoGridItem className="md:order-2 lg:order-3">
					<h2 className="text-xl">Easy collaboration</h2>
					<p className="text-muted-foreground">
						Seemly collaborate across an entire team with ease.
					</p>
					<img src={EasyCollaborationImg.src} />
				</BentoGridItem>
				<BentoGridItem className="md:order-4 lg:col-span-2">
					<img src={InvoiceImg.src} />
				</BentoGridItem>
				<BentoGridItem className="items-start p-8 text-start md:order-5 md:p-16 lg:col-span-2">
					<h2 className="text-4xl">Ready to start tracking?</h2>
					<p className="text-muted-foreground text-lg">
						Bring harmony to team expenses with budget limits and
						real-time monitiring. Freedom for your staff. Peace of
						mind for you.
					</p>
					<Button size="lg" asChild>
						<Link href="/join">Get started - it&apos;s free</Link>
					</Button>
				</BentoGridItem>
			</div>
		</div>
	);
}
