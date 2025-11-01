import * as React from "react";
import { authClient } from "../auth-client";

export function AuthLoading({ children }: { children: React.ReactNode }) {
	const { isPending } = authClient.useSession();
	return (
		<React.Activity mode={isPending ? "visible" : "hidden"}>
			{children}
		</React.Activity>
	);
}
