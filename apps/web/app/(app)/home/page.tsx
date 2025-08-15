import { EntriesTable } from "@/components/entries-table";
import { TransactionBarChart } from "@/components/transaction-bar-chart";

export default function HomePage() {
	return (
		<div>
			<div className="space-y-4 p-4">
				<TransactionBarChart />
				<EntriesTable />
			</div>
		</div>
	);
}
