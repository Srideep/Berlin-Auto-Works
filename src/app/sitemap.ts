import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";
import { listPublishedServices } from "@/modules/catalog/published";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const services = await listPublishedServices();
  const staticPaths = [
    "/",
    "/services",
    "/about",
    "/fleet",
    "/contact",
    "/book",
    "/estimate",
    "/privacy",
    "/terms",
    "/accessibility",
  ];

  return [
    ...staticPaths.map((path) => ({
      url: new URL(path, siteUrl).toString(),
    })),
    ...services.map((service) => ({
      url: new URL(`/services/${service.slug}`, siteUrl).toString(),
    })),
  ];
}
