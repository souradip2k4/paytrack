import { Redis } from "ioredis";

const globalForRedis = global as unknown as { redis?: Redis };

const getRedisUrl = () => {
	if (!process.env.REDIS_URL) throw new Error("REDIS_URL is not set");
	return process.env.REDIS_URL;
};

export function getRedisClient() {
	if (globalForRedis.redis) return globalForRedis.redis;

	const client = new Redis(getRedisUrl());
	if (process.env.NODE_ENV !== "production") globalForRedis.redis = client;

	return client;
}

/**
 * Lazily resolves the shared Redis client so importing server modules does not
 * eagerly require REDIS_URL during build-time evaluation.
 */
export const redis = new Proxy({} as Redis, {
	get(_target, property, receiver) {
		const client = getRedisClient();
		const value = Reflect.get(client, property, receiver);

		return typeof value === "function" ? value.bind(client) : value;
	},
});
