import { notFound } from "next/navigation";
import { z } from "zod";

const recordIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);

export function parseRecordId(value: string): string {
  const parsed = recordIdSchema.safeParse(value);
  if (!parsed.success) {
    notFound();
  }
  return parsed.data;
}
