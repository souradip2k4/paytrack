import prisma from "@/lib/prisma";
import { run } from "@/lib/utils";
import { parse, isValid } from "date-fns";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const users = new Hono();

/**
 * USER HANDLERS
 * documentation: docs/api/entries
 */
users.get("/"); // TODO: add admin auth

// TODO: add admin / selected api auth
users.get("/:id", async (ctx) => {
    const { id } = ctx.req.param();
    const result = await prisma.user.findUnique({
        where: { id },
        select: {
            apiKeys: false,
            categories: false,
            create_at: true,
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

users.get("/:user_id/entries", async (ctx) => {
    const { user_id } = ctx.req.param();
    const take = run<string, number>(ctx.req.query("take"), (num) => Number(num));
    const from = run<string, Date>(ctx.req.query("from"), (date) =>
        parse(date, "yyyy-MM-dd", new Date()),
    );
    const to = run<string, Date>(ctx.req.query("to"), (date) =>
        parse(date, "yyyy-MM-dd", new Date()),
    );
    const type = run<string, any>(ctx.req.query("type"), (type) => {
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
    const modifiedData = result.map((value) => ({
        ...value,
        date: value.date.toJSON(),
        amount: value.amount.toNumber(),
    }));
    return ctx.json(modifiedData, { status: 200 });
});

users.get("/:user_id/entries/_datapoints", async (ctx) => {
    const { user_id } = ctx.req.param();
    const from = run<string, Date>(ctx.req.query("from"), (date) =>
        parse(date, "yyyy-MM-dd", new Date())
    );
    const to = run<string, Date>(ctx.req.query("to"), (date) =>
        parse(date, "yyyy-MM-dd", new Date())
    );
    if (!isValid(from) || !isValid(to)) throw new HTTPException(422);
    const result = await prisma.entry.groupBy({
        by: ["date"],
        where: {
            user_id,
            date: {
                gte: from,
                lte: to,
            }
        },
        _sum: {
            amount: true
        }
    });
    const modifiedData = result.map((value) => ({ date: value.date, amount: (value._sum.amount !== null) ? value._sum.amount.toNumber() : 0 }))
    return ctx.json(modifiedData, { status: 200 });
});

users.get("/:user_id/categories", async (ctx) => {
    const { user_id } = ctx.req.param();
    const result = await prisma.category.findMany({
        where: { user_id },
        select: {
            create_at: true,
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

users.get("/:user_id/api-keys", async (ctx) => {
    const { user_id } = ctx.req.param();
    const result = await prisma.apiKey.findMany({
        where: { user_id },
        select: { id: true, key: true, user: false, user_id: true },
    });
    return ctx.json({ data: result }, { status: 200 });
});

users.get("/:user_id/tags", async (ctx) => {
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
