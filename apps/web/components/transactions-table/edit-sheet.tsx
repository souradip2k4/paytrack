"use client";

import { CategoryPicker } from "@/components/category-picker";
import { DatePicker as TransactionDatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { CategoryBadge } from "../category-badge";
import { StatusBadge } from "../status-badge";
import { CurrencyPicker } from "../transaction-editor/currency-picker";
import { StatusPicker } from "../transaction-editor/status-picker";

export function EditSheet({ open, onOpenChange, transaction }) {
	const { control, handleSubmit, watch } = useForm({
		defaultValues: {
			name: transaction?.name,
			amount: transaction?.amount,
			currency: transaction?.currency,
			category_id: transaction?.category_id,
			status: transaction?.status,
			transaction_date: transaction?.transaction_date,
		},
	});

	const queryClient = useQueryClient();

	const { mutate: updateTransaction, isPending } = useMutation({
		mutationFn: async data => {
			if (!transaction?.id) return;

			const res = await db(await bearerHeader())
				.from("transactions")
				.update(data)
				.eq("id", transaction.id);

			if (res.error) {
				toast.error("Failed to update transaction");
				return;
			}

			return res.data;
		},
		onSuccess: () => {
			toast.success("Transaction updated successfully");
			queryClient.invalidateQueries({ queryKey: ["tr", "get"] });
			onOpenChange(false);
		},
	});

	const onSubmit = data => {
		updateTransaction(data);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex flex-col">
				<SheetHeader>
					<SheetTitle className="font-normal">
						Edit transaction
					</SheetTitle>
					<SheetDescription>
						Make changes to your transaction here. Click save when
						you&apos;re done.
					</SheetDescription>
				</SheetHeader>
				<form
					id="edit-transaction-form"
					onSubmit={handleSubmit(onSubmit)}
					className="grid flex-1 auto-rows-min gap-6 px-4">
					<div className="grid grid-cols-2 gap-3">
						<Label>Name</Label>
						<Controller
							name="name"
							control={control}
							render={({ field }) => <Input {...field} />}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<Label>Amount</Label>
						<Controller
							name="amount"
							control={control}
							render={({ field }) => (
								<Input type="number" {...field} />
							)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<Label>Currency</Label>
						<Controller
							name="currency"
							control={control}
							render={({ field }) => (
								<CurrencyPicker {...field} />
							)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<Label>Category</Label>
						<Controller
							name="category_id"
							control={control}
							render={({ field }) => (
								<CategoryPicker
									{...field}
									trigger={name => (
										<CategoryBadge category={name} />
									)}
								/>
							)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<Label>Status</Label>
						<Controller
							name="status"
							control={control}
							render={({ field }) => (
								<StatusPicker
									{...field}
									trigger={name => (
										<StatusBadge status={name} />
									)}
								/>
							)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<Label>Transaction Date</Label>
						<Controller
							name="transaction_date"
							control={control}
							render={({ field }) => (
								<TransactionDatePicker
									date={new Date(field.value)}
									onDateChange={d =>
										field.onChange(d.toISOString())
									}
								/>
							)}
						/>
					</div>
				</form>
				<SheetFooter>
					<Button
						form="edit-transaction-form"
						type="submit"
						isLoading={isPending}>
						Save changes
					</Button>
					<SheetClose asChild>
						<Button variant="outline">Close</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
