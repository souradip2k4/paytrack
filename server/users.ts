import { padDates } from "@/lib/date-utils";
import prisma from "@/lib/prisma";
import { catchInvalid, run } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import {
	getDatapointsByCategory,
	getDatapointsByDate,
	getGroupedExpense,
	getGroupedIncome,
	getSum,
} from "@prisma/client/sql";
import { differenceInDays, isValid, parse } from "date-fns";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const users = new Hono();

/**
 * USER HANDLERS
 * documentation: docs/api/entries
 */
users.get("/"); // TODO: add admin auth

// TODO: add admin / selected api auth
users.get("/:id", async ctx => {
	const { id } = ctx.req.param();
	const result = await prisma.user.findUnique({
		where: { id },
		select: {
			apiKeys: false,
			categories: false,
			created_at: true,
			email: true,
			entries: false,
			first_name: true,
			last_name: true,
			id: true,
			tags: false,
			updated_at: true,
			username: true,
		},
	});
	return ctx.json(result, { status: 200 });
});

users.get("/:user_id/entries", async ctx => {
	const { user_id } = ctx.req.param();
	const take =
		run<string, number>(ctx.req.query("page_size"), num => Number(num)) ??
		10;
	const page =
		run<string, number>(ctx.req.query("page"), num => Number(num)) ?? 1;
	const skip = (page - 1) * take;
	const from = run<string, Date>(ctx.req.query("from"), date =>
		parse(date, "yyyy-MM-dd", new Date()),
	);
	const to = run<string, Date>(ctx.req.query("to"), date =>
		parse(date, "yyyy-MM-dd", new Date()),
	);
	const type = run<string, any>(ctx.req.query("type"), type => {
		if (type === "inc") return { gte: 0 };
		else if (type === "exp") return { lte: 0 };
		return undefined;
	});

	const categories = (() => {
		const c = ctx.req.query("category");
		if (!c) return undefined;
		return c.split(",");
	})();

	const tags = (() => {
		const t = ctx.req.query("tag");
		if (!t) return undefined;
		return t.split(",");
	})();

	const where: Prisma.EntryWhereInput = {
		user_id,
		date: {
			gte: from,
			lte: to,
		},
		amount: type,
		tags: { some: { id: { in: tags } } },
	};

	if (categories && categories.length > 0) {
		where.category_id = { in: categories };
	}

	if (tags && tags.length > 0) {
		where.tags = { every: { id: { in: tags } } };
	}

	const result = await prisma.entry.findMany({
		where,
		orderBy: {
			created_at: "desc",
		},
		select: {
			amount: true,
			category: false,
			category_id: true,
			date: true,
			id: true,
			message: true,
			tags: { select: { id: true } },
			user: false,
			user_id: true,
		},
		take,
		skip,
	});
	if (!result) throw new HTTPException(404);
	const modifiedData = result.map(value => ({
		...value,
		date: value.date.toJSON(),
		amount: value.amount.toNumber(),
	}));
	return ctx.json(
		{
			page,
			page_size: take,
			total: result.length,
			has_prev: take > 1,
			has_next: result.length === take,
			data: modifiedData,
		},
		{ status: 200 },
	);
});

users.get("/:user_id/entries/_datapoints", async ctx => {
	const { user_id } = ctx.req.param();
	const from = run<string, Date>(ctx.req.query("from"), date =>
		parse(date, "yyyy-MM-dd", new Date()),
	);
	const to = run<string, Date>(ctx.req.query("to"), date =>
		parse(date, "yyyy-MM-dd", new Date()),
	);
	if (!isValid(from) || !isValid(to)) throw new HTTPException(422);
	if (typeof from === "undefined" || typeof to === "undefined")
		throw new HTTPException(422);

	const [sum, date, category, maxIncomes, maxExpenses] =
		await prisma.$transaction([
			prisma.$queryRawTyped(getSum(user_id, from, to)),
			prisma.$queryRawTyped(getDatapointsByDate(user_id, from, to)),
			prisma.$queryRawTyped(getDatapointsByCategory(user_id, from, to)),
			prisma.$queryRawTyped(getGroupedIncome(user_id, from, to, 10)),
			prisma.$queryRawTyped(getGroupedExpense(user_id, from, to, 10)),
		]);

	const count = differenceInDays(to, from);

	const data = {
		sum: {
			total: sum[0].total?.toNumber() ?? 0,
			income: sum[0].income?.toNumber() ?? 0,
			expense: sum[0].expense?.toNumber() ?? 0,
		},
		avg: {
			total:
				catchInvalid(
					run(sum[0].total, x => x.toNumber()),
					0,
				) / count,
			income:
				catchInvalid(
					run(sum[0].income, x => x.toNumber()),
					0,
				) / count,
			expense:
				catchInvalid(
					run(sum[0].expense, x => x.toNumber()),
					0,
				) / count,
		},
		date: padDates(date, from, to),
		category: category.map(x => ({
			...x,
			total: x.total?.toNumber() ?? 0,
			income: x.income?.toNumber() ?? 0,
			expense: x.expense?.toNumber() ?? 0,
		})),
		max: {
			income: maxIncomes.map(x => ({
				...x,
				value: x.income?.toNumber() ?? 0,
			})),
			expense: maxExpenses.map(x => ({
				...x,
				value: x.expense?.toNumber() ?? 0,
			})),
		},
	};
	return ctx.json(data, { status: 200 });
});

users.get("/:user_id/categories", async ctx => {
	const { user_id } = ctx.req.param();
	const result = await prisma.category.findMany({
		where: { user_id },
		select: {
			created_at: true,
			entries: { select: { _count: true } },
			id: true,
			name: true,
			updated_at: true,
			user: false,
			user_id: true,
		},
	});
	if (!result) {
		throw new HTTPException(404);
	}
	return ctx.json(result, { status: 200 });
});

users.get("/:user_id/api-keys", async ctx => {
	const { user_id } = ctx.req.param();
	const result = await prisma.apiKey.findMany({
		where: { user_id },
		select: {
			id: true,
			name: true,
			key: false,
			user: false,
			user_id: true,
			created_at: true,
			expire_at: true,
			permissions: true,
		},
	});
	return ctx.json(result, { status: 200 });
});

users.get("/:user_id/tags", async ctx => {
	const { user_id } = ctx.req.param();
	const result = await prisma.tag.findMany({
		where: { user_id },
		select: {
			_count: true,
			entries: false,
			id: true,
			name: true,
			user: false,
			user_id: true,
		},
	});
	if (!result) {
		throw new HTTPException(404);
	}
	return ctx.json({ data: result }, { status: 200 });
});

users.post("/");
users.put("/:id");
users.delete("/:id");
