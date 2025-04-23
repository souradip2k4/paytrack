"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { QueryEntry } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, Row } from "@tanstack/react-table";
import axios from "axios";
import { ArrowDown, ArrowUp, Ellipsis } from "lucide-react";
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type Entry = QueryEntry;

const MessageCell = ({ row }: { row: Row<Entry> }) => {
	const message = row.getValue("message") as string;
	return (
		<div className="min-w-[200px]">
			<p className="line-clamp-2 text-wrap text-ellipsis">{message}</p>
		</div>
	);
};

const CategoryCell = ({ row }: { row: Row<Entry> }) => {
	const category_id = row.original.category_id;
	const { user } = useUser();
	const { data } = useQuery<unknown, unknown, Map<string, string>>({
		queryKey: ["categories", "GET", user?.id, "MAP"],
		queryFn: async () => {
			if (!user) {
				return [];
			}
			const res = await axios.get(`/api/users/${user?.id}/categories`);
			const idToNameMap = new Map<string, string>();
			res.data.forEach((c: any) => {
				idToNameMap.set(c.id, c.name);
			});
			return idToNameMap;
		},
		enabled: !!user && !!user.id,
	});
	return (
		<React.Fragment>
			{category_id && (
				<Badge variant="secondary" key={category_id}>
					{data?.get(category_id)}
				</Badge>
			)}
		</React.Fragment>
	);
};

const TagsCell = ({ row }: { row: Row<Entry> }) => {
	const tagc = 2; // no of tags to display
	console.log(row.original);
	const { user } = useUser();
	const { data } = useQuery<unknown, unknown, Map<string, string>>({
		queryKey: ["tags", "GET", user?.id, "MAP"],
		queryFn: async () => {
			if (!user) {
				return [];
			}
			const res = await axios.get(`/api/users/${user?.id}/tags`);
			const idToNameMap = new Map<string, string>();
			console.log(res.data);
			res.data.data.forEach((c: any) => {
				console.log(c);
				idToNameMap.set(c.id, c.name);
			});
			return idToNameMap;
		},
		enabled: !!user && !!user.id,
	});
	return (
		<div className="flex min-w-[200px] flex-wrap gap-1">
			{row.original.tags.map((tag, i) => {
				if (i + 1 <= tagc) {
					return (
						<Badge variant="secondary" key={tag.id}>
							{data?.get(tag.id)}
						</Badge>
					);
				}
			})}
			{row.original.tags.length > tagc && (
				<Popover>
					<PopoverTrigger asChild>
						<Badge variant="secondary">
							+{row.original.tags.length - tagc}
						</Badge>
					</PopoverTrigger>
					<PopoverContent className="w-[200px]">
						<div className="flex flex-wrap gap-1">
							{row.original.tags.map(tag => {
								return (
									<Badge
										variant="secondary"
										className="cursor-pointer"
										key={tag.id}>
										{data?.get(tag.id)}
									</Badge>
								);
							})}
						</div>
					</PopoverContent>
				</Popover>
			)}
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
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "INR",
			}).format(amount);
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
		cell: () => (
			<div className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<Ellipsis className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Entries</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Edit entry</DropdownMenuItem>
						<DropdownMenuItem variant="destructive">
							Delete entry
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		),
	},
];
