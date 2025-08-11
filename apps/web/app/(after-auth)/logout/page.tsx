"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { avatarUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";

export default function SignoutPage() {
	const { data } = authClient.useSession();
	const router = useRouter();

	const [pending, startTransition] = React.useTransition();
	const [error, setError] = React.useState<String | undefined>(undefined);

	const handleSignout = () => {
		startTransition(async () => {
			const res = await authClient.signOut();
			if (res.error) setError(res.error.message);
			if (res.data) router.push("/login");
		});
	};

	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="border-b">
				<CardTitle className="text-xl font-normal">Logout</CardTitle>
				<CardDescription>
					Are you sure you want to logout?
				</CardDescription>
				{error && <p className="text-destructive text-sm">{error}</p>}
			</CardHeader>
			<CardContent>
				<p>
					Logged in as{" "}
					<Badge variant="secondary">
						<img
							src={avatarUrl(undefined)}
							className="size-3 rounded"
						/>
						{data?.user?.email}
					</Badge>
				</p>
			</CardContent>
			<CardFooter className="space-x-2 border-t">
				<Button
					variant="outline"
					className="ml-auto"
					onClick={() => router.push("/app")}>
					Back
				</Button>
				<Button
					isLoading={pending}
					variant="destructive"
					onClick={handleSignout}>
					Logout
				</Button>
			</CardFooter>
		</Card>
	);
}
