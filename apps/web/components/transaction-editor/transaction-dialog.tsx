"use client";

import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
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
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";
import { bearerHeader } from "@/lib/bearer";
import currenciesJson from "@/lib/currencies.json";
import { db } from "@/lib/db";
import { useStore } from "@/lib/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, PlusIcon } from "lucide-react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Label } from "../ui/label";
import { CategoryPicker } from "./category-picker";
import { CurrencyPicker } from "./currency-picker";
import { TransactionDatePicker } from "./transaction-date-picker";

const schema = z.object({
	name: z.string().max(50).optional(),
	currency: z.string().length(3),
	amount: z.number("*Required"),
	transaction_date: z.coerce.date().optional(),
	status: z.enum(["paid", "pending", "overdue"]).optional(),
	category_id: z.string().optional(),
});

type FieldValues = z.infer<typeof schema>;

export function TransactionDialog() {
	const queryClient = useQueryClient();
	const { data: authData } = authClient.useSession();

	const { mutateAsync, isPending } = useMutation({
		mutationKey: ["tr", "post"],
		mutationFn: async (data: FieldValues) => {
			if (!authData || !authData.user || !authData.user.id) return;
			const { transaction_date, ...rest } = data;
			const res = await db(await bearerHeader())
				.from("transactions")
				.insert({
					...rest,
					transaction_date: transaction_date?.toISOString(),
					user_id: authData.user.id,
				});
			if (res.error) throw res.error;
			return res.data;
		},
		onError: () => toast.error("Failed to create transaction"),
		onSuccess: () => {
			toast.success("Transaction created successfully");
			queryClient.invalidateQueries({
				queryKey: ["tr", "get"],
				exact: false,
			});
			queryClient.refetchQueries({
				queryKey: ["tr", "get"],
				exact: false,
			});
		},
	});

	const {
		handleSubmit,
		register,
		reset,
		control,
		watch,
		formState: { isValid },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			amount: 0,
			status: "paid",
			transaction_date: new Date().toISOString(),
			currency: "USD",
		},
	});

	const currency = watch("currency");

	const onSubmit = async (e: FieldValues) => {
		await mutateAsync(e);
		reset();
	};

	const nameId = React.useId();
	const amountId = React.useId();

	const open = useStore(s => s.popover_transaction_dialog_open);
	const setOpen = useStore(s => s.popover_transaction_dialog_set_open);

	const [statusPopoverOpen, setStatusPopoverOpen] = React.useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<span className="hidden md:block">Add transaction</span>
					<PlusIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="md:min-w-4xl gap-0 p-0 md:max-w-4xl">
				<DialogHeader className="border-b p-6 pb-3">
					<DialogTitle className="font-normal">
						New transaction
					</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>

				<form
					className="flex flex-col gap-3 p-6"
					onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-2">
						<div>
							<Label htmlFor={amountId}>Transaction name</Label>
							<Label
								htmlFor={amountId}
								className="text-muted-foreground inline-flex flex-wrap leading-[0.5rem]">
								Use minus (-) sign to indicate{" "}
								<span className="text-red-400">debit</span>{" "}
								(e.g., -521.60).
							</Label>
						</div>

						<div className="relative">
							<Input
								id={amountId}
								className="peer pe-12 ps-12"
								placeholder="Transaction amount (eg, -57.21)"
								type="text"
								{...register("amount", {
									valueAsNumber: true,
									required: true,
								})}
							/>

							<span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
								{/* @ts-ignore */}
								{currenciesJson.data[currency].symbol}
							</span>

							<span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
								{/* @ts-ignore */}
								{currenciesJson.data[currency].code}
							</span>
						</div>
					</div>

					<div className="mt-4 space-y-2">
						<Label htmlFor={nameId}>Title (optional)</Label>
						<Input
							id={nameId}
							placeholder="Title (eg, Groceries)"
							{...register("name", {
								required: true,
							})}
						/>
					</div>

					<div className="mt-4 flex w-full gap-2">
						<Controller
							name="currency"
							control={control}
							render={({ field: { value, onChange } }) => (
								<CurrencyPicker
									value={value}
									onChange={onChange}
								/>
							)}
						/>

						<Controller
							name="transaction_date"
							control={control}
							render={({ field: { value, onChange } }) => {
								const date =
									value ?
										value instanceof Date ?
											value
										:	new Date(value as string)
									:	undefined;
								return (
									<TransactionDatePicker
										date={date}
										onDateChange={d => {
											onChange(d);
										}}
									/>
								);
							}}
						/>

						<Controller
							name="status"
							control={control}
							render={({ field: { value, onChange } }) => (
								<React.Fragment>
									<Popover
										open={statusPopoverOpen}
										onOpenChange={setStatusPopoverOpen}
										modal>
										<PopoverTrigger>
											{value ?
												<StatusBadge status={value} />
											:	<Badge variant="outline">
													Status
												</Badge>
											}
										</PopoverTrigger>
										<PopoverContent
											className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
											align="start">
											<Command>
												<CommandInput placeholder="Search..." />
												<CommandList>
													<CommandEmpty>
														No status found.
													</CommandEmpty>
													<CommandGroup>
														{[
															"paid",
															"pending",
															"overdue",
														].map(status => (
															<CommandItem
																key={status}
																value={status}
																onSelect={e => {
																	onChange(e);
																	setStatusPopoverOpen(
																		false,
																	);
																}}>
																<StatusBadge
																	status={
																		status
																	}
																/>
																{value ===
																	status && (
																	<CheckIcon
																		size={
																			16
																		}
																		className="ml-auto"
																	/>
																)}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</React.Fragment>
							)}
						/>

						<Controller
							name="category_id"
							control={control}
							render={({ field: { value, onChange } }) => (
								<CategoryPicker
									value={value as string}
									onChange={onChange}
								/>
							)}
						/>
					</div>
				</form>

				<DialogFooter className="border-t p-3">
					<DialogClose asChild>
						<Button
							variant="secondary"
							size="sm"
							onClick={() => reset()}>
							Cancel
						</Button>
					</DialogClose>
					<Button
						disabled={!isValid}
						isLoading={isPending}
						onClick={handleSubmit(onSubmit)}
						size="sm"
						type="submit">
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
