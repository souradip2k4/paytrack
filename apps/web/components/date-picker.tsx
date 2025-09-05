"use client";

import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";

type OnDateChange = (date: Date) => void;

// 02/03/2023
// 02 Feb
// February 2024
// 10h
// 10hr or 10 hrs
function inferDate(s: string) { }

const today = new Date();
const yesterday = addDays(today, -1);
const tomorrow = addDays(today, 1);

const quickLinks = [
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
        format(d.value, "dd MMMM yyyy"),
        format(d.value, "dd MMM yyyy"),
    ],
}));

export function DatePicker({
    date,
    onDateChange,
    defaultDate,
}: {
    date?: Date;
    onDateChange?: OnDateChange;
    defaultDate?: Date;
}) {
    const dateValue = date || defaultDate;

    const onSelect = (e: string) => {
        if (onDateChange) {
            onDateChange(new Date(e));
        }
    };

    return (
        <Popover modal>
            <PopoverTrigger asChild>
                <Badge variant="outline">
                    {dateValue ? dateValue.toLocaleDateString() : "Custom date"}
                </Badge>
            </PopoverTrigger>
            <PopoverContent
                className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
                align="start">
                <Command>
                    <CommandInput placeholder="Type: 21 Feb or 24/03..." />
                    <CommandList>
                        <CommandEmpty>Sorry</CommandEmpty>
                        <CommandGroup>
                            {quickLinks.map((ql, i) => (
                                <CommandItem
                                    key={i}
                                    onSelect={onSelect}
                                    value={ql.value}
                                    keywords={ql.keywords}>
                                    {ql.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
