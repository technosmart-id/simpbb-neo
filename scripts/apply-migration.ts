import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

// Read the migration SQL file
const migrationSQL = readFileSync(
  join(process.cwd(), "lib/db/migration/0000_perfect_zemo.sql"),
  "utf-8"
);

// Split by statement breakpoint and filter empty statements
const statements = migrationSQL
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Found ${statements.length} SQL statements to execute.`);

const conn = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "simpbb_neo",
  multipleStatements: true,
});

try {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await conn.query(statement);
      console.log(`[${i + 1}/${statements.length}] ✓ Executed`);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        console.log(`[${i + 1}/${statements.length}] ⊘ Table already exists, skipping`);
      } else if (error.code === "ER_DUP_KEYNAME") {
        console.log(`[${i + 1}/${statements.length}] ⊘ Index/constraint already exists, skipping`);
      } else if (error.code === "ER_DUP_ENTRY") {
        console.log(`[${i + 1}/${statements.length}] ⊘ Duplicate entry, skipping`);
      } else {
        console.error(`[${i + 1}/${statements.length}] ✗ Error: ${error.message || String(err)}`);
        console.error(`Statement was: ${statement.substring(0, 100)}...`);
        // Continue anyway
      }
    }
  }

  console.log("\n✅ Migration completed!");
} finally {
  await conn.end();
}
