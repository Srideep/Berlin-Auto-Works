import "dotenv/config";

import { startNotificationWorker } from "@/modules/notifications/queue";

const worker = startNotificationWorker();

worker.on("failed", (job, error) => {
  console.error(
    JSON.stringify({
      queue: "notifications",
      jobId: job?.id ?? null,
      message: error.message,
    }),
  );
});

console.info("Notification worker is waiting for jobs.");
