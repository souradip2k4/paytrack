"use client";

import { StatusBadge } from "@/components/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney } from "@/lib/money-utils";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { CategoryCell } from "./category-cell";
import { CreatorCell } from "./creator-cell";
import { DateCell } from "./date-cell";

// By defining an explicit `size` for every column, we gain full control over the table's layout.
// This ensures that headers and cells align perfectly.
export const columns: ColumnDef<any>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={value =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={value => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        size: 48, // Adjusted size for checkbox
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const formatted = formatMoney(amount, row.original.currency);
            const color =
                amount > 0 ? "text-emerald-500"
                    : amount < 0 ? "text-red-500"
                        : "";
            return (
                <div className={cn("font-medium", color)}>
                    <p className="whitespace-nowrap">{formatted}</p>
                </div>
            );
        },
        size: 120, // Explicit size for amount
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Title",
        cell: ({ column, row }) => (
            <p
                className={cn("text-ellipsis overflow-hidden", {
                    "text-muted-foreground italic": !row.getValue(column.id),
                })}>
                {row.getValue(column.id) || "no title"}
            </p>
        ),
        size: 480, // More space for the title
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return <StatusBadge status={row.getValue("status")} />;
        },
        size: 120, // Explicit size for status
    },
    {
        accessorKey: "category_id",
        header: "Category",
        cell: CategoryCell,
        size: 160, // Explicit size for category
    },
    {
        accessorKey: "transaction_date",
        header: "Transaction date",
        cell: DateCell,
        size: 180, // Explicit size for date
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: DateCell,
        size: 150, // Explicit size for date
    },
    {
        accessorKey: "updated_at",
        header: "Last updated",
        cell: DateCell,
        size: 150, // Explicit size for date
    },

    {
        accessorKey: "user_id",
        header: "Creator",
        cell: CreatorCell,
        size: 150, // Explicit size for creator
    },

    /*
    {
        accessorKey: "tags",
        header: "Tags",
        cell: TagsCell,
    },
    */
];

