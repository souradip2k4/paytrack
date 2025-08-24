"use client";

import { Input } from "@/components/ui/input";
import React from "react";

export const EditableCell = ({ getValue, row, column, table }) => {
	const initialValue = getValue();
	const [value, setValue] = React.useState(initialValue);

	const onBlur = () => {
		table.options.meta?.updateData(row.index, column.id, value);
	};

	React.useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	return (
		<Input
			value={value as string}
			onChange={e => setValue(e.target.value)}
			onBlur={onBlur}
			className="border-none"
		/>
	);
};
