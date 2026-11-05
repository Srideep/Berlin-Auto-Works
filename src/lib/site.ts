import { z } from "zod";

const siteUrlSchema = z.string().url();

export function getSiteUrl(): URL {
  const parsed = siteUrlSchema.safeParse(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  );

  if (!parsed.success) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
  }

  return new URL(parsed.data);
}
