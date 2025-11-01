"use client";

import { authClient } from "@budgetbee/core/auth-client";
import { Button } from "@budgetbee/ui/core/button";
import { Input } from "@budgetbee/ui/core/input";
import React from "react";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner";

export function EditProfile() {
	const id = React.useId();
	const { data } = authClient.useSession();

	const {
		watch,
		register,
		handleSubmit,
		formState: { isDirty, isSubmitting, isValid },
	} = useForm({
		values: { name: data?.user?.name },
	});

	const name = watch("name");

	const onSubmit = async (data: FieldValues) => {
		await authClient
			.updateUser({ name: data.name })
			.then(() => toast.success("Profile updated successfully"));
	};

	return (
		<form
			className="flex flex-col items-end gap-2"
			onSubmit={handleSubmit(onSubmit)}>
			<div className="relative w-full">
				<Input
					id={id}
					className="peer pe-12"
					placeholder="Your name"
					type="text"
					{...register("name", { required: true, maxLength: 50 })}
				/>
				<span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
					{name?.length} / 50
				</span>
			</div>
			<Button
				type="submit"
				size="sm"
				disabled={!isDirty || !isValid}
				isLoading={isSubmitting}>
				Save
			</Button>
		</form>
	);
}
