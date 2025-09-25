import { Badge } from "@/components/ui/badge";
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
import { useLocalStorage } from "@/hooks/use-localstorage";
import currenciesJson from "@/lib/currencies.json";
import { useStore } from "@/lib/store";
import { CheckIcon } from "lucide-react";
import React from "react";

type OnChange = (value: string) => void;
type Currency = keyof typeof currenciesJson.data;

export function CurrencyPicker({
	value,
	onChange,
	trigger,
}: {
	value: string;
	onChange: OnChange;
	trigger?: (name: string, value: string) => React.JSX.Element;
}) {
	const currencyKeys = React.useMemo(() => currenciesJson.keys, []);
	const open = useStore(s => s.popover_currency_picker_open);
	const setOpen = useStore(s => s.popover_currency_picker_set_open);
	const [_, setLastCurrency] = useLocalStorage("last_used_currency", value);
	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger>
				<Badge variant="outline" className="gap-1.5 rounded-full">
					{value || "Currency"}
				</Badge>
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
										onChange(e);
										setLastCurrency(e);
										setOpen(false);
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
