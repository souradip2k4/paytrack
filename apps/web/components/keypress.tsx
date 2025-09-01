"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import * as React from "react";

export function Keypress() {
	const router = useRouter();

	const handleNavigation = React.useCallback(
		(p: string) => () => router.push(p),
		[router],
	);

	const keypress: Record<string, () => void> = React.useMemo(
		() => ({
			h: handleNavigation("/home"),
			s: handleNavigation("/subscriptions"),
			t: handleNavigation("/transactions"),
			x: handleNavigation("/settings"),
			a: handleNavigation("/accounts"),
		}),
		[handleNavigation],
	);

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.currentTarget instanceof HTMLInputElement ||
				e.currentTarget instanceof HTMLTextAreaElement
			)
				return;
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			)
				return;

			const key = e.key.toLowerCase();
			if (keypress[key]) {
				keypress[key]();
			}

			if (key === "n") {
				useStore.setState(s => ({
					popover_transaction_dialog_open:
						!s.popover_transaction_dialog_open,
				}));
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [keypress]);

	return <></>;
}
