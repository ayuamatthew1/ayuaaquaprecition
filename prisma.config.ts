import { defineConfig, env } from "@prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma", 
  datasource: {
    // Provide the DATABASE_URL to the Prisma CLI for running migrations
    url: env("DATABASE_URL"),
  },
});
