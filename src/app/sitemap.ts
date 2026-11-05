import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";
import { serviceOfferings } from "@/modules/catalog/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
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
    ...serviceOfferings.map((service) => ({
      url: new URL(`/services/${service.slug}`, siteUrl).toString(),
    })),
  ];
}
