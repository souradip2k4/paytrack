import { ThemeRadioGroup } from "@/components/theme-radio-group";
import { Separator } from "@/components/ui/separator";

export default function Page() {
	return (
		<div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 p-4 py-8 md:grid-cols-2">
			<div>
				<h3>Themes</h3>
				<p className="text-muted-foreground">
					Select your preferred theme.
				</p>
			</div>
			<ThemeRadioGroup />
			<Separator className="col-span-2 my-4" />
		</div>
	);
}
