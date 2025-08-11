"use client";

import { CheckIcon, MinusIcon } from "lucide-react";
import { useId } from "react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";

const items = [
	{ value: "light", label: "Light", image: "/images/ui-light.png" },
	{ value: "dark", label: "Dark", image: "/images/ui-dark.png" },
	{ value: "system", label: "System", image: "/images/ui-system.png" },
];

export function ThemeRadioGroup() {
	const id = useId();
	const { setTheme, theme } = useTheme();
	return (
		<fieldset className="space-y-4">
			<legend className="text-foreground text-sm font-medium leading-none">
				Choose a theme
			</legend>
			<RadioGroup
				className="flex gap-3"
				value={theme}
				onValueChange={e => setTheme(e)}>
				{items.map(item => (
					<label key={`${id}-${item.value}`}>
						<RadioGroupItem
							id={`${id}-${item.value}`}
							value={item.value}
							className="peer sr-only after:absolute after:inset-0"
						/>
						<img
							src={item.image}
							alt={item.label}
							width={88}
							height={70}
							className="border-input peer-focus-visible:ring-ring/50 peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent shadow-xs peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50 relative cursor-pointer overflow-hidden rounded-md border outline-none transition-[color,box-shadow] peer-focus-visible:ring-[3px]"
						/>
						<span className="peer-data-[state=unchecked]:text-muted-foreground/70 group mt-2 flex items-center gap-1">
							<CheckIcon
								size={16}
								className="group-peer-data-[state=unchecked]:hidden"
								aria-hidden="true"
							/>
							<MinusIcon
								size={16}
								className="group-peer-data-[state=checked]:hidden"
								aria-hidden="true"
							/>
							<span className="text-xs font-medium">
								{item.label}
							</span>
						</span>
					</label>
				))}
			</RadioGroup>
		</fieldset>
	);
}
