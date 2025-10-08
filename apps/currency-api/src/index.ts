import { Hono } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";

const app = new Hono();

/**
 * GET /get-price/<amount>/<ip>
 * Returns the current price of based on users's local currency.
 * amount: The amount of money (in USD) to be converted to local currency.
 * ip: Request IP address, used to determine the user's local currency.
 */
app.get("/get-price/:amount", async ctx => {
	let { amount } = ctx.req.param();

	const connInfo = getConnInfo(ctx);
	const ip = connInfo.remote.address;
	const ipApiRes = await fetch(
		`http://ip-api.com/json/${ip}?fields=status,message,currency`,
	);

	if (!ipApiRes.ok) {
		return ctx.json({
			error: "Failed to fetch IP info.",
			reason: ipApiRes.statusText,
		});
	}

	const ipApiData = (await ipApiRes.json()) as { currency: string };

	const base = "USD";
	const target = ipApiData?.currency;

	if (!target) {
		return ctx.json({ base, target, amount, rate: 1 });
	}

	const cxApiRes = await fetch(
		`https://api.frankfurter.dev/v1/2025-08-10?base=${base}&symbols=${target}`,
	);
	if (!cxApiRes.ok) {
		return ctx.json({
			error: "Failed to fetch currency exchange rate.",
			reason: cxApiRes.statusText,
		});
	}

	const cxRates = (await cxApiRes.json()) as {
		base: string;
		data: string;
		rates: Record<string, number>;
	};

	const rate = cxRates.rates[target];
	return ctx.json({
		base,
		target,
		data: cxRates.data,
		rate,
		amount: rate * parseFloat(amount),
	});
});

export default app;
