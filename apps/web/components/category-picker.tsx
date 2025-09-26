import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import { useCategories } from "@/lib/query";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, Plus } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import React from "react";
import { toast } from "sonner";
import { CategoryBadge } from "./category-badge";

type OnChange = (value?: string) => void;
type CategoryPickerProps = React.ComponentProps<
	typeof PopoverPrimitive.Trigger
> & {
	modal?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultOpen?: boolean;

	value?: string;
	onValueChange: OnChange;
	children?: React.ReactNode;
};

export function CategoryPicker(props: CategoryPickerProps) {
	const {
		modal = false,
		open,
		onOpenChange,
		defaultOpen,
		asChild = false,
		children,
		value,
		onValueChange,
		className,
		...rest
	} = props;

	const queryClient = useQueryClient();

	const { data: categories } = useCategories();

	const name = React.useMemo(() => {
		if (!categories) return;
		return categories.find(c => c.id === value)?.name;
	}, [categories, value]);

	const { mutateAsync: createCategory, isPending: isCreatingCategory } =
		useMutation({
			mutationKey: ["cat", "post"],
			mutationFn: async (data: string) => {
				const res = await db(await bearerHeader())
					.from("categories")
					.insert({
						name: data,
					});
				if (res.error) {
					toast.error("Failed to create category");
					return;
				}
				return res.data;
			},
			onSuccess: () => {
				toast.success("Category created successfully");
				queryClient.invalidateQueries({
					queryKey: ["cat", "get"],
				});
				queryClient.refetchQueries({
					queryKey: ["cat", "get"],
				});
			},
		});

	const [search, setSearch] = React.useState("");

	const exists = React.useMemo(() => {
		if (typeof categories === "undefined") return false;
		return categories.findIndex(c => c.name === search) !== -1;
	}, [search, categories]);

	const createCategoryId = React.useId();

	return (
		<Popover
			modal={modal}
			open={open}
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}>
			<PopoverTrigger
				{...rest}
				className={cn(
					"flex items-center justify-center [&>*]:h-full",
					className,
				)}>
				{children ?
					children
				:	<Badge variant="outline" className="gap-1.5 rounded-full">
						{name ? name : "Category"}
					</Badge>
				}
			</PopoverTrigger>
			<PopoverContent
				className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
				align="start">
				<Command>
					<CommandInput
						value={search}
						onValueChange={setSearch}
						placeholder="Search..."
					/>
					<CommandList>
						{/* categories */}
						<CommandGroup>
							{categories?.map((c, i) => (
								<CommandItem
									key={i}
									value={c.id}
									keywords={[c.name]}
									onSelect={e => {
										onValueChange(e);
										useStore.setState({
											popover_category_picker_open: false,
										});
									}}>
									<CategoryBadge category={c.name} />
									{value === c.id && (
										<CheckIcon
											size={16}
											className="ml-auto"
										/>
									)}
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />

						{/* create new category button */}
						{search && search.length > 0 && !exists && (
							<CommandGroup forceMount>
								<CommandItem
									disabled={isCreatingCategory}
									value={createCategoryId}
									onSelect={() => createCategory(search)}>
									<Plus className="size-4" />{" "}
									{isCreatingCategory ?
										"Creating..."
									:	`Create "${search}"`}
								</CommandItem>
							</CommandGroup>
						)}

						{/* clear selection */}
						<CommandGroup forceMount>
							<CommandItem
								className="text-destructive data-[selected=true]:text-destructive data-[selected=true]:bg-destructive/10 data-[selected=true]:dark:bg-destructive/20"
								onSelect={e => {
									onChange(e);
									setOpen(false);
								}}>
								Clear category
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
