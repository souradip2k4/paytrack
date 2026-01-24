import { CATEGORY_COLORS } from "@/lib/hash";
import { cn } from "@budgetbee/ui/lib/utils";

export function CategoryBadge({
	category,
	className,
	color = "gray",
}: {
	category: string;
	className?: string;
	color: string;
}) {
	const colorObj = CATEGORY_COLORS[color || "gray"]
	return (
		<div
			className={cn(
				"inline-flex w-fit items-center gap-2 rounded-sm border px-1 py-0.5",
				// Use CSS variables for colors to support dark mode switching via Tailwind/CSS
				"bg-[var(--badge-fill)] text-[var(--badge-text)] border-[var(--badge-text)]/40",
				"dark:bg-[var(--badge-fill-dark)] dark:text-[var(--badge-text-dark)] dark:border-[var(--badge-text-dark)]/40",
				className,
			)}
			style={{
				// @ts-ignore
				"--badge-fill": colorObj?.light.fill,
				"--badge-text": colorObj?.light.text,
				"--badge-fill-dark": colorObj?.dark.fill,
				"--badge-text-dark": colorObj?.dark.text,
			} as React.CSSProperties}>
			<pre className="text-xs">{category}</pre>
		</div>
	);
}
