import { useFilterStore } from "@/lib/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import React from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod/mini";
import { Input } from "../ui/input";

const amountSchema = z.object({
    amount: z.optional(z.number()),
});

export function AmountFilter({ id }: { id: string }) {
    const stack = useFilterStore(s => s.filter_stack);
    const stackItemIndex = stack.findIndex(x => x.id === id);

    const { register, reset, handleSubmit } = useForm({
        resolver: zodResolver(amountSchema),
        defaultValues: {
            amount: stack[stackItemIndex]?.values[0]?.value || 0,
        },
    });

    const onSubmit = (e: FieldValues) => {
        const amount = e.amount ?? 0;

        if (stackItemIndex < 0) {
            useFilterStore.setState(s => {
                s.filter_stack.push({
                    id,
                    operation: "eq",
                    field: "amount",
                    values: [
                        {
                            id: nanoid(8),
                            value: amount,
                            label: amount.toString(),
                        },
                    ],
                });
                return { filter_stack: { ...s.filter_stack } };
            });
            return;
        }

        useFilterStore.setState(s => {
            s.filter_stack[stackItemIndex].values[0].value = amount;
            return { filer_stack: { ...s.filter_stack } };
        });

        reset();
    };

    return (
        <form
            className="flex items-center gap-2 p-2"
            onSubmit={handleSubmit(onSubmit)}>
            <Input
                placeholder="Equals to amount"
                className="w-full"
                {...register("amount", { required: true, valueAsNumber: true })}
            />
        </form>
    );
}
