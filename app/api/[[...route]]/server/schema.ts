import { z } from "zod";
import { transformers } from "./utils";

/**
 * ===========================
 * ENTRY SCHEMAS
 * ===========================
 */
export const entrySchema = z.object({
	id: z.string(),
	amount: z.number(),
	date: z.string(),
	message: z.string().nullable(),
	category_id: z.string().nullable(),
	user_id: z.string(),
	tags: z.array(z.object({ id: z.string() })),
});

export const getEntryResponseSchema = entrySchema;

export const getEntriesQueryParamsSchema = z.object({
	page_size: z.coerce.number().default(10),
	page: z.coerce.number().default(1),
	from: z.string().date().optional().transform(transformers.date.parse),
	to: z.string().date().optional().transform(transformers.date.parse),
	type: z.enum(["inc", "exp"]).optional(),
	category: z.string().optional().transform(transformers.commaSeparatedList),
	tag: z.string().optional().transform(transformers.commaSeparatedList),
});

export const getEntriesResponseSchema = z.object({
	page: z.coerce.number(),
	page_size: z.coerce.number(),
	total: z.coerce.number(),
	has_prev: z.coerce.boolean(),
	has_next: z.coerce.boolean(),
	data: z.array(entrySchema),
});

export const postEntryRequestBodySchema = z.object({
	user_id: z.string(),
	amount: z.coerce.number(),
	message: z.string().max(200),
	category_id: z.string().optional(),
	tag_ids: z.array(z.string()).optional(),
	date: z.coerce.string().date(),
});

export const postEntriesRequestBodySchema = z.array(postEntryRequestBodySchema);

export const putEntryRequestBodySchema = z.object({
	amount: z.coerce.number().optional(),
	message: z.string().max(200).optional(),
	category_id: z.string().optional(),
	tag_ids: z.array(z.string()).optional(),
});

export const putEntriesRequestBodySchema = z.array(putEntryRequestBodySchema);

export const deleteEntriesRequestBodySchema = z.object({
	ids: z.array(z.string()),
});

export type Entry = z.infer<typeof entrySchema>;
export type GetEntryResponse = z.infer<typeof getEntryResponseSchema>;
export type GetEntriesQueryParams = z.infer<typeof getEntriesQueryParamsSchema>;
export type GetEntriesResponse = z.infer<typeof getEntriesResponseSchema>;
export type PostEntryRequestBody = z.infer<typeof postEntryRequestBodySchema>;
export type PostEntriesRequestBody = z.infer<
	typeof postEntriesRequestBodySchema
>;
export type PutEntryRequestBody = z.infer<typeof putEntryRequestBodySchema>;
export type PutEntriesRequestBody = z.infer<typeof putEntriesRequestBodySchema>;
export type DeleteEntriesRequestBody = z.infer<
	typeof deleteEntriesRequestBodySchema
>;

/**
 * ===========================
 * TAGS SCHEMA
 * ===========================
 */
export const tagSchema = z.object({
	id: z.string(),
	name: z.string(),
	user_id: z.string(),
});

export const getTagResponseSchema = tagSchema;

export const postTagRequestBodySchema = z.object({
	name: z.string(),
	user_id: z.string(),
});

export const putTagRequestBodySchema = z.object({
	name: z.string().optional(),
});

export const deleteTagRequestBodySchema = z.object({
	id: z.string(),
});

export type Tag = z.infer<typeof tagSchema>;
export type GetTagResponse = z.infer<typeof getTagResponseSchema>;
export type PostTagRequestBody = z.infer<typeof postTagRequestBodySchema>;
export type PutTagRequestBody = z.infer<typeof putTagRequestBodySchema>;
export type DeleteTagRequestBody = z.infer<typeof deleteTagRequestBodySchema>;

/**
 * ===========================
 * CATEGORY SCHEMA
 * ===========================
 */
export const categorySchema = z.object({
	id: z.string(),
	name: z.string(),
});

const getCategoryResponseSchema = categorySchema;

export const postCategoryRequestBodySchema = z.object({
	name: z.string(),
	user_id: z.string(),
});

export const putCategoryRequestBodySchema = z.object({
	name: z.string().optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type GetCategoryResponse = z.infer<typeof getCategoryResponseSchema>;
export type PostCategoryRequestBody = z.infer<
	typeof postCategoryRequestBodySchema
>;
export type PutCategoryRequestBody = z.infer<
	typeof putCategoryRequestBodySchema
>;
