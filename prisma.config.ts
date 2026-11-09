import "dotenv/config";
import { defineConfig } from "prisma/config";

const localPlaceholderUrl =
  "postgresql://postgres:postgres@127.0.0.1:5432/berlin_autoworks";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrate needs a direct session. Neon’s pooled host drops the features it uses.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? localPlaceholderUrl,
  },
});
