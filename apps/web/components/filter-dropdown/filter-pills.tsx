"use client";

import { icons } from "@/lib/icons";
import { useFilterStore } from "@/lib/store";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@budgetbee/ui/core/popover";
import { X } from "lucide-react";
import React from "react";
import { Button } from "@budgetbee/ui/core/button";
import { AmountFilter } from "./amount-filter";
import { CategoryFilter } from "./category-filter";
import { FilterOperationSelect } from "./filter-operation-select";
import { StatusFilter } from "./status-filter";

export function FilterPills() {
	const stack = useFilterStore(s => s.filter_stack);
	const clear = useFilterStore(s => s.filter_clear);
	const add = useFilterStore(s => s.filter_add);
	const remove = useFilterStore(s => s.filter_remove);

	return (
		<React.Fragment>
			{stack.map(({ operation, values, field, id }, i) => (
				<div
					key={i}
					className="flex overflow-clip rounded-full [&>*]:rounded-none [&>*]:border-r">
					<Button variant="secondary" size="sm">
						{field === "amount" && (
							<>
								<icons.amount className="mr-2 size-4" /> Amount
							</>
						)}
						{field === "category" && (
							<>
								<icons.category className="mr-2 size-4" />{" "}
								Category
							</>
						)}
						{field === "status" && (
							<>
								<icons.status className="mr-2 size-4" /> Status
							</>
						)}
						{field === "transaction_date" && (
							<>
								<icons.status className="mr-2 size-4" />{" "}
								Transaction date
							</>
						)}
					</Button>
					<FilterOperationSelect idx={i} />
					{operation !== "is empty" && (
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="secondary"
									size="sm"
									className="rounded-none">
									{values.length === 1 ?
										<>{values[0].label}</>
									:	<>
											{values.length} {field}
										</>
									}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="p-1">
								{field === "category" && (
									<CategoryFilter id={id} />
								)}
								{field === "status" && <StatusFilter id={id} />}
								{field === "amount" && <AmountFilter id={id} />}
							</PopoverContent>
						</Popover>
					)}
					<Button
						variant="secondary"
						size="sm"
						className="not-last:border-r last:rounded-e"
						onClick={() => remove(i)}>
						<X />
					</Button>
				</div>
			))}
		</React.Fragment>
	);
}
