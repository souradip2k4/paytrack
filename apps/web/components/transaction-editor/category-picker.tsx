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
import { useStore } from "@/lib/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, Plus } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type OnChange = (value: string) => void;

export function CategoryPicker({
	value,
	onChange,
	children,
}: {
	value: string;
	onChange: OnChange;
	children?: React.ReactNode;
}) {
	const queryClient = useQueryClient();

	const { data } = useQuery({
		queryKey: ["cat", "get"],
		queryFn: async () => {
			const res = await db(await bearerHeader())
				.from("categories")
				.select("*")
				.order("name");
			if (res.error) {
				toast.error("Failed to get categories");
				return;
			}
			return res.data;
		},
	});

	const name = React.useMemo(() => {
		if (!data) return;
		return data.find(c => c.id === value)?.name;
	}, [data, value]);

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
		if (typeof data === "undefined") return false;
		return data.findIndex(c => c.name === search) !== -1;
	}, [search, data]);

	const open = useStore(s => s.popover_category_picker_open);
	const setOpen = useStore(s => s.popover_category_picker_set_open);

	const createCategoryId = React.useId();

	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger asChild>
				{children ?
					children
				:	<Badge variant="outline">{name ? name : "Category"}</Badge>}
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
							{data?.map((c, i) => (
								<CommandItem
									key={i}
									value={c.id}
									keywords={[c.name]}
									onSelect={e => {
										onChange(e);
										setOpen(false);
									}}>
									{c.name}
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
								className="text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive/10 dark:hover:bg-destructive/20"
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
