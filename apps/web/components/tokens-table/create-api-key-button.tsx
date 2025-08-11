"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckboxTree } from "@/components/ui/checkbox-tree";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import React from "react";
import { FieldValues, useForm } from "react-hook-form";
import { Input } from "../ui/input";

interface TreeNode {
	id: string;
	label: string;
	defaultChecked?: boolean;
	children?: TreeNode[];
}

const initialTree: TreeNode = {
	id: "1",
	label: "Admin",
	children: [
		{ id: "2", label: "Read", defaultChecked: true },
		{
			id: "3",
			label: "Write",
			children: [
				{ id: "4", label: "Create" },
				{ id: "5", label: "Edit" },
				{ id: "6", label: "Delete", defaultChecked: false },
			],
		},
	],
};

export default function CreateApiKeyButton() {
	const nameId = React.useId();
	const permissionsId = React.useId();
	const expireId = React.useId();

	const { register, handleSubmit } = useForm();
	const onSubmit = (e: FieldValues) => {
		console.log(e);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Generate API Key</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="font-normal">
						Generate API Key.
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor={nameId}
							className="text-primary text-xs font-normal">
							Name
						</Label>
						<Input
							id={nameId}
							type="text"
							placeholder="Enter a name for the API key."
							{...register("name")}
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor={expireId}
							className="text-primary text-xs font-normal">
							Access permissions
						</Label>
						<CheckboxTree
							tree={initialTree}
							renderNode={({
								node,
								isChecked,
								onCheckedChange,
								children,
							}) => (
								<React.Fragment
									key={`${permissionsId}-${node.id}`}>
									<div className="flex items-center gap-2">
										<Checkbox
											id={`${permissionsId}-${node.id}`}
											checked={isChecked}
											onCheckedChange={onCheckedChange}
										/>
										<Label
											htmlFor={`${permissionsId}-${node.id}`}>
											{node.label}
										</Label>
									</div>
									{children && (
										<div className="ms-6 space-y-3">
											{children}
										</div>
									)}
								</React.Fragment>
							)}
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor={expireId}
							className="text-primary text-xs font-normal">
							Expires after
						</Label>
						<div className="relative">
							<Input
								id={expireId}
								className="peer pe-12"
								placeholder="30"
								defaultValue={30}
								type="number"
								{...register("name", {
									required: true,
									maxLength: 50,
									minLength: 2,
									valueAsNumber: true,
								})}
							/>
							<span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
								days
							</span>
						</div>
					</div>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="ghost">Cancel</Button>
					</DialogClose>
					<Button onClick={() => handleSubmit(onSubmit)()}>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/*



*/
