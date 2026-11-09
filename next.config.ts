import type { NextConfig } from "next";

const securityHeaders: { key: string; value: string }[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  });
}

const privateNoStoreHeaders: { key: string; value: string }[] = [
  { key: "Cache-Control", value: "private, no-store" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const privateRouteSources = [
  "/account",
  "/account/:path*",
  "/admin",
  "/admin/:path*",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Netlify sets x-forwarded-host to "<site>.netlify.app:80". The browser
  // Origin host has no port, so Next.js rejects every Server Action until
  // the public host is listed here. The wildcard covers deploy-preview hosts.
  experimental: {
    serverActions: {
      allowedOrigins: ["berl.netlify.app", "*.netlify.app"],
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  cacheLife: {
    marketing: {
      stale: 60,
      revalidate: 300,
      expire: 3600,
    },
    contact: {
      stale: 60,
      revalidate: 120,
      expire: 3600,
    },
    legal: {
      stale: 86_400,
      revalidate: 604_800,
      expire: 2_592_000,
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      ...privateRouteSources.map((source) => ({
        source,
        headers: privateNoStoreHeaders,
      })),
    ];
  },
};

export default nextConfig;
