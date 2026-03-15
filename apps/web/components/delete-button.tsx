"use client";

import { useTransactionMutation } from "@/lib/query";
import { useDisplayStore, useStore } from "@/lib/store";
import { Button } from "@budgetbee/ui/core/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@budgetbee/ui/core/dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteButton() {
	const rowSelectionIds = useStore(s => s.row_selection_entries_ids);

	const { mutateAsync, isPending } = useTransactionMutation();

	if (rowSelectionIds.length <= 0) return null;

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
						Are you sure you want to delete these{" "}
						{rowSelectionIds.length} transaction(s)?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary" size="sm">
							Cancel
						</Button>
					</DialogClose>
					<Button
						size="sm"
						isLoading={isPending}
						onClick={async () => {
							await mutateAsync({
								type: "bulk_delete",
								payload: { ids: rowSelectionIds },
							});
							toast.success(
								"Transactions deleted successfully.",
							);
							useDisplayStore.setState({
								display_row_selection_state: {},
							});
							useStore.setState({
								row_selection_entries_ids: [],
							});
						}}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
