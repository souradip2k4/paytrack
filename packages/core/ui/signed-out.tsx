import * as React from "react";
import { authClient } from "../auth-client";

export function SignedOut({ children }: { children: React.ReactNode }) {
	const { data, isPending } = authClient.useSession();
	return (
		<React.Activity
			mode={
				isPending ? "hidden"
				: data === null ?
					"visible"
				:	"hidden"
			}>
			{children}
		</React.Activity>
	);
}
