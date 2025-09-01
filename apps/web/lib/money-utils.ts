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

/**
 * Stripe and other payment providers return the amount in the smallest unit of the currency.
 * For example, if the currency is USD, they will return the amount in cents.
 * This function formats the amount in the smallest unit of the currency.
 */
export function formatLowestUnitCurrency(
	amount: number | undefined | null,
	currency: string | undefined | null,
) {
	if (!amount) return "0.00";
	if (!currency) return "0.00";
	const zeroDecimalCurrencies = [
		"BIF",
		"CLP",
		"DJF",
		"GNF",
		"JPY",
		"KMF",
		"KRW",
		"MGA",
		"PYG",
		"RWF",
		"UGX",
		"VND",
		"VUV",
		"XAF",
		"XOF",
		"XPF",
	];
	const isZeroDecimal = zeroDecimalCurrencies.includes(
		currency.toUpperCase(),
	);
	const rounded = isZeroDecimal ? amount : amount / 100;
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	}).format(rounded);
}
