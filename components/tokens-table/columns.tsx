"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { differenceInDays, format } from "date-fns";
import { Ellipsis } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
/*export type Payment = {
    id: string;
    amount: number;
    status: "pending" | "processing" | "success" | "failed";
    email: string;
}*/

export const columns: ColumnDef<any>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "created_at",
		header: "Created at",
		cell: ({ row }) => {
			const created_at = new Date(row.getValue("created_at"));
			return format(created_at, "yyyy-MM-dd");
		},
	},
	{
		accessorKey: "expire_at",
		header: "Expires in",
		cell: ({ row }) => {
			const created_at = new Date(row.getValue("created_at"));
			const expire_at = new Date(row.getValue("expire_at"));
			const diff = differenceInDays(expire_at, created_at);
			return (
				<div>
					{diff > 0 && <p>{diff} days</p>}
					{diff <= 0 && <Badge>Expired</Badge>}
				</div>
			);
		},
	},
	{
		accessorKey: "permissions",
		header: "Permissions",
		cell: ({ row }) => {
			const permissions: any[] = row.getValue("permissions");
			return (
				<div>
					{permissions.map((x, i) => (
						<Badge key={i}>{x}</Badge>
					))}
				</div>
			);
		},
	},
	{
		accessorKey: "edit",
		header: "",
		cell: () => {
			return (
				<div className="text-right">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<Ellipsis className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>API Keys</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Rename token</DropdownMenuItem>
							<DropdownMenuItem variant="destructive">
								Revoke token
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];
