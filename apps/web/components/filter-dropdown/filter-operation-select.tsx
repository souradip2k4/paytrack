import {
	allowed_operations_map as availableOperations,
	FilterOperations,
	useFilterStore,
} from "@/lib/store";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@budgetbee/ui/core/select";

export function FilterOperationSelect({ idx }: { idx: number }) {
	const stack = useFilterStore(s => s.filter_stack);
	const operations = availableOperations[stack[idx].field];
	const setOperation = (value: FilterOperations, idx: number) =>
		useFilterStore.setState(s => {
			s.filter_stack[idx].operation = value;
			return { ...s, filter_stack: [...s.filter_stack] };
		});
	return (
		<Select
			value={stack[idx].operation}
			onValueChange={(v: FilterOperations) => setOperation(v, idx)}>
			<SelectTrigger size="sm">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{operations.map(o => (
					<SelectItem key={o} value={o}>
						{o === "is" &&
							(stack[idx].values.length <= 1 ?
								<>{o}</>
							:	<>is any of</>)}
						{o === "is not" &&
							(stack[idx].values.length <= 1 ?
								<>{o}</>
							:	<>is none of</>)}
						{o !== "is" && o !== "is not" && <>{o}</>}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
