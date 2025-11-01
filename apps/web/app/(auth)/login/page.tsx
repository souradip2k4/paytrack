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
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
	email: z.email("Invalid email"),
	password: z.string("*Required"),
});

type FieldValues = z.infer<typeof schema>;

export default function LoginPage() {
	const router = useRouter();

	const [error, setError] = React.useState<string | undefined>();
	const [pending, startTransition] = React.useTransition();

	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
	});

	const onSubmit = (e: FieldValues) => {
		startTransition(async () => {
			const res = await authClient.signIn.email({
				email: e.email,
				password: e.password,
				rememberMe: true,
			});
			if (res.error) {
				// if not a known error, don't show the error
				// @ts-ignore
				if (!authClient.$ERROR_CODES[res.error.code]) return;
				return setError(res.error.message);
			}
			if (res.data) {
				router.push("/transactions");
			}
		});
	};

	const [isVisible, setIsVisible] = React.useState<boolean>(false);
	const toggleVisibility = () => setIsVisible(prevState => !prevState);

	const handleGoogleSignIn = () => {
		startTransition(async () => {
			const res = await authClient.signIn.social({
				provider: "google",
				callbackURL: "/transactions",
			});
			if (res.error) setError(res.error.message);
			if (res.data && res.data.redirect) {
				router.push(res.data.url || "/transactions");
			}
		});
	};

	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="border-b">
				<CardTitle className="text-xl font-normal">Login</CardTitle>
				<CardDescription>
					Enter your email and password to login.
				</CardDescription>
				{error && <p className="text-destructive text-sm">{error}</p>}
			</CardHeader>
			<CardContent>
				<Button
					className="w-full"
					variant="outline"
					isLoading={pending}
					onClick={handleGoogleSignIn}>
					<img
						className="h-4 w-4"
						src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
					/>
					Sign in with Google
				</Button>
				<div className="my-4 flex items-center gap-2">
					<hr className="grow" />
					<p className="text-muted-foreground text-sm">Or</p>
					<hr className="grow" />
				</div>
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
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password">Password</Label>
								<Link
									href="/forgot-password"
									className="ml-auto inline-block text-sm no-underline hover:underline">
									Forgot password
								</Link>
							</div>
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

						<Button
							isLoading={pending}
							type="submit"
							className="w-full">
							Login
						</Button>
					</div>
				</form>
			</CardContent>
			<CardFooter className="flex-col gap-4">
				<p>
					Don&apos;t have an account?{" "}
					<Link
						className="text-primary no-underline hover:underline"
						href="/signup">
						Register
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
