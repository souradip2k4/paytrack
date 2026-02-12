"use client";

import { icons } from "@/lib/icons";
import { FilterFields, useFilterStore } from "@/lib/store";
import { Button } from "@budgetbee/ui/core/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@budgetbee/ui/core/popover";
import { X } from "lucide-react";
import React from "react";
import { AmountFilter } from "./amount-filter";
import { CategoryFilter } from "./category-filter";
import { DateFilter } from "./date-filter";
import { FilterOperationSelect } from "./filter-operation-select";
import { StatusFilter } from "./status-filter";
import { UserFilter } from "./user-filter";

const fieldLabels: Record<FilterFields, string> = {
	amount: "Amount",
	category: "Category",
	status: "Status",
	transaction_date: "Transaction date",
	created_at: "Created date",
	updated_at: "Last updated",
	user: "User",
};

const fieldIcons: Record<FilterFields, string> = {
	amount: "amount",
	category: "category",
	status: "status",
	transaction_date: "transaction_date",
	created_at: "created_at",
	updated_at: "updated_at",
	user: "user",
};

export function FilterPills() {
	const stack = useFilterStore(s => s.filter_stack);
	const remove = useFilterStore(s => s.filter_remove);

	return (
		<React.Fragment>
			{stack.map(({ operation, values, field, id }, i) => {
				const Icon = icons[fieldIcons[field]];
				return (
					<div
						key={id}
						className="flex overflow-clip rounded-full [&>*]:rounded-none [&>*]:border-r">
						<Button variant="secondary" size="sm">
							{Icon && <Icon className="mr-2 size-4" />}
							{fieldLabels[field] ?? field}
						</Button>
						<FilterOperationSelect idx={i} />
						{operation !== "is empty" && (
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="secondary"
										size="sm"
										className="rounded-none">
										{(
											operation === "between" &&
											values.length === 2
										) ?
											<>
												{values[0].label} &mdash;{" "}
												{values[1].label}
											</>
										: values.length === 1 ?
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
									{field === "status" && (
										<StatusFilter id={id} />
									)}
									{field === "amount" && (
										<AmountFilter id={id} />
									)}
									{(field === "transaction_date" ||
										field === "created_at" ||
										field === "updated_at") && (
										<DateFilter id={id} field={field} />
									)}
									{field === "user" && <UserFilter id={id} />}
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
				);
			})}
		</React.Fragment>
	);
}
