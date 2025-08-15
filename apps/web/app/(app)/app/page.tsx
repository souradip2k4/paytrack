import { EntriesTable } from "@/components/entries-table";
import { FilterDialog } from "@/components/filter";
import { FilterClear } from "@/components/filter/filter-clear";
import { FilterPills } from "@/components/filter/filter-pills";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

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
                    <Button variant="secondary" size="sm">
                        <SlidersHorizontal />
                        Display
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <EntriesTable />
            </div>
        </div>
    );
}
