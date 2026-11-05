import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/account/",
        "/admin",
        "/admin/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
