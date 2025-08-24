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
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			return <StatusBadge status={row.getValue("status")} />;
		},
	},
	{
		accessorKey: "category_id",
		header: "Category",
		cell: CategoryCell,
	},
	{
		accessorKey: "transaction_date",
		header: ({ column }) => {
			return (
				<div
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
					className="flex w-fit items-center gap-2">
					<p>Transaction date</p>
					{column.getIsSorted() === "asc" ?
						<ArrowUp className="h-4 w-4" />
					:	<ArrowDown className="h-4 w-4" />}
				</div>
			);
		},
		cell: DateCell,
	},
	{
		accessorKey: "created_at",
		header: "Created",
		cell: DateCell,
	},
	{
		accessorKey: "updated_at",
		header: "Last updated",
		cell: DateCell,
	},

	{
		accessorKey: "user_id",
		header: "Creator",
		cell: CreatorCell,
	},

	/*
    {
        accessorKey: "tags",
        header: "Tags",
        cell: TagsCell,
    },
    */
];
