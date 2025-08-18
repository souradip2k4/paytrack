"use client";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { icons } from "@/lib/icons";
import { useFilterStore } from "@/lib/store";
import { X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
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
						{field === "categories" && (
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
								{field === "categories" && (
									<CategoryFilter id={id} />
								)}
								{field === "status" && <StatusFilter id={id} />}
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
