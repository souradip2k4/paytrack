"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { editEntryMutationFn } from "@/lib/actions";
import { QueryCategories, QueryEntry } from "@/lib/api";
import { deleteEntryMutationFn } from "@/lib/query";
import { castUndefined, cn } from "@/lib/utils";
import { categoriesAtom, isEditingAtom } from "@/store/atoms";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, Row } from "@tanstack/react-table";
import axios from "axios";
import { format } from "date-fns";
import React, { useState } from "react";
import { Controller, FieldValues, useForm } from "react-hook-form";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useRecoilValue } from "recoil";
import { z } from "zod";
import { Badge } from "../ui/badge";

export type Entry = QueryEntry;

const ActionsCell = ({ row }: { row: Row<Entry> }) => {
    const categories = useRecoilValue(categoriesAtom);
    const queryClient = useQueryClient();
    const deleteEntryMutation = useMutation({
        mutationFn: deleteEntryMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["entries"] });
            queryClient.refetchQueries({ queryKey: ["entries"] });
        },
    });
    const editEntryMutation = useMutation<
        unknown,
        unknown,
        {
            id: string;
            amount: number | null;
            message: string | null;
            category_id: string | null;
            date?: Date;
        }
    >({
        mutationFn: editEntryMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["entries"] });
            queryClient.refetchQueries({ queryKey: ["entries"] });
        },
    });
    const entry = row.original;
    const entrySchema = z.object({
        amount: z.number().nullable(),
        message: z.string().nullable(),
        date: z.date().optional(),
        category_id: z.string().nullable(),
    });
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<{
        amount: number;
        message: string | null;
        category_id: string | null;
        date?: Date;
    }>({
        defaultValues: {
            amount: entry.amount,
            message: entry.message,
            category_id: entry.category_id,
            date: new Date(entry.date),
        },
        resolver: zodResolver(entrySchema),
    });
    const onSubmit = (e: FieldValues) => {
        console.log(e);
        const data = entrySchema.safeParse(e);
        if (!entry.id || !data.success) return;

        const { amount, message, category_id, date } = data.data;
        editEntryMutation.mutate({
            id: entry.id,
            amount,
            message,
            category_id,
            date,
        });
    };

    console.log(errors);

    return (
        <div className="w-fit space-x-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="link" size="icon" className="text-primary-foreground">
                        <Ellipsis className="size-4" />
                    </Button>
                </DialogTrigger>
            </Dialog>
            {/*<Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Pencil />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit entry</DialogTitle>
                        <DialogDescription>
                            Make changes to your entries. Click save changes when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-2"
                    >
                        <div>
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                type="number"
                                placeholder="Amount"
                                {...register("amount", { valueAsNumber: true })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Input placeholder="Message" {...register("message")} />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Controller
                                    name="date"
                                    control={control}
                                    render={({ field: { value, onChange, onBlur } }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !value && "text-muted-foreground",
                                                    )}
                                                >
                                                    {value ? (
                                                        format(new Date(value), "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={castUndefined(value)}
                                                    onSelect={onChange}
                                                    onDayBlur={onBlur}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div>
                                <Label htmlFor="category_id">Category</Label>
                                <Controller
                                    name="category_id"
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                        <Select onValueChange={onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectGroup>
                                                    {!categories && <p>Loading...</p>}
                                                    {categories &&
                                                        categories.map((value) => (
                                                            <SelectItem value={value.id} key={value.id}>
                                                                {value.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => reset()}
                                    className="mt-4"
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" className="mt-4">
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Trash2 />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteEntryMutation.mutate(entry.id)}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>*/}
        </div>
    );
};

const MessageCell = ({ row }: { row: Row<Entry> }) => {
    const isEditing = useRecoilValue(isEditingAtom);
    const message = row.getValue("message") as string;

    if (isEditing) return <Input className="w-fit" defaultValue={message} />;
    return <p>{message}</p>;
};

const CategoryCell = ({ row }: { row: Row<Entry> }) => {
    const { user } = useUser();
    const isEditing = useRecoilValue(isEditingAtom);
    const categoryQuery = useQuery<unknown, unknown, QueryCategories>({
        queryKey: ["category"],
        queryFn: async () => {
            if (!user?.id) return [] as QueryCategories;
            const res = await axios.get(`/api/users/${user?.id}/categories`);
            return res.data as QueryCategories;
        },
    });
    const [categoryInputState, setCategoryInputState] = useState<
        string | undefined
    >(undefined);

    const category = row.original.category ? row.original.category : undefined;
    const category_id = row.original.category_id
        ? row.original.category_id
        : undefined;

    return (
        <React.Fragment>
            {!isEditing && category && (
                <Badge variant="outline" key={category.id}>
                    {category.name}
                </Badge>
            )}
            {isEditing && (
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>

                    <SelectContent defaultValue={category_id}>
                        <Input
                            value={categoryInputState}
                            onChange={(e) => setCategoryInputState(e.target.value)}
                            placeholder="Search"
                        />
                        <SelectGroup>
                            {categoryQuery.isLoading && <p>Loading...</p>}
                            {categoryQuery.data?.map((value) => (
                                <SelectItem value={value.id} key={value.id}>
                                    {value.name}
                                </SelectItem>
                            ))}
                            {categoryInputState && (
                                <Button
                                    variant="secondary"
                                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                >{`Create "${categoryInputState}"`}</Button>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            )}
        </React.Fragment>
    );
};

const TagsCell = ({ row }: { row: Row<Entry> }) => {
    const { user } = useUser();
    const isEditing = useRecoilValue(isEditingAtom);
    return (
        <div className="w-fit space-x-2">
            {row.original.tags.map((value) => (
                <Badge variant="outline" key={value.id}>
                    {value.name}
                </Badge>
            ))}
            {isEditing && (
                <Button variant="link" className="px-2 text-xs">
                    + add
                </Button>
            )}
        </div>
    );
};

export const columns: ColumnDef<Entry>[] = [
    /*{
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    }, */
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "INR",
            }).format(amount);
            const color =
                amount > 0 ? "text-green-600" : amount < 0 ? "text-red-600" : "";
            return (
                <div className={cn("text-right font-medium", color)}>{formatted}</div>
            );
        },
    },
    {
        accessorKey: "message",
        header: "Message",
        cell: MessageCell,
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    {column.getIsSorted() === "asc" ? (
                        <IconArrowUp className="ml-2 h-4 w-4" />
                    ) : (
                        <IconArrowDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("date"));
            return <div>{date.toDateString()}</div>;
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: CategoryCell,
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: TagsCell,
    }
];
