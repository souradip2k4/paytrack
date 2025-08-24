"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { icons } from "@/lib/icons";
import { useFilterStore } from "@/lib/store";
import { ListFilterPlus } from "lucide-react";
import { nanoid } from "nanoid";
import React from "react";
import { CategoryFilter } from "./category-filter";
import { StatusFilter } from "./status-filter";

export function FilterDialog() {
	const clearFilters = useFilterStore(s => s.filter_clear);
	const [id, setId] = React.useState(() => nanoid(8));
	const [open, setOpen] = React.useState(false);
	const stack = useFilterStore(s => s.filter_stack);
	const toggle = useFilterStore(s => s.filter_toggle);

	return (
		<DropdownMenu
			open={open}
			onOpenChange={x => {
				setOpen(x);
				if (open) setId(nanoid(8));
			}}
			modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" size="sm">
					<ListFilterPlus />
					{stack.length <= 0 && "Filter"}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start">
				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<icons.category className="mr-2 size-4" /> Category
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<CategoryFilter id={id} />
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<icons.status className="mr-2 size-4" />
							Status
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<StatusFilter id={id} />
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
