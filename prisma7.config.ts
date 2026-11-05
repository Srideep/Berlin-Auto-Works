import "dotenv/config";
import { defineConfig } from "prisma/config";

const localPlaceholderUrl =
  "postgresql://postgres:postgres@127.0.0.1:5432/berlin_autoworks";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? localPlaceholderUrl,
  },
});
