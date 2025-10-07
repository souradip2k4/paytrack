"use client";

import { useLocalSettingsStore } from "@/lib/store";
import { useEditorStore } from "@/lib/store/editor-store";
import { CellContext, ColumnDefTemplate } from "@tanstack/react-table";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useController } from "react-hook-form";
import { DatePicker } from "../date-picker";

const formatDate = (date: Date, fmt: string, relativeDates: boolean) => {
    if (relativeDates && Math.abs(differenceInDays(date, new Date())) <= 7) {
        return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, fmt);
};

export const DateCell: ColumnDefTemplate<CellContext<any, unknown>> = ({
    row,
    column,
}) => {
    const date = row.getValue(column.id) as string;
    const dateFormat = useLocalSettingsStore(s => s.settings_date_format);
    const relativeDates = useLocalSettingsStore(s => s.settings_relative_dates);
    return (
        <div data-editor="disabled">
            <p className="text-muted-foreground">
                {formatDate(new Date(date), dateFormat, relativeDates)}
            </p>
        </div>
    );
};

export const TransactionDateCell: ColumnDefTemplate<
    CellContext<any, unknown>
> = ({ row, column }) => {
    const defaultDate = new Date(row.getValue(column.id));
    const dateFormat = useLocalSettingsStore(s => s.settings_date_format);
    const relativeDates = useLocalSettingsStore(s => s.settings_relative_dates);

    const isEditing = useEditorStore(s => s.is_editing);

    const { field } = useController({
        name: `tr.${row.id}.transaction_date`,
        defaultValue: defaultDate,
    });

    if (!isEditing) {
        return (
            <div data-editor="disabled">
                <p className="text-muted-foreground">
                    {formatDate(defaultDate, dateFormat, relativeDates)}
                </p>
            </div>
        );
    }

    return (
        <DatePicker date={field.value} onDateChange={field.onChange}>
            <span
                className="flex h-[48px] items-center justify-between p-2"
                style={{ width: column.getSize() }}>
                <p>{format(field.value, dateFormat)}</p>
                <ChevronDown className="size-4" />
            </span>
        </DatePicker>
    );
};
