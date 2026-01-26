"use client";

import { DeleteButton } from "@/components/delete-button";
import {
	FilterClear,
	FilterDialog,
	FilterPills,
} from "@/components/filter-dropdown";
import { DisplayDropdown } from "@/components/transaction-display-dropdown";
import { TransactionsTable } from "@/components/transactions-table";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "@budgetbee/ui/core/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@budgetbee/ui/core/tooltip";
import { BadgeInfo, Check, SquarePen, X } from "lucide-react";
import React from "react";

export default function Page() {
	const isEditing = useEditorStore(s => s.is_editing);
	const transactionTableRef = React.useRef<HTMLFormElement>(null!);

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

						{isEditing ?
							<React.Fragment>
								<Button
									size="sm"
									className="border"
									variant="secondary"
									onClick={e => {
										transactionTableRef.current.requestSubmit();
									}}>
									<Check /> Save
								</Button>

								<Button
									size="sm"
									className="border"
									variant="secondary"
									onClick={() => {
										useEditorStore.setState({
											is_editing: false,
										});
										transactionTableRef.current.dispatchEvent(
											new Event("reset", {
												bubbles: true,
												cancelable: true,
											}),
										);
									}}>
									<X /> Cancel
								</Button>
							</React.Fragment>
							: <Tooltip delayDuration={750}>
								<TooltipTrigger asChild>
									<Button
										size="sm"
										className="border"
										variant="secondary"
										onClick={() =>
											useEditorStore.setState({
												is_editing: true,
											})
										}>
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
						}

						<DisplayDropdown />
					</div>
				</div>
			</div>

			<div className="p-4 space-y-4">
				<TransactionsTable ref={transactionTableRef} />
			</div>
		</div>
	);
}
