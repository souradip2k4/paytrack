"use client";

import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/money-utils";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@/lib/utils";
import { CellContext, ColumnDefTemplate } from "@tanstack/react-table";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

export const AmountCell: ColumnDefTemplate<CellContext<any, unknown>> = ({
	row,
}) => {
	const rowId = row.id;

	const initialAmount = parseFloat(row.getValue("amount"));
	const formattedInitialAmount = formatMoney(
		initialAmount,
		row.original.currency,
	);
	const amountColor =
		initialAmount > 0 ? "text-emerald-500"
		: initialAmount < 0 ? "text-red-500"
		: "";

	const isEditing = useEditorStore(s => s.is_editing);

	const { control } = useFormContext();
	const {
		field: { onChange, ...rest },
	} = useController({
		name: `tb[${rowId}].amount`,
		control,
		defaultValue: initialAmount,
	});

	// due to some reason the react-hook-form's dirty state is not working
	// TODO: figure out why?
	const isDirty = isEditing && rest.value !== initialAmount;

	const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = e => {
		// TODO: can't enter a decimal point, fix this.
		const value = Number(e.currentTarget.value.replace(/[^\d.-]/g, ""));
		if (Number.isNaN(value)) return;
		onChange(+value);
	};

	return (
		<div
			className={cn(
				"font-medium",
				{ [amountColor]: !isEditing },
				{ "bg-amber-500/20": isEditing && isDirty },
			)}>
			{isEditing ?
				<Input
					placeholder="Enter amount"
					className="rounded-none border-none !bg-transparent"
					onChange={onChangeHandler}
					{...rest}
				/>
			:	<p className="whitespace-nowrap">{formattedInitialAmount}</p>}
		</div>
	);
};
