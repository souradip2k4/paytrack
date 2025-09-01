"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type X = ReturnType<typeof authClient.useSession>["data"];

export default function Page() {
	const data = authClient.getSession();
	data.then(x => console.log("> session:", x));

	return (
		<div className="p-24">
			<Button>Refetch</Button>
		</div>
	);
}
