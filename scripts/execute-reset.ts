import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { seedProd } from "../lib/db/seed/prod";
import { seedDev } from "../lib/db/seed/dev";

dotenv.config({ path: '.env.local' });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const IS_DEV = process.env.NODE_ENV === "development";

async function main() {
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

    // 2. APPLY SCHEMA VIA MANUAL MIGRATIONS
    console.log("[SYSTEM] Recreating tables via manual migrations...");
    const { applyMigrations } = await import('../lib/db/migrate-helper');
    
    try {
      const migrationConn = await mysql.createConnection(DATABASE_URL);
      await applyMigrations(migrationConn, console.log);
      await migrationConn.end();
      console.log("[SYSTEM] Tables recreated successfully.");
    } catch (pushError: any) {
      console.error("[SYSTEM] Migration failed:", pushError.message);
      process.exit(1);
    }

    await connection.end();
    console.log("[SYSTEM] Tables recreated via migrations.");

    // Apply Custom SQL (Views & Procedures)
    const { applyCustomSql } = await import('./apply-custom-sql');
    await applyCustomSql(console.log, console.error);

    // 3. SEED DATA
    console.log("[SYSTEM] Seeding production data...");
    await seedProd();
    
    if (IS_DEV) {
      console.log("[SYSTEM] Seeding development data...");
      await seedDev();
    }

    console.log("[SYSTEM] Database reset and seeded successfully.");
  } catch (error: any) {
    console.error("[SYSTEM] Database reset failed:", error);
    if (connection) {
      try { await connection.end(); } catch {}
    }
    process.exit(1);
  }
}

main();
