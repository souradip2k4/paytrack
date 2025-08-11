"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
				"Password must contain at least one lowercase letter, one uppercase letter and one number",
			),
		confirmPassword: z.string(),
	})
	.superRefine((arg, ctx) => {
		if (arg.password !== arg.confirmPassword) {
			ctx.addIssue({
				code: "custom",
				message: "Passwords don't match",
				path: ["confirmPassword"],
			});
		}
	});

type FieldValues = z.infer<typeof schema>;

export default function UpdatePasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [pending, startTransition] = React.useTransition();
	const [error, setError] = React.useState<string | undefined>("");

	const {
		handleSubmit,
		register,
		watch,
		formState: { errors },
	} = useForm({ resolver: zodResolver(schema) });

	const onSubmit = (e: FieldValues) => {
		startTransition(async () => {
			const res = await authClient.resetPassword({
				newPassword: e.password,
				token: searchParams.get("token") || "",
			});
			if (res.error) {
				// if not a known error, don't show the error
				// @ts-ignore
				if (!authClient.$ERROR_CODES[res.error.code]) return;
				return setError(res.error.message);
			}
			if (res.data && res.data.status) {
				router.push("/login");
				return;
			} else {
				toast.error(
					"Failed to update password. Please contact support try again later.",
				);
				return;
			}
		});
	};

	const [isVisible, setIsVisible] = React.useState<boolean>(false);
	const toggleVisibility = () => setIsVisible(x => !x);

	const checkStrength = (pass: string) => {
		const requirements = [
			{ regex: /.{8,}/, text: "At least 8 characters" },
			{ regex: /[0-9]/, text: "At least 1 number" },
			{ regex: /[a-z]/, text: "At least 1 lowercase letter" },
			{ regex: /[A-Z]/, text: "At least 1 uppercase letter" },
		];
		return requirements.map(req => ({
			met: req.regex.test(pass),
			text: req.text,
		}));
	};

	const password = watch("password");
	const strength = checkStrength(password);

	const strengthScore = React.useMemo(() => {
		return strength.filter(req => req.met).length;
	}, [strength]);

	const getStrengthColor = (score: number) => {
		if (score === 0) return "bg-border";
		if (score <= 1) return "bg-red-500";
		if (score <= 2) return "bg-orange-500";
		if (score === 3) return "bg-amber-500";
		return "bg-emerald-500";
	};

	const getStrengthText = (score: number) => {
		if (score === 0) return "Enter a password";
		if (score <= 2) return "Weak password";
		if (score === 3) return "Medium password";
		return "Strong password";
	};

	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="border-b">
				<CardTitle className="text-xl font-normal">
					Update password
				</CardTitle>
				<CardDescription>
					Set a strong password. Use a social provider if you struggle
					to remember passwords.
				</CardDescription>
				{error && <p className="text-destructive">{error}</p>}
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={isVisible ? "text" : "password"}
									placeholder="Enter your password"
									{...register("password", {
										required: true,
									})}
								/>
								<button
									className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
									type="button"
									onClick={toggleVisibility}
									aria-label={
										isVisible ? "Hide password" : (
											"Show password"
										)
									}
									aria-pressed={isVisible}
									aria-controls="password">
									{isVisible ?
										<Eye
											size={16}
											strokeWidth={2}
											aria-hidden="true"
										/>
									:	<EyeOff
											size={16}
											strokeWidth={2}
											aria-hidden="true"
										/>
									}
								</button>
							</div>
							{errors.password && (
								<p className="text-destructive text-sm">
									{errors.password.message}
								</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="password">Confirm password</Label>
							<div className="relative">
								<Input
									id="password"
									type={isVisible ? "text" : "password"}
									placeholder="Enter your password"
									{...register("confirmPassword", {
										required: true,
									})}
								/>
								<button
									className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
									type="button"
									onClick={toggleVisibility}
									aria-label={
										isVisible ? "Hide password" : (
											"Show password"
										)
									}
									aria-pressed={isVisible}
									aria-controls="password">
									{isVisible ?
										<Eye
											size={16}
											strokeWidth={2}
											aria-hidden="true"
										/>
									:	<EyeOff
											size={16}
											strokeWidth={2}
											aria-hidden="true"
										/>
									}
								</button>
							</div>
							{errors.password && (
								<p className="text-destructive text-sm">
									{errors.password.message}
								</p>
							)}
						</div>

						{!!password &&
							strengthScore >= 0 &&
							strengthScore <= 3 && (
								<div>
									<div
										className="bg-border mb-4 h-1 w-full overflow-hidden rounded-full"
										role="progressbar"
										aria-valuenow={strengthScore}
										aria-valuemin={0}
										aria-valuemax={4}
										aria-label="Password strength">
										<div
											className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
											style={{
												width: `${(strengthScore / 4) * 100}%`,
											}}></div>
									</div>
									<p className="text-foreground mb-2 text-sm font-medium">
										{getStrengthText(strengthScore)}. Must
										contain:
									</p>
									<ul
										className="space-y-1.5"
										aria-label="Password requirements">
										{strength.map((req, index) => (
											<li
												key={index}
												className="flex items-center gap-2">
												{req.met ?
													<Check
														size={16}
														className="text-emerald-500"
														aria-hidden="true"
													/>
												:	<X
														size={16}
														className="text-muted-foreground/80"
														aria-hidden="true"
													/>
												}
												<span
													className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}>
													{req.text}
													<span className="sr-only">
														{req.met ?
															" - Requirement met"
														:	" - Requirement not met"
														}
													</span>
												</span>
											</li>
										))}
									</ul>
								</div>
							)}
						<Button
							isLoading={pending}
							type="submit"
							className="w-full">
							Update password
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
