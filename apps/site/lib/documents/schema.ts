import { z } from "zod";

export const DOCUMENT_TYPES = ["invoice", "receipt", "estimate"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const TEMPLATE_IDS = ["classic", "modern"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

const kvSchema = z.object({
	id: z.string().min(1),
	label: z.string().max(120),
	value: z.string().max(500),
});
export type KV = z.infer<typeof kvSchema>;

const dataUrlImage = z
	.string()
	.max(1_400_000)
	.refine(v => v === "" || v.startsWith("data:image/"), {
		message: "Must be a data:image URL",
	});

const partySchema = z.object({
	name: z.string().max(200).default(""),
	address: z.string().max(1000).default(""),
	email: z.string().max(200).default(""),
	phone: z.string().max(60).default(""),
	customFields: z.array(kvSchema).max(20).default([]),
});

const companySchema = partySchema.extend({
	logo: dataUrlImage.default(""),
	signature: dataUrlImage.default(""),
});

const metaSchema = z.object({
	prefix: z.string().max(20).default("INV-"),
	serial: z.string().max(40).default("0001"),
	issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	dueDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.or(z.literal(""))
		.default(""),
	paymentTerms: z.string().max(200).default(""),
	currency: z.string().min(1).max(8).default("INR"),
	customFields: z.array(kvSchema).max(20).default([]),
});

const itemSchema = z.object({
	id: z.string().min(1),
	name: z.string().max(200).default(""),
	description: z.string().max(500).default(""),
	quantity: z.number().min(0).max(1_000_000).default(1),
	price: z.number().min(0).max(1_000_000_000).default(0),
});
export type DocumentItem = z.infer<typeof itemSchema>;

const totalsSchema = z.object({
	taxPercent: z.number().min(0).max(100).default(0),
	discountPercent: z.number().min(0).max(100).default(0),
});

export const documentSchema = z.object({
	type: z.enum(DOCUMENT_TYPES),
	template: z.enum(TEMPLATE_IDS).default("classic"),
	theme: z
		.object({
			primary: z.string().max(20).default("#0f172a"),
			accent: z.string().max(20).default("#64748b"),
		})
		.default({ primary: "#0f172a", accent: "#64748b" }),
	company: companySchema,
	client: partySchema,
	meta: metaSchema,
	items: z.array(itemSchema).max(200).default([]),
	totals: totalsSchema.default({ taxPercent: 0, discountPercent: 0 }),
	notes: z.string().max(2000).default(""),
	terms: z.string().max(2000).default(""),
	extra: z.array(kvSchema).max(20).default([]),
});
export type Document = z.infer<typeof documentSchema>;

export const sharePayloadSchema = documentSchema;

export const MAX_SHARE_BYTES = 1_500_000;
export const SHARE_TTL_SECONDS = 60 * 60 * 24 * 90;
