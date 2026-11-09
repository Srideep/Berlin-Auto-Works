import { cacheLife } from "next/cache";

import { getDb } from "@/lib/db";
import {
  serviceOfferings,
  type ServiceOffering,
} from "@/modules/catalog/services";

/**
 * Published services for the oldest active location.
 * With no DATABASE_URL, callers receive the in-repo catalog so a build can finish.
 */
export async function listPublishedServices(): Promise<readonly ServiceOffering[]> {
  "use cache";
  cacheLife("marketing");

  if (!process.env.DATABASE_URL) {
    return serviceOfferings;
  }

  const location = await getDb().location.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!location) {
    return serviceOfferings;
  }

  return getDb().service.findMany({
    where: { locationId: location.id, isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      summary: true,
      details: true,
    },
  });
}

export async function getPublishedService(
  slug: string,
): Promise<ServiceOffering | undefined> {
  const services = await listPublishedServices();
  return services.find((service) => service.slug === slug);
}
