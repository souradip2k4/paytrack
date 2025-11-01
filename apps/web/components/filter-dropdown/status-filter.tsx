import { StatusBadge } from "@/components/status-badge";
import { useFilterStore } from "@/lib/store";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@budgetbee/ui/core/command";
import { Checkbox } from "../ui/checkbox";

export function StatusFilter({ id }: { id: string }) {
	const stack = useFilterStore(s => s.filter_stack);
	const toggle = useFilterStore(s => s.filter_toggle);

	return (
		<Command>
			<CommandInput placeholder="Search..." />
			<CommandList>
				<CommandEmpty>No matching options.</CommandEmpty>

				<CommandGroup>
					{["paid", "pending", "overdue"].map((s, i) => {
						const idx = stack.findIndex(x => x.id === id);
						const checked =
							idx >= 0 ?
								stack[idx].values.findIndex(x => x.id === s) >=
								0
							:	false;
						return (
							<CommandItem
								key={i}
								value={s}
								keywords={[s]}
								onSelect={() =>
									toggle(
										"status",
										"is",
										{ id: s, label: s, value: s },
										id,
									)
								}>
								<Checkbox aria-disabled checked={checked} />
								<StatusBadge status={s} variant="ghost" />
							</CommandItem>
						);
					})}
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
