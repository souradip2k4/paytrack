import { CategoriesPieChart } from "@/components/charts/categories-pie-chart";
import { StatusLineChart } from "@/components/charts/status-line-chart";
import { TransactionBarChart } from "@/components/transaction-bar-chart";

export default function HomePage() {
	return (
		<div className="space-y-4 p-4">
			<TransactionBarChart />
			<div className="grid gap-4 lg:grid-cols-2">
				<CategoriesPieChart />
				<StatusLineChart />
			</div>
		</div>
	);
}
