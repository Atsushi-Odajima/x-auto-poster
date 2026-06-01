import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    url: process.env["DATABASE_URL"] ?? "file:./prisma/dev.db",
  },
});
