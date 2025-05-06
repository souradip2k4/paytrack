"use client";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useLocalStorage } from "@/hooks/use-localstorage";
import currenciesJson from "@/lib/currencies.json";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import React from "react";

export function CurrencySelect() {
	const id = React.useId();
	const [open, setOpen] = React.useState<boolean>(false);
	const [currency, setCurrency] = useLocalStorage("currency", "USD");

	const currencyKeys = React.useMemo(() => Object.keys(currenciesJson), []);

	return (
		<div className="space-y-3">
			<Label htmlFor={id}>Currency</Label>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]">
						<span
							className={cn(
								"truncate",
								!currency && "text-muted-foreground",
							)}>
							{currency ?
								currenciesJson[
									currencyKeys.find(
										k => k === currency,
									) as keyof typeof currenciesJson
								]?.name
							:	"Select currency"}
						</span>
						<ChevronDownIcon
							size={16}
							className="text-muted-foreground/80 shrink-0"
							aria-hidden="true"
						/>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
					align="start">
					<Command>
						<CommandInput placeholder="Search framework..." />
						<CommandList>
							<CommandEmpty>No currencies found.</CommandEmpty>
							<CommandGroup>
								{currencyKeys.map(key => (
									<CommandItem
										key={key}
										value={
											currenciesJson[
												key as keyof typeof currenciesJson
											].name
										}
										onSelect={() => {
											setCurrency(key);
											setOpen(false);
										}}>
										{
											currenciesJson[
												key as keyof typeof currenciesJson
											].name
										}
										{currency === key && (
											<CheckIcon
												size={16}
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
		</div>
	);
}

/*"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/use-localstorage";
import React from "react";
import currenciesJson from "@/lib/currencies.json"


export function CurrencySelect() {
    const [currency, setCurrency] = useLocalStorage("currency", "USD")
    return (
        <Select value={currency} onValueChange={(e) => setCurrency(e)}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
                {
                    Object.keys(currenciesJson).map((key) => {
                        return (
                            <SelectItem key={key} value={key}>
                                {currenciesJson[key as keyof typeof currenciesJson].name}
                            </SelectItem>
                        )
                    })
                }
                <SelectItem value="USD">US Dollars</SelectItem>
                <SelectItem value="INR">Indian Rupees</SelectItem>
            </SelectContent>
        </Select>
    )
}*/
