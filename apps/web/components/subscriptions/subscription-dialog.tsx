"use client";

import { CategoryPicker } from "@/components/category-picker";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import { useStore } from "@/lib/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { DatePicker } from "../date-picker";

const schema = z.object({
	title: z.string().min(1, "Title is required"),
	amount: z.coerce.number().positive("Amount must be positive"),
	period: z.enum([
		"monthly",
		"yearly",
		"quarterly",
		"semi-annually",
		"weekly",
		"daily",
		"custom",
	]),
	interval_in_days: z.coerce.number().positive().optional(),
	start_date: z.coerce.date(),
	category_id: z.string().uuid().optional(),
});

type FieldValues = z.infer<typeof schema>;

export function SubscriptionDialog() {
	const queryClient = useQueryClient();
	const { data: authData } = authClient.useSession();
	const {
		modal_subscription_open,
		modal_subscription_set_open,
		modal_subscription_date,
	} = useStore();

	const { mutateAsync, isPending } = useMutation({
		mutationKey: ["subscriptions", "post"],
		mutationFn: async (data: FieldValues) => {
			if (!authData || !authData.user || !authData.user.id) return;
			const { ...rest } = data;
			const res = await db(await bearerHeader())
				.from("subscriptions")
				.insert({
					...rest,
					user_id: authData.user.id,
				});
			if (res.error) throw res.error;
			return res.data;
		},
		onError: () => toast.error("Failed to create subscription"),
		onSuccess: () => {
			toast.success("Subscription created successfully");
			queryClient.invalidateQueries({
				queryKey: ["subscriptions"],
			});
			modal_subscription_set_open(false);
		},
	});

	const {
		handleSubmit,
		register,
		control,
		watch,
		formState: { isValid },
		setValue,
		reset,
	} = useForm<FieldValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			period: "monthly",
			start_date: modal_subscription_date || new Date(),
		},
	});

	const period = watch("period");

	const onSubmit = async (e: FieldValues) => {
		await mutateAsync(e);
		reset();
	};

	React.useEffect(() => {
		if (modal_subscription_date) {
			setValue("start_date", modal_subscription_date);
		}
	}, [modal_subscription_date, setValue]);

	return (
		<Dialog
			open={modal_subscription_open}
			onOpenChange={modal_subscription_set_open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Subscription</DialogTitle>
				</DialogHeader>

				<form
					className="grid gap-4 py-4"
					onSubmit={handleSubmit(onSubmit)}>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="title" className="text-right">
							Title
						</Label>
						<Input
							id="title"
							{...register("title")}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="amount" className="text-right">
							Amount
						</Label>
						<Input
							id="amount"
							type="number"
							{...register("amount")}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="start_date" className="text-right">
							Start Date
						</Label>
						<Controller
							name="start_date"
							control={control}
							render={({ field }) => (
								<DatePicker
									date={field.value}
									onDateChange={field.onChange}
									className="col-span-3"
								/>
							)}
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="period" className="text-right">
							Period
						</Label>
						<Controller
							name="period"
							control={control}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}>
									<SelectTrigger className="col-span-3">
										<SelectValue placeholder="Select a period" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="monthly">
											Monthly
										</SelectItem>
										<SelectItem value="yearly">
											Yearly
										</SelectItem>
										<SelectItem value="quarterly">
											Quarterly
										</SelectItem>
										<SelectItem value="semi-annually">
											Semi-Annually
										</SelectItem>
										<SelectItem value="weekly">
											Weekly
										</SelectItem>
										<SelectItem value="daily">
											Daily
										</SelectItem>
										<SelectItem value="custom">
											Custom
										</SelectItem>
									</SelectContent>
								</Select>
							)}
						/>
					</div>
					{period === "custom" && (
						<div className="grid grid-cols-4 items-center gap-4">
							<Label
								htmlFor="interval_in_days"
								className="text-right">
								Interval (days)
							</Label>
							<Input
								id="interval_in_days"
								type="number"
								{...register("interval_in_days")}
								className="col-span-3"
							/>
						</div>
					)}
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="category" className="text-right">
							Category
						</Label>
						<Controller
							name="category_id"
							control={control}
							render={({ field }) => (
								<CategoryPicker
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								modal_subscription_set_open(false);
								reset();
							}}>
							Cancel
						</Button>
						<Button
							type="submit"
							isLoading={isPending}
							disabled={!isValid || isPending}>
							Add
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
