"use client";

import { CategoryPicker } from "@/components/category-picker";
import { DatePicker } from "@/components/date-picker";
import { StatusBadgeProps } from "@/components/status-badge";
import { useLocalStorage } from "@/hooks/use-localstorage";
import { Badge } from "@budgetbee/ui/core/badge";
import { Button } from "@budgetbee/ui/core/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@budgetbee/ui/core/dialog";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@budgetbee/ui/core/tooltip";

import currenciesJson from "@/lib/currencies.json";
import { evaluateExpression } from "@/lib/math-parser";
import { useCategories, useTransactionMutation } from "@/lib/query";
import { useStore } from "@/lib/store/store";
import { Kbd } from "@budgetbee/ui/core/kbd";
import { cn } from "@budgetbee/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { PlusIcon } from "lucide-react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { CurrencyPicker } from "./currency-picker";
import { StatusPicker } from "./status-picker";

const schema = z.object({
	name: z.string().max(50).optional(),
	currency: z.string().length(3),
	amount: z.union([z.string(), z.number()]).transform((val, ctx) => {
		if (typeof val === "number") return val;
		if (val === "") {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Required",
			});
			return z.NEVER;
		}
		try {
			return evaluateExpression(val);
		} catch (e) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Invalid expression",
			});
			return z.NEVER;
		}
	}),
	transaction_date: z.coerce.date().optional(),
	status: z.enum(["paid", "pending", "overdue"]).default("paid"),
	category_id: z.string().optional(),
});

type FieldValues = z.infer<typeof schema>;

