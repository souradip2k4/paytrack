"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CategoryFilter } from "./category-filter";
import { StatusFilter } from "./status-filter";
import { useFilterStore } from "@/lib/store";
import { ListFilterPlus } from "lucide-react";
import React from "react";
import { nanoid } from "nanoid";
import { icons } from "@/lib/icons";

export function FilterDialog() {
    const clearFilters = useFilterStore(s => s.filter_clear);
    const [id, setId] = React.useState(() => nanoid(8))
    const [open, setOpen] = React.useState(false);
    const stack = useFilterStore(s => s.filter_stack);

    return (
        <DropdownMenu open={open} onOpenChange={(x) => {
            setOpen(x);
            if (open) setId(nanoid(8))
        }} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                    <ListFilterPlus />
                    {stack.length <= 0 && "Filter"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger><icons.category className="size-4 mr-2" /> Category</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <CategoryFilter id={id} />
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger><icons.status className="size-4 mr-2" />Status</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent><StatusFilter id={id} /></DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
