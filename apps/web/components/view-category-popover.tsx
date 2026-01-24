import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@budgetbee/ui/core/popover";
import { ScrollArea } from "@budgetbee/ui/core/scroll-area";
import { Separator } from "@budgetbee/ui/core/separator";
import { useStore, useLocalSettingsStore } from "@/lib/store";
import { useCategories, useCategoryMutation } from "@/lib/query";
import { Button } from "@budgetbee/ui/core/button";
import { Loader, Pencil, Plus, Tags, Trash } from "lucide-react";
import React from "react";
import { CategoryBadge } from "./category-badge";
import { CategoryDialog } from "./category-dialog";


export function ViewCategoryPopover() {
	const { data: categories, isLoading: isCategoriesLoading } =
		useCategories();

	const { category_create_dialog_set_state: setCategoryDialogState } = useStore();
	const { confirmation_dialog_delete_category_hidden } = useLocalSettingsStore();
	const { mutateAsync: manageCategory, isPending: isUpdating } = useCategoryMutation();

	const [deletingId, setDeletingId] = React.useState<string | null>(null);

	const handleDeleteClick = async (id: string) => {
		if (confirmation_dialog_delete_category_hidden) {
			setDeletingId(id);
			await manageCategory({
				type: "delete",
				payload: {
					id,
					cascade: false
				}
			});
			setDeletingId(null);
		} else {
			setCategoryDialogState(true, "delete", {
				id,
			});
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button size="sm" className="size-8 border" variant="secondary">
					<Tags />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="p-0">
				<div className="flex flex-col">
					<h2 className="px-4 py-2">Categories</h2>
					<Separator />
					<ScrollArea className="h-72">
						{isCategoriesLoading && (
							<div className="p-4 text-center">
								<Loader className="text-muted-foreground size-4 animate-spin" />
							</div>
						)}

						{categories && categories.length <= 0 && (
							<div className="p-4 text-center">
								<p className="text-muted-foreground">
									No categories
								</p>
							</div>
						)}

						{categories?.map((c, i) => (
							<React.Fragment key={i}>
								<div className="not-last:border-b group flex items-center justify-between gap-2 px-4 py-2">
									<CategoryBadge
										category={c.name}
										className="rounded"
										color={c.color}
									/>
									<div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
										<Button
											size="sm"
											variant="secondary"
											className="size-6 border"
											onClick={() =>
												setCategoryDialogState(true, "update", {
													id: c.id,
													name: c.name,
													color: c.color,
												})
											}>
											<Pencil className="size-3" />
										</Button>

										<Button
											size="sm"
											variant="secondary"
											className="size-6 border"
											isLoading={isUpdating && deletingId === c.id}
											onClick={() => handleDeleteClick(c.id)}>
											<Trash className="size-3" />
										</Button>
									</div>
								</div>
							</React.Fragment>
						))}
					</ScrollArea>
				</div>
				<Separator />
				<div className="p-4">
					<Button
						variant="outline"
						className="w-full"
						onClick={() =>
							setCategoryDialogState(true, "create", {
								name: "",
								color: "",
							})
						}>
						<Plus className="size-4" />
						Create Category
					</Button>
					<CategoryDialog />
				</div>
			</PopoverContent>
		</Popover>
	);
}
