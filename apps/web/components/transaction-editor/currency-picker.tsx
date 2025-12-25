import { useLocalStorage } from "@/hooks/use-localstorage";
import currenciesJson from "@/lib/currencies.json";
import { useStore } from "@/lib/store";
import { cn } from "@budgetbee/ui/lib/utils";
import { Badge } from "@budgetbee/ui/core/badge";
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
import React from "react";

type OnChange = (value: string) => void;
type Currency = keyof typeof currenciesJson.data;

type CurrencyPickerProps = React.ComponentProps<
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

export function CurrencyPicker(props: CurrencyPickerProps) {
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

	const currencyKeys = React.useMemo(() => currenciesJson.keys, []);
	const [_, setLastCurrency] = useLocalStorage("last_used_currency", value);

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
				:	<Badge
						variant="outline"
						className="select-none gap-1.5 rounded-full">
						{value ?? "Currency"}
					</Badge>
				}
			</PopoverTrigger>
			<PopoverContent
				className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
				align="start">
				<Command>
					<CommandInput placeholder="Search currencies..." />
					<CommandList>
						<CommandEmpty>No currencies found.</CommandEmpty>
						<CommandGroup>
							{currencyKeys.map(key => (
								<CommandItem
									key={key}
									value={key}
									keywords={[
										currenciesJson.data[key as Currency]
											.name,
									]}
									onSelect={e => {
										onValueChange(e);
										setLastCurrency(e);
										useStore.setState({
											popover_currency_picker_open: false,
										});
									}}>
									{currenciesJson.data[key as Currency].name}
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
