"use client";

import { cn } from "@/lib/utils";
import { Button } from "@budgetbee/ui/core/button";
import { Calendar } from "@budgetbee/ui/core/calendar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@budgetbee/ui/core/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@budgetbee/ui/core/popover";
import { Separator } from "@budgetbee/ui/core/separator";
import { addDays, format } from "date-fns";
import { fzDatetime } from "fz-datetime";
import { ChevronLeft } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import React from "react";

type OnDateChange = (date: Date) => void;

type DatePickerProps = React.ComponentProps<typeof PopoverPrimitive.Trigger> & {
	modal?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultOpen?: boolean;

	date?: Date;
	onDateChange?: OnDateChange;
	defaultDate?: Date;

	children?: React.ReactNode;
};

const today = new Date();
const yesterday = addDays(today, -1);
const tomorrow = addDays(today, 1);

const defaultDates = [
	{
		label: "Today",
		value: today.toISOString(),
		keywords: ["today"],
	},
	{
		label: "Yesterday",
		value: yesterday.toISOString(),
		keywords: ["yesterday"],
	},
	{
		label: "Tomorrow",
		value: tomorrow.toISOString(),
		keywords: ["tomorrow"],
	},
].map(d => ({
	...d,
	keywords: [
		...d.keywords,
		format(d.value, "MMMM"),
		format(d.value, "dd"),
		format(d.value, "yyyy"),
	],
}));

const { parse: parseDatetime } = fzDatetime();

export function DatePicker(props: DatePickerProps) {
	const {
		modal = false,
		open,
		onOpenChange,
		defaultOpen,
		asChild = false,
		children,
		date,
		defaultDate = new Date(),
		onDateChange,
		className,
		...rest
	} = props;
	const dateValue = React.useMemo(
		() => date || defaultDate,
		[date, defaultDate],
	);

	const onSelect = (e: string) => {
		if (onDateChange) onDateChange(new Date(e));
		setCommandInput(format(e, "yyyy-MM-dd"));
	};

	const [commandInput, setCommandInput] = React.useState("");
	const inferredDates = React.useMemo(
		() => parseDatetime(commandInput),
		[commandInput],
	);

	const todayDateRef = React.useRef<HTMLDivElement>(null!);
	const yesterdayDateRef = React.useRef<HTMLDivElement>(null!);
	const tomorrowDateRef = React.useRef<HTMLDivElement>(null!);
	const pickDateRef = React.useRef<HTMLDivElement>(null!);

	const refs = [todayDateRef, yesterdayDateRef, tomorrowDateRef];

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const key = e.key;
			if (e.ctrlKey) {
				if (key === "1" || key === "2" || key === "3") {
					const ref = refs[Number(key) - 1];
					ref?.current?.click();
				}

				if (key === "Enter") pickDateRef.current?.click();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const [calendarOpen, setCalendarOpen] = React.useState(false);

	return (
		<Popover
			modal={modal}
			open={open}
			onOpenChange={onOpenChange}
			defaultOpen={defaultOpen}>
			<PopoverTrigger
				{...rest}
				className={cn(
					"flex items-center justify-center [&>*]:h-full",
					className,
				)}>
				<React.Fragment>
					{children ?
						children
					: dateValue ?
						dateValue.toLocaleDateString()
					:	"Pick a date"}
				</React.Fragment>
			</PopoverTrigger>
			<PopoverContent
				className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
				align="start">
				{calendarOpen && (
					<div className="mb-1 space-y-1">
						<Calendar
							mode="single"
							selected={dateValue}
							onSelect={e => {
								if (e) {
									onSelect(e.toISOString());
									setCommandInput(format(e, "yyyy-MM-dd"));
								}
								setCalendarOpen(false);
							}}
							captionLayout="dropdown"
						/>
						<Separator />
						<Button
							size="sm"
							variant="ghost"
							className="w-full"
							onClick={() => setCalendarOpen(false)}>
							<ChevronLeft /> Back
						</Button>
					</div>
				)}

				{!calendarOpen && (
					<Command>
						<CommandInput
							placeholder="Type: 21 Feb or 24/03..."
							value={commandInput}
							onValueChange={setCommandInput}
						/>
						<CommandList>
							<CommandEmpty>No results.</CommandEmpty>

							<CommandGroup heading="Suggested">
								{inferredDates.map((inferredDate, i) => (
									<CommandItem
										key={i}
										// ref={i === 0 ? firstSuggestionRef : null}
										onSelect={onSelect}
										value={inferredDate.date.toISOString()}
										keywords={[
											format(
												inferredDate.date,
												"dd MMMM yyyy",
											),
											format(
												inferredDate.date,
												"dd MMM yyyy",
											),
											commandInput,
										]}>
										{format(
											inferredDate.date,
											"dd MMMM yyyy",
										)}
										<CommandShortcut>↵</CommandShortcut>
									</CommandItem>
								))}
							</CommandGroup>

							<CommandSeparator />

							<CommandGroup>
								{defaultDates.map((ql, i) => (
									<CommandItem
										id={
											"date-picker-default-date-" +
											(i + 1)
										}
										key={i}
										onSelect={onSelect}
										value={ql.value}
										keywords={ql.keywords}
										ref={i < 3 ? refs[i] : undefined}>
										{ql.label}
										{i < 3 && (
											<CommandShortcut>
												CTRL+{i + 1}
											</CommandShortcut>
										)}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>

						<CommandSeparator />

						<CommandGroup forceMount>
							<CommandItem
								ref={pickDateRef}
								onSelect={() => setCalendarOpen(true)}>
								Pick a date
								<CommandShortcut>CTRL+↵</CommandShortcut>
							</CommandItem>
						</CommandGroup>
					</Command>
				)}
			</PopoverContent>
		</Popover>
	);
}
