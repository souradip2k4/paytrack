export type Currency = {
	code: string;
	name: string;
	symbol: string;
	flag: string;
};

export const currencies: Currency[] = [
	{ code: "USD", name: "US Dollar", symbol: "$", flag: "\u{1F1FA}\u{1F1F8}" },
	{ code: "EUR", name: "Euro", symbol: "\u20AC", flag: "\u{1F1EA}\u{1F1FA}" },
	{ code: "GBP", name: "British Pound Sterling", symbol: "\u00A3", flag: "\u{1F1EC}\u{1F1E7}" },
	{ code: "JPY", name: "Japanese Yen", symbol: "\u00A5", flag: "\u{1F1EF}\u{1F1F5}" },
	{ code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "\u{1F1E8}\u{1F1E6}" },
	{ code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "\u{1F1E6}\u{1F1FA}" },
	{ code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "\u{1F1E8}\u{1F1ED}" },
	{ code: "CNY", name: "Chinese Yuan", symbol: "\u00A5", flag: "\u{1F1E8}\u{1F1F3}" },
	{ code: "INR", name: "Indian Rupee", symbol: "\u20B9", flag: "\u{1F1EE}\u{1F1F3}" },
	{ code: "MXN", name: "Mexican Peso", symbol: "MX$", flag: "\u{1F1F2}\u{1F1FD}" },
	{ code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "\u{1F1E7}\u{1F1F7}" },
	{ code: "KRW", name: "South Korean Won", symbol: "\u20A9", flag: "\u{1F1F0}\u{1F1F7}" },
	{ code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "\u{1F1F8}\u{1F1EC}" },
	{ code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "\u{1F1ED}\u{1F1F0}" },
	{ code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "\u{1F1F3}\u{1F1FF}" },
	{ code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "\u{1F1F8}\u{1F1EA}" },
	{ code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "\u{1F1F3}\u{1F1F4}" },
	{ code: "DKK", name: "Danish Krone", symbol: "kr", flag: "\u{1F1E9}\u{1F1F0}" },
	{ code: "PHP", name: "Philippine Peso", symbol: "\u20B1", flag: "\u{1F1F5}\u{1F1ED}" },
	{ code: "THB", name: "Thai Baht", symbol: "\u0E3F", flag: "\u{1F1F9}\u{1F1ED}" },
	{ code: "AED", name: "UAE Dirham", symbol: "AED", flag: "\u{1F1E6}\u{1F1EA}" },
	{ code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "\u{1F1F8}\u{1F1E6}" },
	{ code: "ZAR", name: "South African Rand", symbol: "R", flag: "\u{1F1FF}\u{1F1E6}" },
	{ code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "\u{1F1F2}\u{1F1FE}" },
	{ code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "\u{1F1EE}\u{1F1E9}" },
	{ code: "TWD", name: "New Taiwan Dollar", symbol: "NT$", flag: "\u{1F1F9}\u{1F1FC}" },
	{ code: "PLN", name: "Polish Zloty", symbol: "z\u0142", flag: "\u{1F1F5}\u{1F1F1}" },
	{ code: "TRY", name: "Turkish Lira", symbol: "\u20BA", flag: "\u{1F1F9}\u{1F1F7}" },
	{ code: "CZK", name: "Czech Koruna", symbol: "K\u010D", flag: "\u{1F1E8}\u{1F1FF}" },
	{ code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "\u{1F1ED}\u{1F1FA}" },
	{ code: "ILS", name: "Israeli Shekel", symbol: "\u20AA", flag: "\u{1F1EE}\u{1F1F1}" },
	{ code: "CLP", name: "Chilean Peso", symbol: "CL$", flag: "\u{1F1E8}\u{1F1F1}" },
	{ code: "COP", name: "Colombian Peso", symbol: "CO$", flag: "\u{1F1E8}\u{1F1F4}" },
	{ code: "PEN", name: "Peruvian Sol", symbol: "S/.", flag: "\u{1F1F5}\u{1F1EA}" },
	{ code: "ARS", name: "Argentine Peso", symbol: "AR$", flag: "\u{1F1E6}\u{1F1F7}" },
	{ code: "EGP", name: "Egyptian Pound", symbol: "E\u00A3", flag: "\u{1F1EA}\u{1F1EC}" },
	{ code: "NGN", name: "Nigerian Naira", symbol: "\u20A6", flag: "\u{1F1F3}\u{1F1EC}" },
	{ code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "\u{1F1F0}\u{1F1EA}" },
	{ code: "PKR", name: "Pakistani Rupee", symbol: "\u20A8", flag: "\u{1F1F5}\u{1F1F0}" },
	{ code: "BDT", name: "Bangladeshi Taka", symbol: "\u09F3", flag: "\u{1F1E7}\u{1F1E9}" },
	{ code: "VND", name: "Vietnamese Dong", symbol: "\u20AB", flag: "\u{1F1FB}\u{1F1F3}" },
];

