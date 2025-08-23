"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function PayButton({
	highlight,
}: {
	disabled?: boolean;
	highlight?: boolean;
}) {
	const router = useRouter();

	function handleBuy() {}

	return (
		<Button
			variant={highlight ? "default" : "secondary"}
			className="w-full"
			onClick={handleBuy}>
			Get started
		</Button>
	);
}
