"use client";

import { type Entry } from "@/app/api/[[...route]]/server";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney } from "@/lib/money-utils";
import { cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { CategoryCell } from "./category-cell";
import { EditCell } from "./edit-cell";
import { TagsCell } from "./tags-cell";

const MessageCell = ({ row }: { row: Row<Entry> }) => {
	const message = row.getValue("message") as string;
	return (
		<div className="min-w-[200px]">
			<p className="line-clamp-2 text-wrap text-ellipsis">{message}</p>
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
		header: () => <div className="text-right">Amount</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("amount"));
			const formatted = formatMoney(amount);
			const color =
				amount > 0 ? "text-green-600 dark:text-green-500"
				: amount < 0 ? "text-red-600 dark:text-[#EE0000]"
				: "";
			return (
				<div className={cn("text-right font-medium", color)}>
					<p className="whitespace-nowrap">{formatted}</p>
				</div>
			);
		},
		enableHiding: false,
	},
	{
		accessorKey: "message",
		header: "Message",
		cell: MessageCell,
	},
	{
		accessorKey: "date",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}>
					Date
					{column.getIsSorted() === "asc" ?
						<ArrowUp className="ml-2 h-4 w-4" />
					:	<ArrowDown className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = new Date(row.getValue("date"));
			return (
				<p className="text-muted-foreground">{date.toDateString()}</p>
			);
		},
	},
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
	{
		accessorKey: "edit",
		header: "",
		cell: EditCell,
		enableSorting: false,
		enableHiding: false,
	},
];
