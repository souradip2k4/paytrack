"use client";

import { useDashboardMutation } from "@/lib/query/dashboard-queries";
import { useDashboardStore } from "@/lib/store";
import { Button } from "@budgetbee/ui/core/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@budgetbee/ui/core/dialog";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
});

type FormValue = z.infer<typeof formSchema>;

export function CreateDashboardDialog() {
	const dashboardNameInputId = React.useId();

	const open = useDashboardStore(s => s.create_dashboard_dialog_open);
	const setOpen = useDashboardStore(s => s.set_create_dashboard_dialog_open);

	const { mutateAsync: createDashboard, isPending: isLoading } =
		useDashboardMutation();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "My Dashboard",
		},
	});

	const onSubmit = async (e: FormValue) => {
		await createDashboard({
			type: "create",
			payload: { name: e.name },
		})
			.then(() => reset())
			.finally(() => setOpen(false));
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus className="size-4" />
					New Dashboard
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader className="border-b pb-4">
					<DialogTitle className="font-normal">
						Create dashboard
					</DialogTitle>
					<DialogDescription>
						Build interactive dashboard to visualize your data.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="my-4">
						<div className="space-y-2">
							<Label
								className="text-muted-foreground"
								htmlFor={dashboardNameInputId}>
								Name
							</Label>
							<Input
								id={dashboardNameInputId}
								placeholder="Dashboard name"
								autoFocus
								{...register("name")}
							/>
							{errors.name && (
								<p className="text-destructive text-sm">
									{String(errors.name.message)}
								</p>
							)}
						</div>
					</div>
					<DialogFooter className="pt-4">
						<Button type="submit" size="sm" isLoading={isLoading}>
							Create
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
