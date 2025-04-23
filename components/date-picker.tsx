"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format, subDays } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { Control, FieldValues, useController } from "react-hook-form";
import { CreateEntriesFormValues } from "./entries-table/create-entries-button";

interface DatePickerProps<T extends FieldValues> {
	name: string;
	control: Control<T>;
	defaultValue?: Date;
}

export function DatePicker(props: DatePickerProps<CreateEntriesFormValues>) {
	const today = new Date();
	const yesterday = subDays(today, 1);
	const tommorrow = addDays(today, 1);
	const { name, control, defaultValue = new Date() } = props;
	const { field: dateField } = useController({
		name,
		control,
		defaultValue,
	});

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-full justify-start rounded-none border-none text-left font-normal",
						!dateField.value && "text-muted-foreground",
					)}>
					<CalendarPlus className="size-4" />
					{dateField.value ?
						format(dateField.value, "PPP")
					:	<span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto">
				<div className="flex max-sm:flex-col">
					<div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
						<div className="h-full sm:border-e">
							<div className="flex flex-col px-2">
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start"
									onClick={() => dateField.onChange(today)}>
									Today
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start"
									onClick={() =>
										dateField.onChange(yesterday)
									}>
									Yesterday
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start"
									onClick={() =>
										dateField.onChange(tommorrow)
									}>
									Tommorrow
								</Button>
							</div>
						</div>
					</div>
					<Calendar
						mode="single"
						selected={dateField.value}
						onSelect={newDate => {
							if (newDate) {
								dateField.onChange(newDate);
							}
						}}
						className="p-2"
						disabled={[
							{ after: today }, // Dates before today
						]}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
