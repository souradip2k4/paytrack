"use client";

import { useCategories } from "@/lib/query";
import { Row } from "@tanstack/react-table";
import React from "react";
import { CategoryBadge } from "../category-badge";
import { Skeleton } from "../ui/skeleton";

export const CategoryCell = ({ row }: { row: Row<any> }) => {
	const category_id = row.original.category_id;
	const { data, isLoading } = useCategories();
	return (
		<React.Fragment>
			{isLoading && <Skeleton className="h-4 w-16" />}
			{!isLoading && category_id && (
				<CategoryBadge
					category={data?.find(x => x.id === category_id)?.name}
				/>
			)}
		</React.Fragment>
	);
};
