import { CurrencySelect } from "@/components/settings/currency-select";
import { ThemeRadioGroup } from "@/components/theme-radio-group";
import { Separator } from "@/components/ui/separator";

export default function Page() {
	return (
		<div className="space-y-8 lg:px-32">
			<h3 className="mt-0">Settings</h3>

			<Separator className="col-span-2 mt-4" />
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<h3>Themes</h3>
				<ThemeRadioGroup />
				<Separator className="col-span-2 my-4" />

				{/*<h3>Date & time</h3>
                <div>
                    <div className="space-y-3">
                        <Label>Default formatting for dates.</Label>
                        <Select>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Date Formatting" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    DD/MM/YYYY
                                </SelectItem>
                                <SelectItem value="dark">
                                    MM/DD/YYYY
                                </SelectItem>
                                <SelectItem value="system">
                                    YYYY-MM-DD
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>*/}

				<h3>Currencies</h3>
				<div>
					<CurrencySelect />
				</div>
			</div>
		</div>
	);
}
