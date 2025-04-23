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
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import React from "react";
import { FieldValues, useFieldArray, useForm } from "react-hook-form";
import { DatePicker } from "../date-picker";

interface FormValue {
	amount: number;
	message: string;
	date: Date;
}

interface FormValues extends FieldValues {
	fields: FormValue[];
}

export type CreateEntriesFormValues = FormValues;

export function CreateEntriesButton() {
	const [open, setOpen] = React.useState(false);
	const { control, register, handleSubmit } = useForm<FormValues>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "fields",
	});

	const onSubmit = (e: FieldValues) => {
		console.table(e.fields);
	};

	React.useLayoutEffect(
		() => append({ amount: 0, date: new Date(), message: "" }),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create new</Button>
			</DialogTrigger>
			<DialogContent className="min-w-screen max-lg:h-screen lg:min-w-1/2">
				<DialogHeader>
					<DialogTitle className="font-normal">
						Log multiple entries
					</DialogTitle>
				</DialogHeader>

				{/* CREATE ENTRIES FORM */}
				<div className="flex-1 overflow-y-auto py-4">
					<form onSubmit={handleSubmit(onSubmit)} className="w-full">
						<div className="space-y-4">
							<div className="bg-background overflow-hidden rounded-md border">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/50">
											<TableHead className="text-primary h-9 w-24 border py-2">
												Amount
											</TableHead>
											<TableHead className="text-primary h-9 border py-2">
												Date
											</TableHead>
											<TableHead className="text-primary h-9 border py-2">
												Message
											</TableHead>
											<TableHead className="text-primary h-9 w-9 border py-2"></TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{fields.map((f, i) => (
											<React.Fragment key={i}>
												<TableRow>
													<TableCell className="border p-0">
														<Input
															placeholder="Amount"
															type="number"
															key={f.id}
															className="rounded-none border-none"
															{...register(
																`fields.${i}.amount`,
																{
																	valueAsNumber:
																		true,
																},
															)}
														/>
													</TableCell>

													<TableCell className="border p-0">
														<DatePicker
															name={`fields.${i}.date`}
															control={control}
														/>
													</TableCell>

													<TableCell className="border p-0">
														<Input
															placeholder="Message"
															type="text"
															className="rounded-none border-none"
															{...register(
																`fields.${i}.message`,
															)}
														/>
													</TableCell>

													<TableCell className="bg-input/30 w-9 border p-0">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => {
																if (
																	fields.length <=
																	1
																)
																	return;
																remove(i);
															}}>
															<Trash2 className="size-4" />
														</Button>
													</TableCell>
												</TableRow>
											</React.Fragment>
										))}
									</TableBody>
								</Table>
							</div>

							<Button
								variant="secondary"
								type="button"
								onClick={() =>
									append({
										amount: 0,
										date: new Date(),
										message: "",
									})
								}>
								+ Add More
							</Button>
						</div>
					</form>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="ghost">
							Cancel
						</Button>
					</DialogClose>
					<Button
						onClick={() => {
							handleSubmit(onSubmit)();
						}}
						type="submit">
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
