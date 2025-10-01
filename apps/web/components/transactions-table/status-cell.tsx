"use client";

import { StatusBadge } from "@/components/status-badge";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@/lib/utils";
import { CellContext, ColumnDefTemplate } from "@tanstack/react-table";
import { useController, useFormContext } from "react-hook-form";
import { StatusPicker } from "../transaction-editor/status-picker";

export const StatusCell: ColumnDefTemplate<CellContext<any, unknown>> = ({
	row,
}) => {
	const rowId = row.id;
	const isEditing = useEditorStore(s => s.is_editing);
	const initialStatus: string = row.getValue("status");

	const { control } = useFormContext();

	const {
		field: { onChange, ...rest },
	} = useController({
		name: `tb[${rowId}].status`,
		control,
		defaultValue: initialStatus,
	});

	const isDirty = isEditing && rest.value !== initialStatus;

	return (
		<div
			className={cn(
				"flex h-10 items-center justify-start p-2 font-medium",
				{ "bg-amber-500/20": isEditing && isDirty },
			)}>
			{isEditing ?
				<StatusPicker
					modal={false}
					value={rest.value}
					onValueChange={onChange}
				/>
			:	<StatusBadge status={initialStatus} />}
		</div>
	);
};
