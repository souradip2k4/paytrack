import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { handle } from "hono/vercel";
import { Hono } from "hono";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { entries as entriesRouter } from "@/server/entries";
import { users as usersRouter } from "@/server/users";
import { tags as tagsRouter } from "@/server/tags";
import { categories as categoriesRouter } from "@/server/categories";
import { apiKeys as apiKeysRouter } from "@/server/api-keys";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

const apiAuthMiddleware = createMiddleware(async (ctx, next) => {
    const url = new URL(ctx.req.url);
    const allowed = (process.env.APP_URL !== undefined) && (url.origin === new URL(process.env.APP_URL).origin);
    if (allowed) {
        return await next();
    }
    const token = ctx.req.header("x-authorization");
    if (typeof token === "string") {
        if (token === process.env.MASTER_API_KEY) {
            return await next();
        }
        const result = await prisma.apiKey.findUnique({ where: { key: token } });
        if (result) return await next();
    }
    throw new HTTPException(422, { message: "Unauthorized" });
});

app.use("*", apiAuthMiddleware);

app.get("/ping", (ctx) => ctx.json({ success: true }));

app.route("/entries", entriesRouter);
app.route("/users", usersRouter);
app.route("/tags", tagsRouter);
app.route("/categories", categoriesRouter);
app.route("/api-keys", apiKeysRouter);
app.route("/settings");

app.onError((err, ctx) => {
    if (err instanceof HTTPException) return err.getResponse();
    else if (err instanceof PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                return new HTTPException(409).getResponse();
        }
    }
    console.log(err);
    return ctx.json({}, { status: 400 });
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
