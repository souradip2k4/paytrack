import prisma from "@/lib/prisma";
import { run } from "@/lib/utils";
import { format, isSameDay, isValid, parse } from "date-fns";
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
	const take = run<string, number>(ctx.req.query("take"), num => Number(num));
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
	const result = await prisma.entry.findMany({
		where: {
			user_id,
			date: {
				gte: from,
				lte: to,
			},
			amount: type,
		},
		select: {
			amount: true,
			category: true,
			category_id: true,
			date: true,
			id: true,
			message: true,
			tags: true,
			user: false,
			user_id: true,
		},
		take,
	});
	if (!result) throw new HTTPException(404);
	const modifiedData = result.map(value => ({
		...value,
		date: value.date.toJSON(),
		amount: value.amount.toNumber(),
	}));
	return ctx.json(modifiedData, { status: 200 });
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

	const agg = prisma.entry.aggregate({
		_avg: { amount: true },
		_sum: { amount: true },
		where: {
			user_id,
			date: {
				gte: from,
				lte: to,
			},
		},
	});
	const amount = prisma.entry.groupBy({
		by: ["date"],
		where: {
			user_id,
			date: {
				gte: from,
				lte: to,
			},
		},
		orderBy: {
			date: "asc",
		},
		_sum: {
			amount: true,
		},
	});

	const income = prisma.entry.groupBy({
		by: ["date"],
		where: {
			user_id,
			date: {
				gte: from,
				lte: to,
			},
			amount: { gte: 0 },
		},
		orderBy: { date: "asc" },
		_sum: {
			amount: true,
		},
	});

	const expense = prisma.entry.groupBy({
		by: ["date"],
		where: {
			user_id,
			date: {
				gte: from,
				lte: to,
			},
			amount: { lte: 0 },
		},
		orderBy: { date: "asc" },
		_sum: {
			amount: true,
		},
	});

	const entries = await Promise.all([agg, amount, income, expense]);

	let incindex = 0;
	let expindex = 0;
	const points = entries[1].map(amount => {
		const point = {
			date: format(amount.date, "yyyy-MM-dd"),
			amount: Number(amount._sum.amount),
			income: 0,
			expense: 0,
		};
		if (
			incindex >= 0 &&
			incindex < entries[2].length &&
			isSameDay(amount.date, entries[2][incindex].date)
		) {
			point.income = Number(entries[2][incindex]._sum.amount);
			incindex++;
		}
		if (
			expindex >= 0 &&
			expindex < entries[3].length &&
			isSameDay(amount.date, entries[3][expindex].date)
		) {
			point.expense = Math.abs(Number(entries[3][expindex]._sum.amount));
			expindex++;
		}
		return point;
	});

	const data = {
		points,
		sum: Number(entries[0]._sum.amount),
		avg: Number(entries[0]._avg.amount),
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
		select: { id: true, key: true, user: false, user_id: true },
	});
	return ctx.json({ data: result }, { status: 200 });
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
