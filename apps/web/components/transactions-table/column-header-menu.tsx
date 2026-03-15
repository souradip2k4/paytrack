"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@budgetbee/ui/core/dropdown-menu";
import { Column } from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	Group,
	PinOff,
	PanelLeft,
	PanelRight,
	Ungroup,
	X,
} from "lucide-react";

export function ColumnHeaderMenu({ column }: { column: Column<any> }) {
	const isSorted = column.getIsSorted();
	const isGrouped = column.getIsGrouped();
	const pinned = column.getIsPinned();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="text-muted-foreground hover:text-foreground ml-auto shrink-0 opacity-0 transition-opacity group-hover/header:opacity-100">
					<svg
						width="14"
						height="14"
						viewBox="0 0 15 15"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
							fill="currentColor"
						/>
					</svg>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-48">
				{column.getCanSort() && (
					<>
						<DropdownMenuItem
							onClick={() => column.toggleSorting(false)}
							disabled={isSorted === "asc"}>
							<ArrowUp className="size-4" />
							Sort ascending
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => column.toggleSorting(true)}
							disabled={isSorted === "desc"}>
							<ArrowDown className="size-4" />
							Sort descending
						</DropdownMenuItem>
						{isSorted && (
							<DropdownMenuItem onClick={() => column.clearSorting()}>
								<X className="size-4" />
								Remove sort
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
					</>
				)}

				{column.getCanGroup() && (
					<>
						{isGrouped ?
							<DropdownMenuItem
								onClick={() => column.toggleGrouping()}>
								<Ungroup className="size-4" />
								Ungroup
							</DropdownMenuItem>
						:	<DropdownMenuItem
								onClick={() => column.toggleGrouping()}>
								<Group className="size-4" />
								Group by this column
							</DropdownMenuItem>
						}
						<DropdownMenuSeparator />
					</>
				)}

				{pinned !== "left" && (
					<DropdownMenuItem onClick={() => column.pin("left")}>
						<PanelLeft className="size-4" />
						Pin to left
					</DropdownMenuItem>
				)}
				{pinned !== "right" && (
					<DropdownMenuItem onClick={() => column.pin("right")}>
						<PanelRight className="size-4" />
						Pin to right
					</DropdownMenuItem>
				)}
				{pinned && (
					<DropdownMenuItem onClick={() => column.pin(false)}>
						<PinOff className="size-4" />
						Unpin
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
