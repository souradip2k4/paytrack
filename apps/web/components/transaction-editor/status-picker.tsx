import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { cn } from "@budgetbee/ui/lib/utils";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@budgetbee/ui/core/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@budgetbee/ui/core/popover";
import { CheckIcon } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";

type OnChange = (value: string) => void;
type StatusPickerProps = React.ComponentProps<
	typeof PopoverPrimitive.Trigger
> & {
	modal?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultOpen?: boolean;
	value: string;
	onValueChange: OnChange;
	children?: React.ReactNode;
};

export function StatusPicker(props: StatusPickerProps) {
	const {
		modal = false,
		open,
		onOpenChange,
		defaultOpen,
		asChild = false,
		children,
		value,
		onValueChange,
		className,
		...rest
	} = props;

	return (
		<Popover
			modal={modal}
			open={open}
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}>
			<PopoverTrigger
				{...rest}
				className={cn(
					"flex items-center justify-center [&>*]:h-full",
					className,
				)}>
				{children ?
					children
				:	<StatusBadge status={value} variant="ghost" />}
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
										onValueChange(e);
										useStore.setState({
											popover_status_picker_open: false,
										});
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
