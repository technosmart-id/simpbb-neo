import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./lib/db/schema/auth.ts",
    "./lib/db/schema/index.ts",
    "./lib/db/schema/pbb/index.ts",
  ],
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
