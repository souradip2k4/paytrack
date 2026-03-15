"use client";

import { CategoryBadge } from "@/components/category-badge";
import { CategoryPicker } from "@/components/category-picker";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney } from "@/lib/money-utils";
import { useCategories, useTransactionMutation } from "@/lib/query";
import { useLocalSettingsStore } from "@/lib/store";
import { avatarUrl } from "@/lib/utils";
import { authClient } from "@budgetbee/core/auth-client";
import { Badge } from "@budgetbee/ui/core/badge";
import { Input } from "@budgetbee/ui/core/input";
import { Skeleton } from "@budgetbee/ui/core/skeleton";
import { cn } from "@budgetbee/ui/lib/utils";
import { CellContext, ColumnDefTemplate } from "@tanstack/react-table";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import React from "react";
import { DatePicker } from "../date-picker";
import { StatusPicker } from "../transaction-editor/status-picker";

// --- Shared inline-edit hook for text/number inputs ---

function useInlineEdit<T>(
	recordId: string,
	field: string,
	initialValue: T,
	transform?: (raw: string) => T,
) {
	const [editing, setEditing] = React.useState(false);
	const { mutate } = useTransactionMutation();
	const inputRef = React.useRef<HTMLInputElement>(null);

	const save = React.useCallback(
		(newValue: T) => {
			setEditing(false);
			if (newValue === initialValue) return;
			mutate({
				type: "update",
				payload: { id: recordId, patch: { [field]: newValue } },
			});
		},
		[recordId, field, initialValue, mutate],
	);

	const startEditing = React.useCallback(() => {
		setEditing(true);
		requestAnimationFrame(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		});
	}, []);

	const onKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				e.preventDefault();
				const raw = (e.target as HTMLInputElement).value;
				save(transform ? transform(raw) : (raw as unknown as T));
			}
			if (e.key === "Escape") {
				setEditing(false);
			}
		},
		[save, transform],
	);

	const onBlur = React.useCallback(
		(e: React.FocusEvent<HTMLInputElement>) => {
			const raw = e.target.value;
			save(transform ? transform(raw) : (raw as unknown as T));
		},
		[save, transform],
	);

	return { editing, save, startEditing, setEditing, onKeyDown, onBlur, inputRef };
}

// --- Amount Cell ---

export const EditableAmountCell: ColumnDefTemplate<
	CellContext<any, unknown>
> = ({ row }) => {
	const amount = parseFloat(row.getValue("amount"));
	const currency = row.original.currency;
	const formattedAmount = formatMoney(amount, currency);
	const amountColor =
		amount > 0 ? "text-emerald-500" : "text-muted-foreground";

	const { editing, startEditing, onKeyDown, onBlur, inputRef } =
		useInlineEdit(row.original.id, "amount", amount, raw =>
			parseFloat(raw),
		);

	if (editing) {
		return (
			<Input
				ref={inputRef}
				type="number"
				step="0.01"
				defaultValue={amount}
				onKeyDown={onKeyDown}
				onBlur={onBlur}
				className="h-full w-full rounded-none border-none shadow-none focus-visible:ring-1 focus-visible:ring-inset"
			/>
		);
	}

	return (
		<div
			className={cn(
				"font-medium cursor-text flex h-full w-full items-center",
				amountColor,
			)}
			onClick={startEditing}>
			<p className="whitespace-nowrap">{formattedAmount}</p>
		</div>
	);
};

// --- Title Cell ---

export const EditableTitleCell: ColumnDefTemplate<
	CellContext<any, unknown>
> = ({ row, column }) => {
	const defaultName: string = row.getValue(column.id) ?? "";

	const { editing, startEditing, onKeyDown, onBlur, inputRef } =
		useInlineEdit(row.original.id, "name", defaultName);

	if (editing) {
		return (
			<Input
				ref={inputRef}
				type="text"
				defaultValue={defaultName}
				onKeyDown={onKeyDown}
				onBlur={onBlur}
				className="h-full w-full rounded-none border-none shadow-none focus-visible:ring-1 focus-visible:ring-inset"
			/>
		);
	}

	return (
		<div
			className="flex h-full w-full cursor-text items-center"
			onClick={startEditing}>
			<p
				className={cn("overflow-hidden text-ellipsis", {
					"text-muted-foreground italic": !defaultName,
				})}>
				{defaultName || "no title"}
			</p>
		</div>
	);
};

