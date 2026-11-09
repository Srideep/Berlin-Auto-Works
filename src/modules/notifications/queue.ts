import { Queue, Worker } from "bullmq";

import { getQueueRedis } from "@/lib/redis";
import { deliverEmail } from "@/modules/notifications/deliver";
import type { OutboundEmail } from "@/modules/notifications/message";

const queueName = "notifications";

let queue: Queue<OutboundEmail> | undefined;

function getQueue(): Queue<OutboundEmail> | null {
  const connection = getQueueRedis();
  if (!connection) {
    return null;
  }
  if (!queue) {
    queue = new Queue<OutboundEmail>(queueName, { connection });
  }
  return queue;
}

/** Enqueue the email, or send it on this request when Redis is not configured. */
export async function enqueueEmail(message: OutboundEmail): Promise<void> {
  const notifications = getQueue();
  if (!notifications) {
    await deliverEmail(message);
    return;
  }
  await notifications.add(message.template, message, {
    removeOnComplete: 100,
    attempts: 5,
    backoff: { type: "exponential", delay: 10_000 },
  });
}

export function startNotificationWorker(): Worker<OutboundEmail> {
  const connection = getQueueRedis();
  if (!connection) {
    throw new Error("REDIS_URL is not set.");
  }
  return new Worker<OutboundEmail>(
    queueName,
    async (job) => {
      await deliverEmail(job.data);
    },
    { connection },
  );
}