export function TransactionDialog() {
	const { mutateAsync: createTransaction, isPending } =
		useTransactionMutation();

	const handleCreate = async (data: FieldValues) => {
		const { transaction_date, ...rest } = data;
		await createTransaction({
			type: "create",
			payload: {
				...rest,
				transaction_date:
					transaction_date?.toISOString() ?? new Date().toISOString(),
			},
		});
		toast.success("Transaction created successfully");
	};

	const { data: categories } = useCategories();

	const [defaultLocalCurrency, _] = useLocalStorage(
		"last_used_currency",
		"USD",
	);

	const {
		handleSubmit,
		register,
		reset,
		control,
		watch,
		setValue,
		trigger,
		formState: { isValid, errors },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			amount: 0,
			status: "paid",
			transaction_date: new Date().toISOString(),
			currency: defaultLocalCurrency,
		},
	});

	const currency = watch("currency");

	const onSubmit = async (e: FieldValues) => {
		await handleCreate(e);
		reset();
	};

	const nameId = React.useId();
	const amountId = React.useId();

	const open = useStore(s => s.popover_transaction_dialog_open);
	const setOpen = useStore(s => s.popover_transaction_dialog_set_open);

	const currencyPickerOpen = useStore(s => s.popover_currency_picker_open);
	const datePickerOpen = useStore(s => s.popover_datepicker_open);
	const statusPickerOpen = useStore(s => s.popover_status_picker_open);
	const categoryPickerOpen = useStore(s => s.popover_category_picker_open);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<PlusIcon className="h-4 w-4" />
					<span className="hidden md:block">New transaction</span>
					<Kbd className="bg-primary text-primary-foreground brightness-125">
						n
					</Kbd>
				</Button>
			</DialogTrigger>
			<DialogContent className="md:min-w-4xl gap-0 p-0 md:max-w-4xl">
				<DialogHeader className="border-b p-4 px-6">
					<DialogTitle className="font-normal">
						New transaction
					</DialogTitle>
				</DialogHeader>

				<form
					className="flex flex-col gap-2 p-6"
					onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-2">
						<Label
							htmlFor={amountId}
							className="text-muted-foreground">
							Transaction amount
						</Label>

						<div className="relative">
							<Input
								id={amountId}
								className="peer w-full pe-12 ps-12"
								placeholder="Transaction amount (eg, -57.21)"
								type="text"
								aria-invalid={!!errors.amount}
								onKeyDown={async e => {
									if (e.key !== "Enter") return;
									const val = e.currentTarget.value;
									try {
										const result = evaluateExpression(val);
										setValue("amount", result);
										await trigger("amount");
									} catch (e) {
										// Allow the user to see the invalid expression so they can fix it
										await trigger("amount");
									}
								}}
								{...register("amount", {
									required: true,
									onBlur: async e => {
										const val = e.target.value;
										try {
											const result =
												evaluateExpression(val);
											setValue("amount", result);
											await trigger("amount");
										} catch (e) {
											// Allow the user to see the invalid expression so they can fix it
											await trigger("amount");
										}
									},
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

						<div className="flex">
							<Label
								htmlFor={amountId}
								className="text-muted-foreground ml-auto inline-flex flex-wrap text-xs leading-[0.5rem]">
								Use minus (-) sign to indicate{" "}
								<span className="text-red-400">debit</span>{" "}
								(e.g., -521.60).
							</Label>
						</div>
					</div>

					<div className="mt-2 space-y-2">
						<Label
							htmlFor={nameId}
							className="text-muted-foreground">
							Title (optional)
						</Label>
						<Input
							id={nameId}
							placeholder="Title (eg, Groceries)"
							{...register("name", {
								required: true,
							})}
						/>
					</div>

					<div className="mt-4 flex w-full flex-wrap gap-2">
						<Controller
							name="currency"
							control={control}
							render={({ field: { value, onChange } }) => (
								<React.Fragment>
									<CurrencyPicker
										modal
										open={currencyPickerOpen}
										onOpenChange={(e: boolean) =>
											useStore.setState({
												popover_currency_picker_open: e,
											})
										}
										value={value}
										onValueChange={onChange}
										className="focus-visible:ring-accent rounded-full outline-none focus-visible:ring-2"
										asChild>
										<Tooltip delayDuration={750}>
											<TooltipTrigger asChild>
												<Badge
													variant="outline"
													className="cursor-pointer select-none gap-1.5 rounded-full">
													{value || "Currency"}
												</Badge>
											</TooltipTrigger>
											<TooltipContent
												side="bottom"
												className="bg-accent border p-2 shadow-xl">
												<div className="flex items-center justify-center gap-2">
													<p>Select currency</p>
													<kbd className="bg-muted/50 border/50 text-muted-foreground pointer-events-none relative ml-auto inline-flex select-none items-center justify-center rounded px-[0.3rem] py-[0.1rem] font-mono">
														k
													</kbd>
												</div>
											</TooltipContent>
										</Tooltip>
									</CurrencyPicker>
								</React.Fragment>
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
								const formatedDate =
									date ?
										format(date, "dd MMM yyyy")
									:	"Pick a date";
								return (
									<DatePicker
										modal
										date={date}
										open={datePickerOpen}
										onOpenChange={(e: boolean) =>
											useStore.setState({
												popover_datepicker_open: e,
											})
										}
										onDateChange={(d: Date) => onChange(d)}
										className="focus-visible:ring-accent rounded-full outline-none focus-visible:ring-2"
										asChild>
										<Tooltip delayDuration={750}>
											<TooltipTrigger asChild>
												<Badge
													variant="outline"
													className="gap-1.5 rounded-full">
													{formatedDate}
												</Badge>
											</TooltipTrigger>
											<TooltipContent
												side="bottom"
												className="bg-accent border p-2 shadow-xl">
												<div className="flex items-center justify-center gap-2">
													<p>Pick a date</p>
													<kbd className="bg-muted/50 border/50 text-muted-foreground pointer-events-none relative ml-auto inline-flex select-none items-center justify-center rounded px-[0.3rem] py-[0.1rem] font-mono">
														d
													</kbd>
												</div>
											</TooltipContent>
										</Tooltip>
									</DatePicker>
								);
							}}
						/>

						<Controller
							name="status"
							control={control}
							render={({ field: { value, onChange } }) => {
								const status =
									value ??
									("paid" as StatusBadgeProps["status"]);
								return (
									<React.Fragment>
										<StatusPicker
											modal
											open={statusPickerOpen}
											onOpenChange={(e: boolean) =>
												useStore.setState({
													popover_status_picker_open:
														e,
												})
											}
											value={status}
											onValueChange={onChange}
											className="focus-visible:ring-accent rounded-full outline-none focus-visible:ring-2">
											<Tooltip delayDuration={750}>
												<TooltipTrigger asChild>
													<Badge
														variant="outline"
														className="gap-1.5 rounded-full capitalize">
														<React.Fragment>
															<span
																className={cn(
																	"size-1.5 rounded-full",
																	{
																		"bg-emerald-500":
																			status ===
																			"paid",
																		"bg-amber-500":
																			status ===
																			"pending",
																		"bg-red-500":
																			status ===
																			"overdue",
																	},
																)}
																aria-hidden="true"></span>
															{status}
														</React.Fragment>
													</Badge>
												</TooltipTrigger>
												<TooltipContent
													side="bottom"
													className="bg-accent border p-2 shadow-xl">
													<div className="flex items-center justify-center gap-2">
														<p>Select status</p>
														<kbd className="bg-muted/50 border/50 text-muted-foreground pointer-events-none relative ml-auto inline-flex select-none items-center justify-center rounded px-[0.3rem] py-[0.1rem] font-mono">
															s
														</kbd>
													</div>
												</TooltipContent>
											</Tooltip>
										</StatusPicker>
									</React.Fragment>
								);
							}}
						/>

						<Controller
							name="category_id"
							control={control}
							render={({ field: { value, onChange } }) => (
								<React.Fragment>
									<CategoryPicker
										modal
										open={categoryPickerOpen}
										onOpenChange={(e: boolean) =>
											useStore.setState({
												popover_category_picker_open: e,
											})
										}
										value={value}
										onValueChange={onChange}
										className="focus-visible:ring-accent rounded-full outline-none focus-visible:ring-2"
										asChild>
										<Tooltip delayDuration={750}>
											<TooltipTrigger asChild>
												<Badge
													variant="outline"
													className="gap-1.5 rounded-full capitalize">
													<React.Fragment>
														{categories?.find(
															c => c.id === value,
														)?.name ?? "Category"}
													</React.Fragment>
												</Badge>
											</TooltipTrigger>
											<TooltipContent
												side="bottom"
												className="bg-accent border p-2 shadow-xl">
												<div className="flex items-center justify-center gap-2">
													<p>Select category</p>
													<kbd className="bg-muted/50 border/50 text-muted-foreground pointer-events-none relative ml-auto inline-flex select-none items-center justify-center rounded px-[0.3rem] py-[0.1rem] font-mono">
														c
													</kbd>
												</div>
											</TooltipContent>
										</Tooltip>
									</CategoryPicker>
								</React.Fragment>
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
