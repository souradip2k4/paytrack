"use client"

import { useFilterStore } from "@/lib/store";
import React from "react";
import { Button } from "../ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CategoryFilter } from "./category-filter";
import { X } from "lucide-react";
import { StatusFilter } from "./status-filter";
import { icons } from "@/lib/icons";
import { FilterOperationSelect } from "./filter-operation-select";

export function FilterPills() {

    const stack = useFilterStore(s => s.filter_stack);
    const clear = useFilterStore(s => s.filter_clear);
    const add = useFilterStore(s => s.filter_add);
    const remove = useFilterStore(s => s.filter_remove);

    return (
        <React.Fragment>
            {
                stack.map(({ operation, values, field, id }, i) => (
                    <div key={i} className="flex [&>*]:rounded-none [&>*]:border-r overflow-clip rounded-full">
                        <Button variant="secondary" size="sm">
                            {field === "categories" && <><icons.category className="size-4 mr-2" /> Category</>}
                            {field === "status" && <><icons.status className="size-4 mr-2" /> Status</>}
                        </Button>
                        <FilterOperationSelect idx={i} />
                        {
                            (operation !== "is empty") && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="secondary" size="sm" className="rounded-none">
                                            {values.length === 1 ? <>{values[0].label}</> : <>{values.length} {field}</>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-1">
                                        {field === "categories" && <CategoryFilter id={id} />}
                                        {field === "status" && <StatusFilter id={id} />}
                                    </PopoverContent>
                                </Popover>
                            )
                        }
                        <Button variant="secondary" size="sm" className="last:rounded-e not-last:border-r" onClick={() => remove(i)}><X /></Button>
                    </div>
                ))
            }
        </React.Fragment>
    )
}
