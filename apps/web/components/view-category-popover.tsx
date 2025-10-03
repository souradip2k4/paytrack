import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import { useCategories, useCreateCategories } from "@/lib/query";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader, Pencil, Plus, Tags, Trash, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { CategoryBadge } from "./category-badge";

export function ViewCategoryPopover() {
    const [categoryId, setCategoryId] = React.useState<string | null>(null);
    const [categoryName, setCategoryName] = React.useState<string>("");

    const createCategoryInputRef = React.useRef<HTMLInputElement>(null!);

    const handleCreateCategory = () => {
        const categoryName = createCategoryInputRef.current.value?.trim();
        if (categoryName === "") return;
        createCategory(categoryName);
    };

    const { data: categories, isLoading: isCategoriesLoading } =
        useCategories();

    const queryClient = useQueryClient();

    const { mutateAsync: deleteCategory, isPending: isDeletingCategory } =
        useMutation({
            mutationKey: ["cat", "delete"],
            mutationFn: async (id: string) => {
                if (!id) return;
                const res = await db(await bearerHeader())
                    .from("categories")
                    .delete()
                    .eq("id", id);
                if (res.error) throw res.error;
                return res.data;
            },
            onSuccess: () => {
                toast.success("Category deleted successfully");
                queryClient.invalidateQueries({
                    queryKey: ["cat", "get"],
                    exact: false,
                });
                queryClient.refetchQueries({
                    queryKey: ["cat", "get"],
                    exact: false,
                });
            },
            onError: () => toast.error("Failed to delete category"),
        });

    const { mutateAsync: editCategory, isPending: isEditingCategory } =
        useMutation({
            mutationKey: ["cat", "patch"],
            mutationFn: async () => {
                if (!categoryId || categoryName === "") return;
                const res = await db(await bearerHeader())
                    .from("categories")
                    .update({ name: categoryName })
                    .eq("id", categoryId)
                    .select();
                if (res.error) throw res.error;
                return res.data;
            },
            onSuccess: () => {
                toast.success("Category renamed successfully");
                queryClient.invalidateQueries({
                    queryKey: ["cat", "get"],
                    exact: false,
                });
                queryClient.refetchQueries({
                    queryKey: ["cat", "get"],
                    exact: false,
                });
            },
            onError: () => toast.error("Failed to update category"),
            onSettled: () => {
                setCategoryId(null);
                setCategoryName("");
            },
        });

    const { mutateAsync: createCategory, isPending: isCreatingCategory } =
        useCreateCategories();

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
                    <ScrollArea className="max-h-96">
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
                                <div className="not-last:border-b group flex justify-between gap-2 px-4 py-2">
                                    {categoryId === c.id ?
                                        <Input
                                            placeholder="Category"
                                            className="h-6"
                                            value={categoryName}
                                            onInput={e =>
                                                setCategoryName(
                                                    e.currentTarget.value,
                                                )
                                            }
                                        />
                                        : <CategoryBadge
                                            category={c.name}
                                            className="rounded"
                                        />
                                    }
                                    <div
                                        className={cn(
                                            "flex gap-2 opacity-0 group-hover:opacity-100",
                                            {
                                                "opacity-100":
                                                    categoryId === c.id,
                                            },
                                        )}>
                                        {categoryId === c.id ?
                                            <React.Fragment>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="size-6 border"
                                                    isLoading={
                                                        isEditingCategory
                                                    }
                                                    onClick={() =>
                                                        editCategory()
                                                    }>
                                                    <Check className="size-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="size-6 border"
                                                    onClick={() => {
                                                        setCategoryId(null);
                                                        setCategoryName("");
                                                    }}>
                                                    <X className="size-3" />
                                                </Button>
                                            </React.Fragment>
                                            : <React.Fragment>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="size-6 border"
                                                    onClick={() => {
                                                        setCategoryId(c.id);
                                                        setCategoryName(c.name);
                                                    }}>
                                                    <Pencil className="size-3" />
                                                </Button>
                                            </React.Fragment>
                                        }
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="size-6 border"
                                            onClick={() => deleteCategory(c.id)}
                                            isLoading={isDeletingCategory}>
                                            <Trash className="size-3" />
                                        </Button>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </ScrollArea>
                </div>
                <Separator />
                <div className="flex gap-1 p-4">
                    <Input
                        placeholder="Create a new category"
                        ref={createCategoryInputRef}
                    />
                    <Button
                        size="icon"
                        className="border"
                        isLoading={isCreatingCategory}
                        onClick={handleCreateCategory}>
                        <Plus />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
