"use client";

import { StatusBadge } from "@/components/status-badge";
import { formatMoney } from "@/lib/money-utils";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@/lib/utils";
import { Checkbox } from "@budgetbee/ui/core/checkbox";
import { Input } from "@budgetbee/ui/core/input";
import {
	CellContext,
	ColumnDef,
	ColumnDefTemplate,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { useController } from "react-hook-form";
import { StatusPicker } from "../transaction-editor/status-picker";
import { CategoryCell } from "./category-cell";
import { CreatorCell } from "./creator-cell";
import { DateCell, TransactionDateCell } from "./date-cell";

export const AmountCell: ColumnDefTemplate<CellContext<any, unknown>> = ({
	row,
	column,
}) => {
	const defaultAmount = parseFloat(row.getValue("amount"));
	const formattedAmount = formatMoney(defaultAmount, row.original.currency);
	const amountColor =
		defaultAmount > 0 ? "text-emerald-500"
		: defaultAmount < 0 ? "text-red-500"
		: "";
	const isEditing = useEditorStore(s => s.is_editing);

	const {
		field: { onChange, ...field },
	} = useController({
		name: `tr.${row.id}.amount`,
		defaultValue: defaultAmount,
	});

	const editorState = field.value !== defaultAmount ? "stale" : "clean";

	if (!isEditing) {
		return (
			<div className={cn("font-medium", amountColor)}>
				<p className="whitespace-nowrap">{formattedAmount}</p>
			</div>
		);
	}

	return (
		<Input
			{...field}
			onInput={onChange}
			data-editor={editorState}
			placeholder="Amount"
			className="h-[48px] rounded-none border-none"
			style={{ width: column.getSize() }}
		/>
	);
};

export const TitleCell: ColumnDefTemplate<CellContext<any, unknown>> = ({
	row,
	column,
}) => {
	const isEditing = useEditorStore(s => s.is_editing);
	const defaultName: string = row.getValue(column.id);
	const {
		field: { onChange, ...field },
	} = useController({
		name: `tr.${row.id}.name`,
		defaultValue: defaultName,
	});

	const editorState = field.value !== defaultName ? "stale" : "clean";

	if (!isEditing) {
		return (
			<p
				className={cn("overflow-hidden text-ellipsis", {
					"text-muted-foreground italic": !defaultName,
				})}>
				{defaultName || "no title"}
			</p>
		);
	}

	return (
		<Input
			data-editor={editorState}
			placeholder="Title"
			style={{ width: column.getSize() }}
			className="h-[48px] rounded-none border-none"
			onInput={onChange}
			{...field}
		/>
	);
};

export const StatusCell: ColumnDefTemplate<CellContext<any, unknown>> = ({
	row,
	column,
}) => {
	const defaultStatus = row.getValue<string>("status");

	const {
		field: { onChange, ...field },
	} = useController({
		name: `tr.${row.id}.status`,
		defaultValue: defaultStatus,
	});

	const isEditing = useEditorStore(s => s.is_editing);
	const editorState = field.value !== defaultStatus ? "stale" : "clean";

	if (!isEditing) return <StatusBadge status={defaultStatus} />;
	return (
		<StatusPicker
			{...field}
			data-editor={editorState}
			onValueChange={onChange}
			asChild>
			<span
				className="flex h-[48px] items-center justify-between p-2"
				style={{ width: column.getSize() }}>
				<StatusBadge variant="ghost" status={field.value} />
				<ChevronDown className="size-4" />
			</span>
		</StatusPicker>
	);
};

export const columns: ColumnDef<any>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={value =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={value => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		size: 48,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: AmountCell,
		size: 120,
		enableHiding: false,
	},
	{
		accessorKey: "name",
		header: "Title",
		cell: TitleCell,
		size: 480,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: StatusCell,
		size: 120,
	},
	{
		accessorKey: "category_id",
		header: "Category",
		cell: CategoryCell,
		size: 160,
	},
	{
		accessorKey: "transaction_date",
		header: "Transaction date",
		cell: TransactionDateCell,
		sortingFn: "datetime",
		size: 180,
	},
	{
		accessorKey: "created_at",
		header: "Created",
		cell: DateCell,
		sortingFn: "datetime",
		size: 150,
	},
	{
		accessorKey: "updated_at",
		header: "Last updated",
		cell: DateCell,
		sortingFn: "datetime",
		size: 150,
	},

	{
		accessorKey: "user_id",
		header: "Creator",
		cell: CreatorCell,
		sortingFn: "datetime",
		size: 150,
	},

	/*
    {
        accessorKey: "tags",
        header: "Tags",
        cell: TagsCell,
    },
    */
];
