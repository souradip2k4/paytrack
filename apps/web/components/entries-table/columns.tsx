"use client";

import { type Entry } from "@/app/api/[[...route]]/server";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney } from "@/lib/money-utils";
import { avatarUrl, cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Ellipsis } from "lucide-react";
import { StatusBadge } from "../transaction-editor/transaction-dialog";
import { Badge } from "../ui/badge";

const MessageCell = ({ row }: { row: Row<Entry> }) => {
    const message = row.getValue("message") as string;
    return (
        <div className="min-w-[200px]">
            <p className="line-clamp-2 text-ellipsis text-wrap">{message}</p>
        </div>
    );
};

export const columns: ColumnDef<Entry>[] = [
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
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "amount",
        header: () => <div>Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const formatted = formatMoney(amount);
            const color =
                amount > 0 ? "text-green-600 dark:text-green-500"
                    : amount < 0 ? "text-red-600 dark:text-[#EE0000]"
                        : "";
            return (
                <div className={cn("font-medium", color)}>
                    <p className="whitespace-nowrap">{formatted}</p>
                </div>
            );
        },
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Title",
        cell: ({ column, row }) => (
            <p
                className={cn({
                    "text-muted-foreground": !row.getValue(column.id),
                })}>
                {row.getValue(column.id) || "<no title>"}
            </p>
        ),
    },
    {
        accessorKey: "transaction_date",
        header: ({ column }) => {
            return (
                <div
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="flex items-center">
                    Transaction date
                    {column.getIsSorted() === "asc" ?
                        <ArrowUp className="ml-2 h-4 w-4" />
                        : <ArrowDown className="ml-2 h-4 w-4" />}
                </div>
            );
        },
        cell: ({ row, column }) => {
            const date = new Date(row.getValue(column.id));
            return (
                <div>
                    <p className="text-muted-foreground">
                        {date.toDateString()}
                    </p>
                </div>
            );
        },
    },

    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return <StatusBadge status={row.getValue("status")} />;
        },
    },

    {
        accessorKey: "creator",
        header: "Creator",
        cell: ({ row }) => {
            return (
                <Badge variant="secondary">
                    <img className="h-4 w-4" src={avatarUrl(null)} /> sammaji
                    (you)
                </Badge>
            );
        },
    },

    {
        accessorKey: "last_updated",
        header: "Last updated",
        cell: ({ row }) => {
            const category_id = row.original?.category_id;
            return (
                <div>
                    <p className="text-muted-foreground">{category_id}</p>
                </div>
            );
        },
    },

    /*
    {
        accessorKey: "category",
        header: "Category",
        cell: CategoryCell,
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: TagsCell,
    },
    */
    {
        accessorKey: "edit",
        header: "",
        cell: () => {
            return (
                <Button variant="outline" className="h-8 w-8">
                    <Ellipsis className="h-4 w-4" />
                </Button>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
];
