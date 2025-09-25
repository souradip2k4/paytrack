import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import { CheckIcon } from "lucide-react";
import { StatusBadge, StatusBadgeProps } from "../status-badge";

type OnChange = (value: string) => void;

export function StatusPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: OnChange;
}) {
	const open = useStore(s => s.popover_status_picker_open);
	const setOpen = useStore(s => s.popover_status_picker_set_open);

	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger>
				<StatusBadge
					status={(value as StatusBadgeProps["status"]) ?? "paid"}
				/>
			</PopoverTrigger>
			<PopoverContent
				className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
				align="start">
				<Command>
					<CommandInput placeholder="Search statuses..." />
					<CommandList>
						<CommandEmpty>No statuses found.</CommandEmpty>
						<CommandGroup>
							{["paid", "pending", "overdue"].map(key => (
								<CommandItem
									key={key}
									value={key}
									onSelect={e => {
										onChange(e);
										setOpen(false);
									}}>
									<StatusBadge status={key} variant="ghost" />
									{value === key && (
										<CheckIcon
											size={16}
											className="ml-auto"
										/>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