// --- Status Cell (popover picker, saves on select) ---

export const EditableStatusCell: ColumnDefTemplate<
	CellContext<any, unknown>
> = ({ row }) => {
	const status = row.getValue<string>("status");
	const { mutate } = useTransactionMutation();

	const handleChange = React.useCallback(
		(newStatus: string) => {
			if (newStatus === status) return;
			mutate({
				type: "update",
				payload: { id: row.original.id, patch: { status: newStatus } },
			});
		},
		[row.original.id, status, mutate],
	);

	return (
		<StatusPicker value={status} onValueChange={handleChange}>
			<span className="flex h-full w-full cursor-pointer items-center">
				<StatusBadge status={status} variant="ghost" />
			</span>
		</StatusPicker>
	);
};

// --- Category Cell (popover picker, saves on select) ---

export const EditableCategoryCell: ColumnDefTemplate<
	CellContext<any, unknown>
> = ({ row }) => {
	const categoryId = row.original.category_id;
	const { data: categories, isLoading } = useCategories();
	const { mutate } = useTransactionMutation();

	const category = categories?.find(x => x.id === categoryId);

	const handleChange = React.useCallback(
		(newCategoryId?: string) => {
			if (newCategoryId === categoryId) return;
			mutate({
				type: "update",
				payload: {
					id: row.original.id,
					patch: { category_id: newCategoryId ?? null },
				},
			});
		},
		[row.original.id, categoryId, mutate],
	);

	if (isLoading) return <Skeleton className="h-4 w-16" />;

	return (
		<CategoryPicker value={categoryId} onValueChange={handleChange}>
			<span className="flex h-full w-full cursor-pointer items-center">
				{category ?
					<CategoryBadge
						category={category.name}
						color={category.color}
					/>
				:	<span className="text-muted-foreground text-xs italic">
						none
					</span>
				}
			</span>
		</CategoryPicker>
	);
};

// --- Date formatting helper ---

const formatDate = (date: Date, fmt: string, relativeDates: boolean) => {
	if (relativeDates && Math.abs(differenceInDays(date, new Date())) <= 7) {
		return formatDistanceToNow(date, { addSuffix: true });
	}
	return format(date, fmt);
};

// --- Transaction Date Cell (editable via date picker) ---

export const EditableTransactionDateCell: ColumnDefTemplate<
	CellContext<any, unknown>
> = ({ row, column }) => {
	const rawDate = row.getValue(column.id) as string;
	const dateFormat = useLocalSettingsStore(s => s.settings_date_format);
	const relativeDates = useLocalSettingsStore(
		s => s.settings_relative_dates,
	);
	const { mutate } = useTransactionMutation();

	const handleChange = React.useCallback(
		(newDate: Date) => {
			mutate({
				type: "update",
				payload: {
					id: row.original.id,
					patch: { transaction_date: newDate.toISOString() },
				},
			});
		},
		[row.original.id, mutate],
	);

	return (
		<DatePicker date={new Date(rawDate)} onDateChange={handleChange}>
			<span className="flex h-full w-full cursor-pointer items-center">
				<p className="text-muted-foreground">
					{formatDate(new Date(rawDate), dateFormat, relativeDates)}
				</p>
			</span>
		</DatePicker>
	);
};

// --- Created At / Updated At (read-only date cells) ---

export const ReadonlyDateCell: ColumnDefTemplate<
	CellContext<any, unknown>
> = ({ row, column }) => {
	const date = row.getValue(column.id) as string;
	const dateFormat = useLocalSettingsStore(s => s.settings_date_format);
	const relativeDates = useLocalSettingsStore(
		s => s.settings_relative_dates,
	);
	return (
		<p className="text-muted-foreground">
			{formatDate(new Date(date), dateFormat, relativeDates)}
		</p>
	);
};

// --- Creator Cell (read-only) ---

export const ReadonlyCreatorCell: ColumnDefTemplate<
	CellContext<any, unknown>
> = () => {
	const { data, isPending } = authClient.useSession();

	if (isPending) return <Skeleton className="h-4 w-16" />;

	return (
		<Badge variant="secondary" className="rounded-full">
			<img
				className="h-4 w-4 rounded-full"
				src={avatarUrl(data?.user.image)}
			/>{" "}
			{data?.user.name} (you)
		</Badge>
	);
};
