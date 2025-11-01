"use client";

import { authClient } from "@budgetbee/core/auth-client";
import { useRouter } from "next/navigation";
import React from "react";

export function SignedIn({ children }: { children: React.ReactNode }) {
	const { data, error, isPending } = authClient.useSession();
	const router = useRouter();

	React.useEffect(() => {
		if (isPending) return;
		if (error || !data) router.push("/login");
	}, [data, error, isPending, router]);

	return isPending ? <></> : <>{children}</>;
}
