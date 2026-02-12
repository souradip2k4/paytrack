"use client";

import { icons } from "@/lib/icons";
import { useFilterStore } from "@/lib/store";
import { authClient } from "@budgetbee/core/auth-client";
import { Button } from "@budgetbee/ui/core/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@budgetbee/ui/core/dropdown-menu";
import { ListFilterPlus } from "lucide-react";
import { nanoid } from "nanoid";
import React from "react";
import { AmountFilter } from "./amount-filter";
import { CategoryFilter } from "./category-filter";
import { DateFilter } from "./date-filter";
import { StatusFilter } from "./status-filter";
import { UserFilter } from "./user-filter";

export function FilterDialog() {
	const [id, setId] = React.useState(() => nanoid(4));
	const [open, setOpen] = React.useState(false);
	const stack = useFilterStore(s => s.filter_stack);
	const { data: session } = authClient.useSession();
	const hasOrg = !!session?.session?.activeOrganizationId;

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
							<icons.amount className="mr-2 size-4" /> Amount
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<AmountFilter id={"amt_" + id} />
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<icons.category className="mr-2 size-4" /> Category
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<CategoryFilter id={"cat_" + id} />
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
								<StatusFilter id={"st_" + id} />
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<icons.transaction_date className="mr-2 size-4" />
							Transaction date
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DateFilter
									id={"td_" + id}
									field="transaction_date"
								/>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<icons.created_at className="mr-2 size-4" />
							Created date
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DateFilter
									id={"cd_" + id}
									field="created_at"
								/>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<icons.updated_at className="mr-2 size-4" />
							Last updated
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DateFilter
									id={"ud_" + id}
									field="updated_at"
								/>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					{hasOrg && (
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<icons.user className="mr-2 size-4" />
								User
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									<UserFilter id={"usr_" + id} />
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					)}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
