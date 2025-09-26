import { useFilterStore } from "@/lib/store";
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function AmountInput({ id }: { id: string }) {
	const stack = useFilterStore(s => s.filter_stack);
	const toggle = useFilterStore(s => s.filter_toggle);
	const [value, setValue] = React.useState(
		stack.find(x => x.id === id)?.values[0]?.value || 0,
	);

	return (
		<div className="flex items-center gap-2 p-2">
			<Input
				placeholder="Enter amount"
				className="w-full"
				value={value}
				onInput={e => {
					const v = Number(e.currentTarget.value);
					if (Number.isNaN(v)) return;
					setValue(v);
				}}
			/>
			<Button
				size="sm"
				onClick={() => {
					toggle(
						"amount",
						"gt",
						{ id: "amount", label: value.toString(), value },
						id,
					);
				}}>
				Apply
			</Button>
		</div>
	);
}
