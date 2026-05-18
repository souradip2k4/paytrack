import "server-only";
import Redis from "ioredis";

const globalForRedis = global as unknown as {
	marketingRedis?: Redis;
};

function getRedisUrl(): string {
	const url = process.env.MARKETING_SITE_REDIS_URL;
	if (!url) throw new Error("MARKETING_SITE_REDIS_URL is not set");
	return url;
}

export function getMarketingRedis(): Redis {
	if (globalForRedis.marketingRedis) return globalForRedis.marketingRedis;
	const client = new Redis(getRedisUrl(), {
		lazyConnect: false,
		maxRetriesPerRequest: 2,
	});
	if (process.env.NODE_ENV !== "production") {
		globalForRedis.marketingRedis = client;
	}
	return client;
}

export const SHARE_KEY_PREFIX = "marketing:doc:share:";
export const RATE_KEY_PREFIX = "marketing:doc:share:rl:";

export function shareKey(slug: string) {
	return `${SHARE_KEY_PREFIX}${slug}`;
}

export function rateKey(ip: string) {
	return `${RATE_KEY_PREFIX}${ip}`;
}
