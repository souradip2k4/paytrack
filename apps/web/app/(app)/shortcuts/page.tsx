import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@budgetbee/ui/core/table";

type Shortcut = {
	key: string;
	action: string;
};

const shortcuts: Shortcut[] = [
	{
		key: "h",
		action: "Navigate to home (dashboard).",
	},
	{
		key: "t",
		action: "Navigate to transactions page.",
	},
	{
		key: "s",
		action: "Navigate to subscriptions page.",
	},
	{
		key: "x",
		action: "Navigate to settings page.",
	},
	{
		key: "a",
		action: "Navigate to accounts page.",
	},
];

export default function ShortcutPage() {
	return (
		<div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 p-4 py-8">
			<div>
				<h3>Shortcuts</h3>
			</div>

			<div className="bg-background overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="h-9 border-r py-2">
								Key
							</TableHead>
							<TableHead className="h-9 py-2">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{shortcuts.map((s, i) => (
							<TableRow key={i}>
								<TableCell className="border-r py-2 font-medium">
									{s.key}
								</TableCell>
								<TableCell className="py-2">
									{s.action}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
