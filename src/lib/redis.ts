import Redis from "ioredis";

let rateLimitClient: Redis | undefined;
let queueClient: Redis | undefined;

export function redisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL);
}

export function getRateLimitRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }
  if (!rateLimitClient) {
    rateLimitClient = new Redis(url, { maxRetriesPerRequest: 1 });
  }
  return rateLimitClient;
}

/** BullMQ requires maxRetriesPerRequest to be null. */
export function getQueueRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }
  if (!queueClient) {
    queueClient = new Redis(url, { maxRetriesPerRequest: null });
  }
  return queueClient;
}
