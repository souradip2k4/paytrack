"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { icons } from "@/lib/icons";
import { useFilterStore } from "@/lib/store";
import { ListFilterPlus } from "lucide-react";
import { nanoid } from "nanoid";
import React from "react";
import { AmountFilter } from "./amount-filter";
import { CategoryFilter } from "./category-filter";
import { StatusFilter } from "./status-filter";
import { DateFilter } from "./date-filter";

export function FilterDialog() {
    const [id, setId] = React.useState(() => nanoid(4));
    const [open, setOpen] = React.useState(false);
    const stack = useFilterStore(s => s.filter_stack);

    return (
        <DropdownMenu
            open={open}
            onOpenChange={x => {
                setOpen(x);
                if (open) setId(nanoid(8));
            }}
            modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                    <ListFilterPlus />
                    {stack.length <= 0 && "Filter"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <icons.amount className="mr-2 size-4" /> Amount
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <AmountFilter id={"amt_" + id} />
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <icons.category className="mr-2 size-4" /> Category
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <CategoryFilter id={"cat_" + id} />
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <icons.status className="mr-2 size-4" />
                            Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <StatusFilter id={"st_" + id} />
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
