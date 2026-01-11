import { Redis } from "ioredis";

const globalForRedis = global as unknown as { redis: Redis };

const getRedisUrl = () => {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL is not set");
  return process.env.REDIS_URL
}

export const redis = globalForRedis.redis || new Redis(getRedisUrl());

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
