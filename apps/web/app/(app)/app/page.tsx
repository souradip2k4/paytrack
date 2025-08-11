import { EntriesTable } from "@/components/entries-table";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export default function Page() {
	return (
		<div>
			<div className="flex items-center justify-between border-b p-2">
				<Button variant="secondary" size="sm">
					<SlidersHorizontal />
					Filter
				</Button>
				<Button variant="secondary" size="sm">
					<SlidersHorizontal />
					Display
				</Button>
			</div>
			<div className="p-4">
				<EntriesTable />
			</div>
		</div>
	);
}
