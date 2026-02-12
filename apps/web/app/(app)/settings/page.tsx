import { DateFormatPicker } from "@/components/settings/date-format-picker";
import { ExportTransactions } from "@/components/settings/export-transactions";
import { ThemeRadioGroup } from "@/components/theme-radio-group";
import { Label } from "@budgetbee/ui/core/label";
import { Separator } from "@budgetbee/ui/core/separator";

export default function Page() {
	return (
		<div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 p-4 py-8 md:grid-cols-[1fr_2fr]">
			<div>
				<h3>Themes</h3>
				<p className="text-muted-foreground">
					Select your preferred theme.
				</p>
			</div>
			<ThemeRadioGroup />
			<Separator className="col-span-2 my-4" />

			<div>
				<h3>Date and time</h3>
			</div>
			<DateFormatPicker />
			<Separator className="col-span-2 my-4" />

			<div>
				<h3>Import &amp; export</h3>
			</div>
			<div className="space-y-8">
				<div className="flex items-center gap-1">
					<Label className="grow flex-col items-start gap-1">
						<p>Export transactions</p>
						<p className="text-muted-foreground">
							Export your transactions in CSV, Excel, or JSON
							format.
						</p>
					</Label>
					<ExportTransactions />
				</div>
			</div>
			<Separator className="col-span-2 my-4" />
		</div>
	);
}
