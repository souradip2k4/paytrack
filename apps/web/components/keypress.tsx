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
			// s: handleNavigation("/subscriptions"),
			t: handleNavigation("/transactions"),
			x: handleNavigation("/settings"),
			a: handleNavigation("/accounts"),
		}),
		[handleNavigation],
	);

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const isEditable =
				target.tagName === "INPUT" || // for <input />
				target.tagName === "TEXTAREA" || // for <textarea />
				target.isContentEditable; // for elements with contentEditable="true"

			if (isEditable) return;

			const key = e.key;
			const lowerKey = key.toLowerCase();

			/* sidebar navigations */
			if (e.shiftKey && keypress[lowerKey]) {
				keypress[lowerKey]();
			}

			/* TRANSACTION DIALOG SHORTCUTS */
			/* open transaction dialog */
			if (key === "n") {
				e.preventDefault();
				useStore.setState({
					popover_transaction_dialog_open: true,
				});
			}

			/* open date picker */
			if (!isEditable && key === "d") {
				e.preventDefault();
				useStore.setState({ popover_datepicker_open: true });
			}

			/* open currency picker */
			if (!isEditable && key === "k") {
				e.preventDefault();
				useStore.setState({ popover_currency_picker_open: true });
			}

			/* open status picker */
			if (!isEditable && key === "s") {
				e.preventDefault();
				useStore.setState({ popover_status_picker_open: true });
			}

			/* open category picker */
			if (!isEditable && key === "c") {
				e.preventDefault();
				useStore.setState({ popover_category_picker_open: true });
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [keypress]);

	return <></>;
}
