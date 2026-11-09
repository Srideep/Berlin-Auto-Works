import "server-only";

import { getDb } from "@/lib/db";

export async function getActiveLocation(): Promise<{
  id: string;
  name: string;
  email: string;
} | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  return getDb().location.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true },
  });
}
