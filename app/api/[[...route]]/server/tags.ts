/**
 * TAG HANDLERS
 * documentation: docs/api/tags
 */
import prisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { postTagRequestBodySchema, putTagRequestBodySchema } from "./schema";

export const tags = new Hono();

tags.get("/:id", async ctx => {
	const { id } = ctx.req.param();
	const result = await prisma.tag.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			user_id: true,
			user: false,
			entries: false,
			updated_at: false,
			created_at: false,
		},
	});
	if (!result) throw new HTTPException(404);
	return ctx.json(result, { status: 200 });
});

tags.post("/", zValidator("json", postTagRequestBodySchema), async ctx => {
	const payload = ctx.req.valid("json");
	await prisma.tag.create({
		data: {
			name: payload.name,
			user_id: payload.user_id,
		},
	});
	return ctx.json({}, { status: 200 });
});

tags.put("/:id", zValidator("json", putTagRequestBodySchema), async ctx => {
	const { id } = ctx.req.param();
	const payload = ctx.req.valid("json");
	await prisma.tag.update({
		where: { id },
		data: { name: payload.name },
	});
});

tags.delete("/:id", async ctx => {
	const { id } = ctx.req.param();
	await prisma.tag.delete({ where: { id } });
	return ctx.json({}, { status: 200 });
});