/** Currencies for which we generate static pair pages (highest search volume) */
export const featuredCurrencyCodes = [
	"USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "INR", "CNY", "MXN",
	"BRL", "KRW", "SGD", "NZD", "PHP", "AED", "SAR", "ZAR", "MYR", "HKD",
] as const;

/** Curated list of the most-searched currency pairs */
export const popularPairs: [string, string][] = [
	["USD", "EUR"], ["EUR", "USD"], ["USD", "GBP"], ["GBP", "USD"],
	["USD", "INR"], ["INR", "USD"], ["USD", "JPY"], ["JPY", "USD"],
	["USD", "CAD"], ["CAD", "USD"], ["EUR", "GBP"], ["GBP", "EUR"],
	["EUR", "INR"], ["INR", "EUR"], ["USD", "AUD"], ["AUD", "USD"],
	["USD", "CHF"], ["CHF", "USD"], ["USD", "CNY"], ["CNY", "USD"],
	["USD", "MXN"], ["MXN", "USD"], ["USD", "BRL"], ["BRL", "USD"],
	["AED", "INR"], ["INR", "AED"], ["SAR", "INR"], ["INR", "SAR"],
	["GBP", "INR"], ["INR", "GBP"], ["SGD", "INR"], ["INR", "SGD"],
	["USD", "PHP"], ["PHP", "USD"], ["USD", "KRW"], ["KRW", "USD"],
];

export const currencyMap = new Map(currencies.map(c => [c.code, c]));

export function getCurrency(code: string): Currency | undefined {
	return currencyMap.get(code.toUpperCase());
}

export function parsePairSlug(slug: string): { from: string; to: string } | null {
	const match = slug.match(/^([a-z]{3})-to-([a-z]{3})$/i);
	if (!match) return null;
	const from = match[1]!.toUpperCase();
	const to = match[2]!.toUpperCase();
	if (!getCurrency(from) || !getCurrency(to) || from === to) return null;
	return { from, to };
}

export function toPairSlug(from: string, to: string): string {
	return `${from.toLowerCase()}-to-${to.toLowerCase()}`;
}

export function getAllPairSlugs(): string[] {
	const slugs: string[] = [];
	for (const from of featuredCurrencyCodes) {
		for (const to of featuredCurrencyCodes) {
			if (from !== to) slugs.push(toPairSlug(from, to));
		}
	}
	return slugs;
}

export function getRelatedPairs(code: string, limit = 10): string[] {
	return featuredCurrencyCodes
		.filter(c => c !== code)
		.slice(0, limit)
		.map(other => toPairSlug(code, other));
}

export function formatCurrency(amount: number, code: string): string {
	try {
		const noDecimals = ["JPY", "KRW", "VND", "IDR"];
		const isNoDecimal = noDecimals.includes(code);
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: code,
			minimumFractionDigits: isNoDecimal ? 0 : 2,
			maximumFractionDigits: isNoDecimal ? 0 : amount < 0.01 ? 6 : amount < 1 ? 4 : 2,
		}).format(amount);
	} catch {
		return `${amount.toFixed(2)} ${code}`;
	}
}

export const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest";

export const FRANKFURTER_API = "https://api.frankfurter.dev/v1";

/** Currencies supported by the Frankfurter API (ECB data) for historical rates */
export const FRANKFURTER_CURRENCIES = new Set([
	"AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP",
	"HKD", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR",
	"NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR",
]);

export function formatRate(rate: number): string {
	if (rate >= 100) return rate.toFixed(2);
	if (rate >= 1) return rate.toFixed(4);
	if (rate >= 0.01) return rate.toFixed(4);
	return rate.toFixed(6);
}

export const COMMON_AMOUNTS = [1, 5, 10, 25, 50, 100, 500, 1_000, 5_000, 10_000];
