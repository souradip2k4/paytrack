export function formatMoney(amt: number | undefined | null) {
	amt = amt ?? 0;
	const IS_SERVER = typeof window === "undefined";
	let currency = "USD";
	if (!IS_SERVER) {
		currency = window.localStorage.getItem("currency") ?? "USD";
	}
	let rounded = parseFloat(amt.toFixed(2));
	const formatted = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(rounded);
	return formatted;
}
