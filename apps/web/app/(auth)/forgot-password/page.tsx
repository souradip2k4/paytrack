"use client";

import { authClient } from "@budgetbee/core/auth-client";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
	email: z.email("Invalid email"),
});

type FieldValues = z.infer<typeof schema>;

export default function ForgotpasswordPage() {
	const [pending, startTransition] = React.useTransition();
	const [error, setError] = React.useState<String | undefined>(undefined);

	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
	});

	const onSubmit = (data: FieldValues) => {
		startTransition(async () => {
			const res = await authClient.forgetPassword({
				email: data.email,
				redirectTo: "/update-password",
			});
			if (res.error) {
				// if not a known error, don't show the error
				// @ts-ignore
				if (!authClient.$ERROR_CODES[res.error.code]) return;
				return setError(res.error.message);
			}
			if (res.data && res.data.status) {
				toast.success("Check your email for reset link.");
				return;
			} else {
				toast.error(
					"Failed to send reset link. Please contact support try again later.",
				);
				return;
			}
		});
	};

	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="border-b">
				<CardTitle className="text-xl font-normal">
					Forgot password
				</CardTitle>
				<CardDescription>
					Enter your email to reset your password.
				</CardDescription>
				{error && <p className="text-destructive text-sm">{error}</p>}
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								{...register("email", {
									required: true,
								})}
							/>
							{errors.email && (
								<p className="text-destructive text-sm">
									{errors.email.message}
								</p>
							)}
						</div>
						<Button
							isLoading={pending}
							type="submit"
							className="w-full">
							Send reset link
						</Button>
					</div>
				</form>
			</CardContent>
			<CardFooter className="flex-col gap-4">
				<p>
					Back to{" "}
					<Link
						className="text-primary no-underline hover:underline"
						href="/login">
						Login
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
