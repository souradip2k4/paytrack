"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Trash2 } from "lucide-react";
import React from "react";
import { FieldValues, useFieldArray, useForm } from "react-hook-form";
import { DatePicker } from "./date-picker";
import { CategorySelect, TagsMultiSelect } from "./select";
import { format } from "date-fns";

interface FormValue {
    amount: number;
    message: string;
    date: Date;
    category_id?: string;
    tag_ids?: string[];
}

interface FormValues extends FieldValues {
    fields: FormValue[];
}

export type CreateEntriesFormValues = FormValues;

export function CreateEntriesButton() {
    const [open, setOpen] = React.useState(false);
    const [enableCategoryTagsColumn, setEnableCategoryTagsColumn] =
        React.useState(true);
    const { control, register, handleSubmit, reset } = useForm<FormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "fields",
    });

    const { user } = useUser();
    const queryClient = useQueryClient();

    const createEntriesMutation = useMutation({
        mutationKey: ["entries/all", "post"],
        mutationFn: async (data: CreateEntriesFormValues) => {
            if (!user) return;
            const newfields = data.fields.map(f => {
                return {
                    user_id: user.id,
                    ...f,
                    date: format(f.date, "yyyy-MM-dd"),
                };
            });
            const res = await axios.post("/api/entries/all", newfields);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["entries", "GET"],
                exact: false,
            });
            queryClient.refetchQueries({
                queryKey: ["entries", "GET"],
                exact: false,
            });
        },
    });

    const onSubmit = (e: CreateEntriesFormValues) => {
        createEntriesMutation.mutateAsync(e).then(_ => {
            setOpen(false);
            reset();
            append({ amount: 0, date: new Date(), message: "", tag_ids: [] });
        });
    };

    React.useLayoutEffect(
        () => {
            append({
                amount: 0,
                date: new Date(),
                message: "",
                tag_ids: [],
            });
        },
        [], // eslint-disable-next-line react-hooks/exhaustive-deps
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create new</Button>
            </DialogTrigger>
            <DialogContent className="min-w-screen max-lg:h-screen lg:min-w-1/2">
                <DialogHeader>
                    <DialogTitle className="font-normal">
                        Log multiple entries
                    </DialogTitle>
                </DialogHeader>

                {/* CREATE ENTRIES FORM */}
                <div className="flex-1 overflow-y-auto py-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                        <div className="space-y-4">
                            <div className="bg-background overflow-hidden rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="text-primary h-9 w-24 border py-2">
                                                Amount
                                            </TableHead>
                                            <TableHead className="text-primary h-9 border py-2">
                                                Date
                                            </TableHead>
                                            <TableHead className="text-primary h-9 border py-2">
                                                Message
                                            </TableHead>
                                            {enableCategoryTagsColumn && (
                                                <React.Fragment>
                                                    <TableHead className="text-primary h-9 w-32 border py-2">
                                                        Category
                                                    </TableHead>

                                                    <TableHead className="text-primary h-9 w-32 border py-2">
                                                        Tags
                                                    </TableHead>
                                                </React.Fragment>
                                            )}
                                            <TableHead className="text-primary h-9 w-9 border py-2"></TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {fields.map((f, i) => (
                                            <React.Fragment key={i}>
                                                <TableRow>
                                                    <TableCell className="border p-0">
                                                        <Input
                                                            placeholder="Amount"
                                                            type="number"
                                                            key={f.id}
                                                            className="rounded-none border-none"
                                                            {...register(
                                                                `fields.${i}.amount`,
                                                                {
                                                                    valueAsNumber:
                                                                        true,
                                                                },
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="border p-0">
                                                        <DatePicker
                                                            name={`fields.${i}.date`}
                                                            control={control}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="border p-0">
                                                        <Input
                                                            placeholder="Message"
                                                            type="text"
                                                            className="rounded-none border-none"
                                                            {...register(
                                                                `fields.${i}.message`,
                                                            )}
                                                        />
                                                    </TableCell>

                                                    {enableCategoryTagsColumn && (
                                                        <React.Fragment>
                                                            <TableCell className="border p-0">
                                                                <CategorySelect
                                                                    control={
                                                                        control
                                                                    }
                                                                    name={`fields.${i}.category_id`}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="border p-0">
                                                                <TagsMultiSelect
                                                                    control={
                                                                        control
                                                                    }
                                                                    name={`fields.${i}.tag_ids`}
                                                                />
                                                            </TableCell>
                                                        </React.Fragment>
                                                    )}

                                                    <TableCell className="bg-input/30 w-9 border p-0">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                if (
                                                                    fields.length <=
                                                                    1
                                                                )
                                                                    return;
                                                                remove(i);
                                                            }}>
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() =>
                                        append({
                                            amount: 0,
                                            date: new Date(),
                                            message: "",
                                        })
                                    }>
                                    + Add More
                                </Button>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="enbl-tags"
                                        defaultChecked={
                                            enableCategoryTagsColumn
                                        }
                                        onCheckedChange={
                                            setEnableCategoryTagsColumn
                                        }
                                    />
                                    <Label htmlFor="enbl-tags">
                                        Category & Tags
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        disabled={createEntriesMutation.isPending}
                        onClick={() => {
                            handleSubmit(onSubmit)();
                        }}
                        type="submit">
                        {createEntriesMutation.isPending ?
                            "Creating..."
                            : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
