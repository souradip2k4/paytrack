"use client";

import { useFilterStore } from "@/lib/store";
import { format } from "date-fns";
import React from "react";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

const dateTimeFormats = [
	{
		label: "Compact",
		values: [
			{ value: "dd/MM/yyyy" },
			{ value: "MM/dd/yyyy" },
			{ value: "yyyy/MM/dd" },
			{ value: "dd/MM/yy" },
			{ value: "MM/dd/yy" },
			{ value: "yy/MM/dd" },
			{ value: "dd-MM-yyyy" },
			{ value: "MM-dd-yyyy" },
			{ value: "yyyy-MM-dd" },
			{ value: "dd-MM-yy" },
			{ value: "MM-dd-yy" },
			{ value: "yy-MM-dd" },
		],
	},
	{
		label: "With Text",
		values: [
			{ value: "dd MMM yyyy" },
			{ value: "MMM dd yyyy" },
			{ value: "yyyy MMM dd" },
			{ value: "dd MMM yy" },
			{ value: "MMM dd yy" },
			{ value: "yy MMM dd" },
			{ value: "dd MMM, yyyy" },
			{ value: "MMM dd, yyyy" },
			{ value: "yyyy MMM dd" },
			{ value: "dd MMM, yy" },
			{ value: "MMM dd, yy" },
			{ value: "yy MMM dd" },
		],
	},
	{
		label: "With Time",
		values: [
			{ value: "dd/MM/yyyy HH:mm" },
			{ value: "MM/dd/yyyy HH:mm" },
			{ value: "yyyy/MM/dd HH:mm" },
			{ value: "dd/MM/yy HH:mm" },
			{ value: "MM/dd/yy HH:mm" },
			{ value: "yy/MM/dd HH:mm" },
			{ value: "dd-MM-yyyy HH:mm" },
			{ value: "MM-dd-yyyy HH:mm" },
			{ value: "yyyy-MM-dd HH:mm" },
			{ value: "dd-MM-yy HH:mm" },
			{ value: "MM-dd-yy HH:mm" },
			{ value: "yy-MM-dd HH:mm" },
		],
	},
];

export function DateFormatPicker() {
	const dateFormatId = React.useId();
	const relativeDatesId = React.useId();

	const dateFormat = useFilterStore(s => s.settings_date_format);
	const relativeDates = useFilterStore(s => s.settings_relative_dates);

	return (
		<div className="space-y-8">
			<div className="flex gap-1">
				<Label className="grow" htmlFor={dateFormatId}>
					Date format
				</Label>
				<Select
					value={dateFormat}
					onValueChange={e =>
						useFilterStore.setState({ settings_date_format: e })
					}>
					<SelectTrigger id={dateFormatId} size="sm" className="grow">
						<SelectValue placeholder="Select a date format" asChild>
							<p>{format(new Date(), dateFormat)}</p>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{dateTimeFormats.map(dtfs => (
							<React.Fragment key={dtfs.label}>
								<SelectGroup>
									<SelectLabel>{dtfs.label}</SelectLabel>
									{dtfs.values.map(dtf => (
										<SelectItem
											value={dtf.value}
											key={dtf.value}>
											<div>
												<p>{dtf.value}</p>
												<p className="text-muted-foreground">
													<code>
														{format(
															new Date(),
															dtf.value,
														)}
													</code>
												</p>
											</div>
										</SelectItem>
									))}
								</SelectGroup>
								<SelectSeparator />
							</React.Fragment>
						))}
					</SelectContent>
				</Select>
			</div>

			{/*
            <div className="flex gap-1 items-center">
                <Label className="grow">Enable custom date formatting</Label>
                <Switch />
            </div>


            <div className="flex gap-1 items-center">
                <Label className="grow flex-col items-start gap-1">
                    <p>Custom datetime format</p>
                    <p className="text-muted-foreground">Apply a custom datetime format based on ISO 8601.</p>
                </Label>
                <div className="grow">
                    <Input placeholder="dd / MMM / YYYY" />
                </div>
            </div>
            */}

			<div className="flex items-center gap-1">
				<Label
					className="grow flex-col items-start gap-1"
					htmlFor={relativeDatesId}>
					<p>Relative dates</p>
					<p className="text-muted-foreground">
						Show relative dates (like today, 2 days ago, etc.)
					</p>
				</Label>
				<Switch
					id={relativeDatesId}
					checked={relativeDates}
					onCheckedChange={e =>
						useFilterStore.setState({ settings_relative_dates: e })
					}
				/>
			</div>
		</div>
	);
}
