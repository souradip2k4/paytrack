import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "./ui/badge";

const statusBadgeVariants = cva("", {
	variants: {
		variant: {
			outline: "",
			primary: "",
			secondary: "",
			ghost: "border-transparent bg-transparent hover:bg-accent text-foreground",
		},
	},
	defaultVariants: {
		variant: "outline",
	},
});

export interface StatusBadgeProps extends VariantProps<
	typeof statusBadgeVariants
> {
	status: string;
	className?: string;
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
	const statusMap: Record<
		string,
		{
			color: string;
			title: string;
		}
	> = {
		paid: {
			color: "bg-emerald-500",
			title: "Paid",
		},
		pending: {
			color: "bg-amber-500",
			title: "Pending",
		},
		overdue: {
			color: "bg-red-500",
			title: "Overdue",
		},
	};

	const baseBadgeVariant =
		variant === "primary" ? "default"
		: variant === "secondary" ? "secondary"
		: "outline";

	return (
		<Badge
			variant={baseBadgeVariant}
			className={cn(
				"gap-1.5 rounded-full",
				statusBadgeVariants({ variant }),
				className,
			)}>
			<span
				className={cn(
					"size-1.5 rounded-full",
					statusMap[status]?.color,
				)}
				aria-hidden="true"></span>
			{statusMap[status]?.title}
		</Badge>
	);
}
