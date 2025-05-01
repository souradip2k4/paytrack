/**
 * ENTRIES HANDLERS
 * documentation: docs/api/entries
 */
import prisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
	deleteEntriesRequestBodySchema,
	postEntriesRequestBodySchema,
	postEntryRequestBodySchema,
	putEntryRequestBodySchema,
	type Entry,
} from "./schema";
import { transformers } from "./utils";

export const entries = new Hono();

entries.get("/:id", async ctx => {
	const { id } = ctx.req.param();
	const result = await prisma.entry.findUnique({
		where: { id },
		select: {
			id: true,
			user_id: true,
			user: false,
			amount: true,
			date: true,
			message: true,
			tags: {
				select: {
					id: true,
					user: false,
					created_at: false,
					updated_at: false,
					entries: false,
					name: false,
					user_id: false,
				},
			},
			category: false,
			category_id: true,
		},
	});
	if (!result) throw new HTTPException(404);
	const data: Entry = {
		...result,
		amount: result.amount.toNumber(),
		date: transformers.datetime.format(result.date),
	};
	return ctx.json(data, { status: 200 });
});

entries.post("/", zValidator("json", postEntryRequestBodySchema), async ctx => {
	const payload = ctx.req.valid("json");
	const result = await prisma.entry.create({
		data: {
			amount: payload.amount,
			message: payload.message,
			date: payload.date,
			user_id: payload.user_id,
			category_id: payload.category_id,
			tags: {
				connect: payload.tag_ids?.map(id => ({ id })),
			},
		},
	});
	return ctx.json({ id: result.id }, { status: 200 });
});

// Creates new expenses. Takes in array of expenses
// TODO: test the performance of
// - A) separting entries without tags and performing a single createMany query
// - B) using this transaction approach to create multiple entries
entries.post(
	"/all",
	zValidator("json", postEntriesRequestBodySchema),
	async ctx => {
		const payload = ctx.req.valid("json");
		try {
			const result = await prisma.$transaction(
				payload.map(x => {
					return prisma.entry.create({
						data: {
							amount: x.amount,
							message: x.message,
							date: transformers.date.parse_defined(x.date),
							user_id: x.user_id,
							category_id: x.category_id,
							tags: {
								connect: x.tag_ids?.map(id => ({ id })),
							},
						},
					});
				}),
			);
			return ctx.json({ count: result.length }, { status: 200 });
		} catch (e) {
			console.log(e);
			return ctx.json({}, { status: 400 });
		}
	},
);

// Updates a single entry
entries.put(
	"/:id",
	zValidator("json", putEntryRequestBodySchema),
	async ctx => {
		const { id } = ctx.req.param();
		const payload = ctx.req.valid("json");
		await prisma.entry.update({
			where: { id },
			data: {
				amount: payload.amount,
				message: payload.message,
				category_id: payload.category_id,
				tags: {
					connect: payload.tag_ids?.map(id => ({ id })),
				},
			},
		});
		return ctx.json({}, { status: 200 });
	},
);

entries.delete(
	"/",
	zValidator("json", deleteEntriesRequestBodySchema),
	async ctx => {
		const payload = ctx.req.valid("json");
		await prisma.entry.deleteMany({
			where: { id: { in: payload.ids } },
		});
		return ctx.json({}, { status: 200 });
	},
);

entries.delete("/:id", async ctx => {
	const { id } = ctx.req.param();
	await prisma.entry.delete({ where: { id } });
	return ctx.json(null, { status: 200 });
});
