"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "../ui/input";

type FormData = {
	name: string;
};

export function CreateCategoryButton({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user } = useUser();
	const [open, setOpen] = React.useState(false);

	const nameId = React.useId();
	const { register, handleSubmit, reset } = useForm();

	const queryClient = useQueryClient();
	const { isPending, mutate } = useMutation<
		{
			name: string;
		},
		{
			name: string;
		},
		FormData
	>({
		mutationKey: ["categories", "POST"],
		mutationFn: async data => {
			const res = await axios.post("/api/categories", {
				user_id: user?.id,
				name: data.name,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["categories", "GET"],
				exact: false,
			});
			queryClient.refetchQueries({
				queryKey: ["categories", "GET"],
				exact: false,
			});
			reset();
			setOpen(false);
			toast.success("Category created successfully.");
		},
		onError: () => toast.error("Failed to create category."),
	});

	const onSubmit = (e: FieldValues) => mutate(e as FormData);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="font-normal">
						Create category.
					</DialogTitle>
				</DialogHeader>

				<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-2">
						<Label
							htmlFor={nameId}
							className="text-primary text-xs font-normal">
							Category name
						</Label>
						<Input
							id={nameId}
							type="text"
							placeholder="Enter a name for the category."
							{...register("name")}
						/>
					</div>

					<DialogFooter>
						<DialogClose onClick={() => reset()} asChild>
							<Button variant="ghost">Cancel</Button>
						</DialogClose>
						<Button disabled={isPending} size="sm" type="submit">
							{isPending ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
