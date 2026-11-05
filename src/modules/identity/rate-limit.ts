import "server-only";

import { headers } from "next/headers";

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
  return consumeRateLimit(`${policy}:${address}`, limit, windowMs);
}
