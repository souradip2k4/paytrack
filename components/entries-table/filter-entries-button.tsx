"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QueryCategories, QueryTags } from "@/lib/api";
import { useStore } from "@/lib/store";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Funnel } from "lucide-react";

export type FilterState = {
	category: string[];
	status: string[];
};

export function FilterEntriesButton() {
	const { user } = useUser();

	const { data: categories } = useQuery<unknown, unknown, QueryCategories>({
		queryKey: ["categories", "GET", user?.id],
		queryFn: async () => {
			if (!user) {
				return [];
			}
			const res = await axios.get(`/api/users/${user?.id}/categories`);
			return res.data;
		},
		enabled: !!user && !!user.id,
	});

	const { data: tags } = useQuery<unknown, unknown, QueryTags>({
		queryKey: ["tags", "GET", user?.id],
		queryFn: async () => {
			if (!user) {
				return [];
			}
			const res = await axios.get(`/api/users/${user?.id}/tags`);
			return res.data;
		},
		enabled: !!user && !!user.id,
	});

	const filters = useStore(s => s.filters);
	const toggleFilter = useStore(s => s.toggleFilter);
	const resetAllFilters = useStore(s => s.resetAllFilters);
	const totalFilters = useStore(
		s => s.filters.tag.length + s.filters.category.length,
	);
	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon" className="relative">
						<Funnel className="size-4" />
						{totalFilters > 0 && (
							<Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 rounded-full px-1 text-xs">
								{totalFilters > 99 ? "99+" : totalFilters}
							</Badge>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>Filters</DropdownMenuLabel>

					<DropdownMenuSeparator />

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							Category
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								{categories?.map((category, i) => (
									<DropdownMenuCheckboxItem
										key={i}
										checked={filters.category.includes(
											category.id,
										)}
										onCheckedChange={() => {
											toggleFilter(
												"category",
												category.id,
											);
										}}
										onSelect={e => {
											e.preventDefault();
											e.stopPropagation();
										}}>
										{category.name}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Tags</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								{tags?.data.map((tag, i) => (
									<DropdownMenuCheckboxItem
										key={i}
										checked={filters.tag.includes(tag.id)}
										onCheckedChange={() => {
											toggleFilter("tag", tag.id);
										}}
										onSelect={e => {
											e.preventDefault();
											e.stopPropagation();
										}}>
										{tag.name}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={() => resetAllFilters()}>
						Clear all filters
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
