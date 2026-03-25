/**
 * Use this config to run migrations against a locally-exposed MySQL instance.
 * Unlike drizzle.config.ts, this does NOT load .env.local so the DATABASE_URL
 * from your shell environment is used directly.
 *
 * Usage:
 *   DATABASE_URL="mysql://simpbb:simpbbpassword@127.0.0.1:3306/simpbb_neo" \
 *   npx drizzle-kit migrate --config drizzle.local.config.ts
 *
 * Or just run the Docker migration script:
 *   bash scripts/docker-migrate.sh
 */
import { defineConfig } from "drizzle-kit";

const url =
  process.env.DATABASE_URL ??
  "mysql://simpbb:simpbbpassword@127.0.0.1:3306/simpbb_neo";

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migration",
  dialect: "mysql",
  dbCredentials: { url },
});
