import "server-only";

import { headers } from "next/headers";

import { getRateLimitRedis } from "@/lib/redis";

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export const rateLimitPolicies = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 },
  signup: { limit: 5, windowMs: 60 * 60 * 1000 },
  forgotPassword: { limit: 5, windowMs: 60 * 60 * 1000 },
  resetPassword: { limit: 5, windowMs: 60 * 60 * 1000 },
  booking: { limit: 8, windowMs: 60 * 60 * 1000 },
  estimate: { limit: 8, windowMs: 60 * 60 * 1000 },
  upload: { limit: 20, windowMs: 60 * 60 * 1000 },
} as const;

export type RateLimitPolicyName = keyof typeof rateLimitPolicies;

/**
 * In-memory stand-in for the Redis limiter. Counts reset when the process
 * restarts and are not shared across instances.
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitDecision {
  const now = Date.now();
  const existing = buckets.get(key);
  const fresh = (existing?.hits ?? []).filter((hit) => now - hit < windowMs);

  if (fresh.length >= limit) {
    const oldest = fresh[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowMs - (now - oldest)) / 1000),
    );
    buckets.set(key, { hits: fresh });
    return { allowed: false, retryAfterSeconds };
  }

  fresh.push(now);
  buckets.set(key, { hits: fresh });
  return { allowed: true, retryAfterSeconds: 0 };
}

async function consumeRedisRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitDecision | null> {
  const redis = getRateLimitRedis();
  if (!redis) {
    return null;
  }
  const bucket = Math.floor(Date.now() / windowMs);
  const redisKey = `rl:${key}:${bucket}`;
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.pexpire(redisKey, windowMs);
  }
  if (count > limit) {
    const ttl = await redis.pttl(redisKey);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(ttl / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function enforceRateLimit(
  policy: RateLimitPolicyName,
): Promise<RateLimitDecision> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const address =
    forwarded?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";
  const { limit, windowMs } = rateLimitPolicies[policy];
  const key = `${policy}:${address}`;
  const redisDecision = await consumeRedisRateLimit(key, limit, windowMs);
  if (redisDecision) {
    return redisDecision;
  }
  return consumeRateLimit(key, limit, windowMs);
}
