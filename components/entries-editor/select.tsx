import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { QueryCategories, QueryTags } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { CreateEntriesFormValues } from "./create-entries-button";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SelectProps<T extends FieldValues> {
    name: string;
    control: Control<T>;
    defaultValue?: string;
}

interface MultiSelectProps<T extends FieldValues> {
    name: string;
    control: Control<T>;
    defaultValue?: string[];
}

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function TagsMultiSelect(
    props: MultiSelectProps<CreateEntriesFormValues>,
) {
    const { user } = useUser();
    const { data: tags } = useQuery<QueryTags>({
        queryKey: ["tags", "GET", user?.id],
        queryFn: async () => {
            if (!user) {
                return [];
            }
            const res = await axios.get(`/api/users/${user?.id}/tags`);
            return res.data;
        },
        enabled: !!user && !!user.id,
    });

    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="w-full justify-start rounded-none"
                            variant="ghost">
                            {field.value?.length ?? 0} selected
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {tags?.data.map((tag, i) => (
                            <React.Fragment key={i}>
                                <DropdownMenuCheckboxItem
                                    checked={field.value?.includes(tag.id)}
                                    onCheckedChange={(checked: boolean) => {
                                        if (checked) {
                                            const value =
                                                !field.value ?
                                                    [tag.id]
                                                    : [...field.value, tag.id];
                                            field.onChange(value);
                                        } else {
                                            const value =
                                                field.value?.filter(
                                                    (id: any) => id !== tag.id,
                                                ) ?? [];
                                            field.onChange(value);
                                        }
                                    }}
                                    onSelect={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}>
                                    {tag.name}
                                </DropdownMenuCheckboxItem>
                            </React.Fragment>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        />
    );
}

export function CategorySelect(props: SelectProps<CreateEntriesFormValues>) {
    const { user } = useUser();
    const { data: categories } = useQuery<unknown, unknown, QueryCategories>({
        queryKey: ["categories", "GET", user?.id],
        queryFn: async () => {
            if (!user) {
                return [];
            }
            const res = await axios.get(`/api/users/${user?.id}/categories`);
            return res.data;
        },
        enabled: !!user && !!user.id,
    });

    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field }) => (
                <Select
                    key={props.name}
                    value={field.value || ""}
                    onValueChange={field.onChange}>
                    <SelectTrigger className="w-full rounded-none border-none bg-transparent">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories?.map((category, i) => (
                            <SelectItem key={i} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    );
}
