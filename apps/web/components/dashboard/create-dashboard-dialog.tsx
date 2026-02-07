"use client";

import { Button } from "@budgetbee/ui/core/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@budgetbee/ui/core/dialog";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import * as React from "react";

interface CreateDashboardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: (name: string) => void;
}

export function CreateDashboardDialog({
	open,
	onOpenChange,
	onCreate,
}: CreateDashboardDialogProps) {
	const dashboardNameInputId = React.useId();

	const [name, setName] = React.useState("My Dashboard");

	React.useEffect(() => {
		if (open) setName("My Dashboard");
	}, [open]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name.trim()) return;
		onCreate(name.trim());
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader className="border-b pb-4">
					<DialogTitle className="font-normal">
						Create dashboard
					</DialogTitle>
					<DialogDescription>
						Build interactive dashboard to visualize your data.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="my-4">
						<div className="space-y-4">
							<Label htmlFor={dashboardNameInputId}>Name</Label>
							<Input
								id={dashboardNameInputId}
								placeholder="Dashboard name"
								value={name}
								onChange={e => setName(e.target.value)}
								autoFocus
							/>
						</div>
					</div>

					<DialogFooter className="pt-4">
						<Button type="submit" size="sm" disabled={!name.trim()}>
							Create
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
