import { EntriesTable } from "@/components/entries-table";
import { TransactionBarChart } from "@/components/transaction-bar-chart";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <div>
            <div className="p-4 space-y-4">
                <TransactionBarChart />
                <EntriesTable />
            </div>
        </div>

    )
}
