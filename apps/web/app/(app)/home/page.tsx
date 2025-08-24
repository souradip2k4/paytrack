import { CategoriesPieChart } from "@/components/charts/categories-pie-chart";
import { StatusBarChart } from "@/components/charts/status-bar-chart";
import { TransactionBarChart } from "@/components/charts/transaction-bar-chart";

export default function HomePage() {
	return (
		<div className="space-y-4 p-4">
			<TransactionBarChart />
			<div className="grid gap-4 lg:grid-cols-2">
				<CategoriesPieChart />
				<StatusBarChart />
			</div>
		</div>
	);
}
