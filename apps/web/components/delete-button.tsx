"use client";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useFilterStore } from "@/lib/store";
import { Trash2 } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

export function DeleteButton() {
	const rowSelection = useFilterStore(s => s.display_row_selection_state);
	const keys = React.useMemo(
		() => Object.keys(rowSelection).filter(x => rowSelection[x]),
		[rowSelection],
	);

	if (keys.length <= 0) return null;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" variant="destructive">
					<Trash2 />
					Delete
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="font-normal">
						Delete transactions
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete these transactions?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary" size="sm">
							Cancel
						</Button>
					</DialogClose>
					<Button size="sm">Delete</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
