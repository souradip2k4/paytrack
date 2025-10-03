import { CategoriesPieChart } from "@/components/charts/categories-pie-chart";
import { StatusBarChart } from "@/components/charts/status-bar-chart";
import { TransactionBarChart } from "@/components/charts/transaction-bar-chart";
import {
	FilterClear,
	FilterDialog,
	FilterPills,
} from "@/components/filter-dropdown";
import {
	MetricFilterPill,
	PeriodFilterDropdown,
	PeriodFilterPill,
} from "@/components/filter-dropdown/period-filter-dropdown";

export default function HomePage() {
	return (
		<div>
			<div>
				<div className="flex items-start justify-between border-b p-2">
					<div className="flex flex-wrap gap-2">
						<FilterDialog />
						<FilterClear />
						<FilterPills />
						<PeriodFilterPill />
						<MetricFilterPill />
					</div>

					<div className="flex gap-2">
						<PeriodFilterDropdown />
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
				<div className="lg:col-span-2">
					<TransactionBarChart />
				</div>
				<CategoriesPieChart />
				<StatusBarChart />
			</div>
		</div>
	);
}
