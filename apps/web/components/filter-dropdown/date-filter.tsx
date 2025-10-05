"use client";

import { useFilterStore } from "@/lib/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod/mini";
import { Input } from "../ui/input";
import React from "react";
import { DatePicker } from "../date-picker";
import { defaultHead } from "next/head";

const amountSchema = z.object({
    amount: z.optional(z.number()),
});

export function DateFilter({ id }: { id: string }) {
    const stack = useFilterStore(s => s.filter_stack);
    const stackItemIndex = stack.findIndex(s => s.id === id);
    const defaultDate = stack[stackItemIndex]?.values[0]?.value || new Date();

    const onSubmit = (e: FieldValues) => {
        useFilterStore.setState(s => {
            if (stackItemIndex === -1) {
                s.filter_stack.push({
                    id: id,
                    operation: "eq",
                    field: "transaction_date",
                    values: [{
                        id: nanoid(4),
                        label: e.amount.toString(),
                        value: e.amount,
                    }],
                });
            }
            else {
                s.filter_stack[stackItemIndex].values[0].value = e.amount;
                s.filter_stack[stackItemIndex].values[0].label = e.amount.toString();
            }

            return { filter_stack: structuredClone(s.filter_stack) };
        })
    };

    return (
        <DatePicker date={defaultDate} onDateChange={onSubmit} />
    );
}
