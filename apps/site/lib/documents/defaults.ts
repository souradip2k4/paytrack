import { nanoid } from "nanoid";
import type { Document, DocumentType } from "./schema";

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => {
	const d = new Date();
	d.setDate(d.getDate() + n);
	return d.toISOString().slice(0, 10);
};

type DocTypeConfig = {
	labels: {
		title: string;
		number: string;
		issueDate: string;
		dueDate: string | null;
		totalCta: string;
	};
	defaults: {
		prefix: string;
		paymentTerms: string;
		dueOffsetDays: number | null;
	};
};

export const DOC_TYPE_CONFIG: Record<DocumentType, DocTypeConfig> = {
	invoice: {
		labels: {
			title: "Invoice",
			number: "Invoice #",
			issueDate: "Issue date",
			dueDate: "Due date",
			totalCta: "Amount due",
		},
		defaults: {
			prefix: "INV-",
			paymentTerms: "Payment due within 30 days.",
			dueOffsetDays: 30,
		},
	},
	receipt: {
		labels: {
			title: "Receipt",
			number: "Receipt #",
			issueDate: "Paid on",
			dueDate: null,
			totalCta: "Amount paid",
		},
		defaults: {
			prefix: "RCT-",
			paymentTerms: "",
			dueOffsetDays: null,
		},
	},
	estimate: {
		labels: {
			title: "Estimate",
			number: "Estimate #",
			issueDate: "Issued",
			dueDate: "Valid until",
			totalCta: "Estimated total",
		},
		defaults: {
			prefix: "EST-",
			paymentTerms: "This estimate is valid for 30 days.",
			dueOffsetDays: 30,
		},
	},
};

export function createEmptyDocument(type: DocumentType): Document {
	const cfg = DOC_TYPE_CONFIG[type];
	return {
		type,
		template: "classic",
		theme: { primary: "#0f172a", accent: "#64748b" },
		company: {
			name: "",
			address: "",
			email: "",
			phone: "",
			logo: "",
			signature: "",
			customFields: [],
		},
		client: {
			name: "",
			address: "",
			email: "",
			phone: "",
			customFields: [],
		},
		meta: {
			prefix: cfg.defaults.prefix,
			serial: "0001",
			issueDate: today(),
			dueDate:
				cfg.defaults.dueOffsetDays === null ?
					""
				:	plusDays(cfg.defaults.dueOffsetDays),
			paymentTerms: cfg.defaults.paymentTerms,
			currency: "INR",
			customFields: [],
		},
		items: [
			{
				id: nanoid(8),
				name: "",
				description: "",
				quantity: 1,
				price: 0,
			},
		],
		totals: { taxPercent: 0, discountPercent: 0 },
		notes: "",
		terms: "",
		extra: [],
	};
}

export function newKV(): { id: string; label: string; value: string } {
	return { id: nanoid(8), label: "", value: "" };
}

export function newItem() {
	return {
		id: nanoid(8),
		name: "",
		description: "",
		quantity: 1,
		price: 0,
	};
}
