import { os } from "../context"
import { z } from "zod"
import mysql from 'mysql2/promise';
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { seedProd } from "../../db/seed/prod";
import { seedDev } from "../../db/seed/dev";

const DATABASE_URL = process.env.DATABASE_URL;
const IS_DEV = process.env.NODE_ENV === "development";

export const systemRouter = os.router({
  resetDb: os
    .input(z.object({}))
    .handler(async () => {
      if (!DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
      }

      let connection;
      try {
        console.log("[SYSTEM] Resetting database tables...");
        connection = await mysql.createConnection(DATABASE_URL);
        
        // 1. DROP ALL TABLES
        const [rows]: any = await connection.query('SHOW TABLES;');
        const tables = rows.map((row: any) => Object.values(row)[0]);
        
        if (tables.length > 0) {
          console.log(`[SYSTEM] Dropping ${tables.length} tables...`);
          await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
          for (const table of tables) {
            await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
          }
          await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
        }

        // 2. APPLY MIGRATIONS
        const migrationDir = join(process.cwd(), "lib/db/migration");
        const migrationFiles = readdirSync(migrationDir)
          .filter(f => f.endsWith(".sql"))
          .sort();

        console.log(`[SYSTEM] Found ${migrationFiles.length} migration files.`);

        for (const file of migrationFiles) {
          console.log(`[SYSTEM] Applying migration: ${file}`);
          const migrationSQL = readFileSync(join(migrationDir, file), "utf-8");
          const statements = migrationSQL
            .split("--> statement-breakpoint")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          for (const statement of statements) {
            await connection.query(statement);
          }
        }

        await connection.end();
        console.log("[SYSTEM] Tables recreated via migrations.");

        // 3. SEED DATA
        console.log("[SYSTEM] Seeding production data...");
        await seedProd();
        
        if (IS_DEV) {
          console.log("[SYSTEM] Seeding development data...");
          await seedDev();
        }

        console.log("[SYSTEM] Database reset and seeded successfully.");
        return { 
          success: true, 
          message: "Database reset and seeded successfully" 
        }
      } catch (error: any) {
        console.error("[SYSTEM] Database reset failed:", error);
        if (connection) {
          try { await connection.end(); } catch {}
        }
        throw new Error(error.message || "Failed to reset database");
      }
    }),
})
