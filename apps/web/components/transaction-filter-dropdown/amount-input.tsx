import { useFilterStore } from "@/lib/store";
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function AmountInput({ id }: { id: string }) {
	const stack = useFilterStore(s => s.filter_stack);
	const toggle = useFilterStore(s => s.filter_toggle);
	const [value, setValue] = React.useState(
		stack.find(x => x.id === id)?.values[0].label,
	);

	React.useEffect(() => {
		console.log(stack);
	}, [stack]);

	return (
		<div className="flex gap-2 p-2">
			<Input
				placeholder="Enter amount"
				className="w-full"
				value={value}
				onInput={e => setValue(e.currentTarget.value)}
			/>
			<Button
				size="sm"
				onClick={() =>
					toggle(
						"amount",
						"greater than",
						{ id: "amount", label: value || "0" },
						id,
					)
				}>
				Apply
			</Button>
		</div>
	);
}
