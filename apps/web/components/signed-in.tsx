"use client";

import { authClient } from "@budgetbee/core/auth-client";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export function SignedIn({ children }: { children: React.ReactNode }) {
	const { data, error, isPending } = authClient.useSession();
	const router = useRouter();
	const pathname = usePathname();

	React.useEffect(() => {
		if (isPending) return;
		if (error || !data) {
			const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
			router.replace(redirectUrl);
		}
	}, [data, error, isPending, pathname, router]);

	return isPending ? <></> : <>{children}</>;
}
