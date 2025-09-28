import { DeleteButton } from "@/components/delete-button";
import { DisplayDropdown } from "@/components/transaction-display-dropdown";
import {
	FilterClear,
	FilterDialog,
	FilterPills,
} from "@/components/transaction-filter-dropdown";
import { TransactionsTable } from "@/components/transactions-table";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { BadgeInfo, SquarePen } from "lucide-react";

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

						<Tooltip delayDuration={750}>
							<TooltipTrigger asChild>
								<Button
									size="sm"
									className="border"
									variant="secondary">
									<SquarePen /> Edit
								</Button>
							</TooltipTrigger>
							<TooltipContent className="bg-accent border p-2 shadow-xl">
								<div className="flex items-center justify-center gap-2">
									<BadgeInfo className="text-muted-foreground size-4" />
									<p>Edit transactions.</p>
								</div>
							</TooltipContent>
						</Tooltip>
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
