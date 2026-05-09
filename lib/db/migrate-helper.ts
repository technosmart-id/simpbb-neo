import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import mysql from 'mysql2/promise';

export async function applyMigrations(connection: mysql.Connection, log: (...args: any[]) => void) {
    const migrationDir = join(process.cwd(), "lib/db/migration");
    const migrationFiles = readdirSync(migrationDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    log(`[SYSTEM] Found ${migrationFiles.length} migration files.`);

    for (const file of migrationFiles) {
      log(`[SYSTEM] Applying migration: ${file}`);
      const migrationSQL = readFileSync(join(migrationDir, file), "utf-8");
      
      // Drizzle-style statement splitting
      const statements = migrationSQL
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
            await connection.query(statement);
        } catch (err: any) {
            // Log the failing statement for easier debugging
            console.error(`[MIGRATION ERROR] Failed on statement: ${statement.substring(0, 100)}...`);
            throw err;
        }
      }
    }
}
