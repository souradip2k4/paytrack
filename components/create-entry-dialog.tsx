"use client";

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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { entriesMutationFn } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { entryAtom } from "@/store/atoms";
import { useUser } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";
import { IconCalendarPlus, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import React, { useLayoutEffect, useRef } from "react";
import { Control, FieldValues, useController, useForm } from "react-hook-form";
import { useRecoilState, useRecoilValue } from "recoil";

export function DatePicker({
    index,
    control,
}: {
    index: number;
    control: Control;
}) {
    const entries = useRecoilValue(entryAtom);
    const uuid = entries[index];
    const { field: dateField } = useController({
        name: uuid.concat(".date"),
        control,
        defaultValue: new Date(),
    });
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[224px] justify-start text-left font-normal",
                        !dateField.value && "text-muted-foreground",
                    )}
                >
                    <IconCalendarPlus className="mr-2 h-4 w-4" />
                    {dateField.value ? (
                        format(dateField.value, "PPP")
                    ) : (
                        <span>Pick a date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                <Select
                    onValueChange={(value) =>
                        dateField.onChange(addDays(new Date(), parseInt(value)))
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="0">Today</SelectItem>
                        <SelectItem value="-1">Yesterday</SelectItem>
                        <SelectItem value="1">Tommorrow</SelectItem>
                    </SelectContent>
                </Select>
                <div className="rounded-md border">
                    <Calendar
                        mode="single"
                        selected={dateField.value}
                        onSelect={dateField.onChange}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

function Entry({ index, control }: { index: number; control: Control }) {
    const [entries, setEntry] = useRecoilState(entryAtom);
    const removeEntry = (index: number) => {
        setEntry((entry) => entry.toSpliced(index, 1));
    };
    const uuid = entries[index];
    const { field: amountField } = useController({
        name: uuid.concat(".amount"),
        control,
        defaultValue: "",
    });
    const { field: messageField } = useController({
        name: uuid.concat(".message"),
        control,
        defaultValue: "",
    });

    return (
        <React.Fragment>
            <Input placeholder="Amount" type="number" {...amountField} />
            <DatePicker index={index} control={control} />
            <Input placeholder="Message" type="text" {...messageField} />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEntry(index)}
            >
                <IconX stroke={2} size={16} />
            </Button>
        </React.Fragment>
    );
}

export function CreateEntryDialog() {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const entryMutation = useMutation({
        mutationFn: entriesMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["entries"] });
            queryClient.refetchQueries({ queryKey: ["entries"] });
        },
    });
    const [entries, setEntry] = useRecoilState(entryAtom);
    const { control, handleSubmit } = useForm();
    const onSubmit = (e: FieldValues) => {
        let data: any[] = [];
        entries.forEach((entry) => data.push(e[entry]));

        if (!user) return;

        const entriesData: Prisma.EntryCreateManyInput[] = data.map((value) => ({
            amount: Number(value.amount),
            date: value.date,
            message: value.message,
            user_id: user.id,
        }));
        entryMutation.mutate(entriesData);
        closeBtn.current.click();
    };
    const closeBtn = useRef<HTMLButtonElement>(null!);
    useLayoutEffect(() => {
        setEntry(() => [crypto.randomUUID()]);
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Create new</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[720px]">
                <DialogHeader>
                    <DialogTitle>Create new entry</DialogTitle>
                    <DialogDescription>
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="grid grid-cols-[100px_224px_1fr_auto] gap-4 px-1">
                                <p className="text-sm font-medium leading-none">Amount</p>
                                <p className="text-sm font-medium leading-none">Date</p>
                                <p className="text-sm font-medium leading-none">Message</p>
                            </div>
                            <div className="grid grid-cols-[100px_auto_1fr_auto] gap-4">
                                {entries.map((_, index) => (
                                    <Entry key={index} index={index} control={control} />
                                ))}
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() =>
                                setEntry((value) => [...value, crypto.randomUUID()])
                            }
                        >
                            + Add More
                        </Button>
                    </div>

                    <DialogFooter>
                        <DialogClose ref={closeBtn} asChild>
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button onClick={() => handleSubmit(onSubmit)} type="submit">
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
