import type { Document } from "./schema";

export type Totals = {
	subtotal: number;
	discount: number;
	tax: number;
	grandTotal: number;
};

export function computeTotals(doc: Document): Totals {
	const subtotal = doc.items.reduce(
		(sum, item) => sum + item.quantity * item.price,
		0,
	);
	const discount = (subtotal * doc.totals.discountPercent) / 100;
	const afterDiscount = subtotal - discount;
	const tax = (afterDiscount * doc.totals.taxPercent) / 100;
	const grandTotal = afterDiscount + tax;
	return {
		subtotal: round2(subtotal),
		discount: round2(discount),
		tax: round2(tax),
		grandTotal: round2(grandTotal),
	};
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

const CURRENCY_FORMATTERS = new Map<string, Intl.NumberFormat>();

export function formatMoney(amount: number, currency: string): string {
	let formatter = CURRENCY_FORMATTERS.get(currency);
	if (!formatter) {
		try {
			formatter = new Intl.NumberFormat(undefined, {
				style: "currency",
				currency,
				maximumFractionDigits: 2,
			});
		} catch {
			formatter = new Intl.NumberFormat(undefined, {
				maximumFractionDigits: 2,
			});
		}
		CURRENCY_FORMATTERS.set(currency, formatter);
	}
	return formatter.format(amount);
}

export function documentNumber(doc: Document): string {
	return `${doc.meta.prefix}${doc.meta.serial}`;
}
