"use client";

import { useCategories } from "@/lib/query";
import { useEditorStore } from "@/lib/store/editor-store";
import { CellContext, ColumnDefTemplate } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import React from "react";
import { useController } from "react-hook-form";
import { CategoryBadge } from "../category-badge";
import { CategoryPicker } from "../category-picker";
import { Skeleton } from "@budgetbee/ui/core/skeleton";

export const CategoryCell: ColumnDefTemplate<CellContext<any, unknown>> = ({
	row,
	column,
}) => {
	const defaultCategoryId = row.original.category_id;
	const { data: categories, isLoading: isCategoriesLoading } =
		useCategories();

	const {
		field: { onChange, ...field },
	} = useController({
		name: `tr.${row.id}.category_id`,
		defaultValue: defaultCategoryId,
	});

	const isEditing = useEditorStore(s => s.is_editing);
	const editorState = field.value !== defaultCategoryId ? "stale" : "clean";

	if (isCategoriesLoading) return <Skeleton className="h-4 w-16" />;

	const defaultCategory = categories?.find(
		x => x.id === defaultCategoryId,
	)?.name;
	const category = categories?.find(x => x.id === field.value)?.name;

	if (isEditing) {
		return (
			<CategoryPicker
				data-editor={editorState}
				{...field}
				onValueChange={onChange}>
				<span
					className="flex h-[48px] items-center justify-between p-2"
					style={{ width: column.getSize() }}>
					{category ?
						<CategoryBadge category={category} />
					:	<pre className="text-muted-foreground pl-2 text-xs">
							Empty
						</pre>
					}
					<ChevronDown className="size-4" />
				</span>
			</CategoryPicker>
		);
	}

	return (
		<React.Fragment>
			{defaultCategory && <CategoryBadge category={defaultCategory} />}
		</React.Fragment>
	);
};
