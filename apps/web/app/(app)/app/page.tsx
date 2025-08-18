import { DeleteButton } from "@/components/delete-button";
import { DisplayDropdown } from "@/components/display";
import { FilterDialog } from "@/components/filter";
import { FilterClear } from "@/components/filter/filter-clear";
import { FilterPills } from "@/components/filter/filter-pills";
import { EntriesTable } from "@/components/transactions-table";

export default function Page() {
	return (
		<div>
			<div>
				<div className="flex items-start justify-between border-b p-2">
					<div className="flex flex-wrap gap-2">
						<FilterDialog />
						<FilterClear />
						<FilterPills />
					</div>

					<div className="flex gap-2">
						<DeleteButton />
						<DisplayDropdown />
					</div>
				</div>
			</div>

			<div className="p-4">
				<EntriesTable />
			</div>
		</div>
	);
}
