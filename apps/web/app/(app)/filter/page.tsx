"use client";

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

export default function FilterPage() {
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

			<div className="p-4">
				<TransactionBarChart />
			</div>
		</div>
	);
}
