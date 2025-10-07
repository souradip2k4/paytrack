import { useFilterStore } from "@/lib/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod/mini";
import { Input } from "../ui/input";

const amountSchema = z.object({
	amount: z.optional(z.number()),
});

export function AmountFilter({ id }: { id: string }) {
	const stack = useFilterStore(s => s.filter_stack);
	const stackItemIndex = stack.findIndex(s => s.id === id);

	const { register, handleSubmit } = useForm({
		resolver: zodResolver(amountSchema),
		defaultValues: {
			amount: stack[stackItemIndex]?.values[0]?.value || 0,
		},
	});

	const onSubmit = (e: FieldValues) => {
		useFilterStore.setState(s => {
			if (stackItemIndex === -1) {
				s.filter_stack.push({
					id: id,
					operation: "eq",
					field: "amount",
					values: [
						{
							id: nanoid(4),
							label: e.amount.toString(),
							value: e.amount,
						},
					],
				});
			} else {
				s.filter_stack[stackItemIndex].values[0].value = e.amount;
				s.filter_stack[stackItemIndex].values[0].label =
					e.amount.toString();
			}

			return { filter_stack: structuredClone(s.filter_stack) };
		});
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
