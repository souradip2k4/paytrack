import { DeleteButton } from "@/components/delete-button";
import { DisplayDropdown } from "@/components/transaction-display-dropdown";
import {
    FilterClear,
    FilterDialog,
    FilterPills,
} from "@/components/transaction-filter-dropdown";
import { TransactionsTable } from "@/components/transactions-table";

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
                <TransactionsTable />
            </div>
        </div>
    );
}
