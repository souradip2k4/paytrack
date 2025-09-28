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
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import { useDisplayStore, useStore } from "@/lib/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function DeleteButton() {
	const rowSelectionIds = useStore(s => s.row_selection_entries_ids);

	const queryClient = useQueryClient();
	const { mutateAsync, isPending } = useMutation({
		mutationKey: ["tr", "many", "delete"],
		mutationFn: async () => {
			if (rowSelectionIds.length <= 0) return;
			const res = await db(await bearerHeader())
				.from("transactions")
				.delete()
				.in("id", rowSelectionIds);
			if (res.error) throw res.error;
		},
		onSuccess: () => {
			toast.success("Transactions deleted successfully.");
			queryClient.invalidateQueries({
				queryKey: ["tr", "get"],
				exact: false,
			});
			queryClient.refetchQueries({
				queryKey: ["tr", "get"],
				exact: false,
			});
			useDisplayStore.setState({ display_row_selection_state: {} });
			useStore.setState({ row_selection_entries_ids: [] });
		},
		onError: () => toast.error("Failed to delete transactions"),
	});

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
						onClick={() => mutateAsync()}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
