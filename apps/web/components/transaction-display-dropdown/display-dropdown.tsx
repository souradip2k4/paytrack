"use client";

import { display_fields, useDisplayStore } from "@/lib/store";
import { SlidersHorizontal } from "lucide-react";
import { icons } from "../../lib/icons";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";

export function DisplayDropdown() {
	const pageCount = useDisplayStore(s => s.display_page_size);
	const columnVisibility = useDisplayStore(s => s.display_visibility_state);
	const setColumnVisibility = useDisplayStore(
		s => s.set_display_visibility_state,
	);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="secondary" size="sm">
					<SlidersHorizontal />
					Display
				</Button>
			</PopoverTrigger>

			<PopoverContent className="space-y-4">
				<div className="flex gap-2">
					<Label>Records per page</Label>
					<Select
						value={pageCount}
						onValueChange={e =>
							useDisplayStore.setState({ display_page_size: e })
						}>
						<SelectTrigger size="sm" className="ml-auto">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{["10", "50", "100", "500", "1000"].map((c, i) => (
								<SelectItem key={i} value={c}>
									{c}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<Separator />
				<div className="flex flex-col gap-2">
					<Label className="text-muted-foreground">
						Toggle fields
					</Label>
					<div className="flex flex-wrap gap-2">
						{display_fields.map((f, i) => (
							<Toggle
								key={i}
								variant="outline"
								size="sm"
								className="px-2"
								pressed={
									columnVisibility[f.id] !== undefined ?
										columnVisibility[f.id].valueOf()
									:	f.default
								}
								onPressedChange={e => {
									setColumnVisibility({
										...columnVisibility,
										[f.id]: e,
									});
								}}>
								{(f.id === "transaction_date" ||
									f.id === "created_at" ||
									f.id === "updated_at") && (
									<icons.transaction_date />
								)}
								{f.id === "status" && <icons.status />}
								{f.id === "category_id" && <icons.category />}
								{f.id === "user_id" && <icons.creator />}
								{f.label}
							</Toggle>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
