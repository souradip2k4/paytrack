import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

export function StatusBadge({ status }: { status: string }) {
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
    return (
        <Badge variant="outline" className="gap-1.5 rounded-full">
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
