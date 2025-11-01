import * as React from "react";
import { authClient } from "../auth-client";

export function AuthLoaded({ children }: { children: React.ReactNode }) {
	const { isPending } = authClient.useSession();
	return (
		<React.Activity mode={isPending ? "hidden" : "visible"}>
			{children}
		</React.Activity>
	);
}
