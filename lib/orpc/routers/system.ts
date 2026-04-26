import { os } from "../context"
import { z } from "zod"
import mysql from 'mysql2/promise';
import { seedProd } from "../../db/seed/prod";
import { seedDev } from "../../db/seed/dev";

const DATABASE_URL = process.env.DATABASE_URL;
const IS_DEV = process.env.NODE_ENV === "development";

export const systemRouter = os.router({
  resetDb: os
    .input(z.object({
      includeDevSeed: z.boolean().optional()
    }))
    .handler(async ({ input }) => {
      if (!DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
      }

      let connection;
      try {
        console.log("[SYSTEM] Resetting database tables...");
        connection = await mysql.createConnection(DATABASE_URL);
        
        // 1. DROP ALL TABLES & VIEWS
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        const [rows]: any = await connection.query('SHOW FULL TABLES;');
        const items = rows.map((row: any) => ({
          name: Object.values(row)[0] as string,
          type: Object.values(row)[1] as string
        }));
        
        if (items.length > 0) {
          console.log(`[SYSTEM] Dropping ${items.length} items...`);
          for (const item of items) {
            if (item.type === 'VIEW') {
              await connection.query(`DROP VIEW IF EXISTS \`${item.name}\`;`);
            } else {
              await connection.query(`DROP TABLE IF EXISTS \`${item.name}\`;`);
            }
          }
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
        await connection.end();

        // 2. APPLY SCHEMA VIA DRIZZLE PUSH
        console.log("[SYSTEM] Recreating tables via drizzle-kit push...");
        const { execSync } = await import('child_process');
        
        execSync('npx drizzle-kit push --force', {
          env: { 
            ...process.env, 
            NODE_ENV: 'development',
          },
          stdio: 'inherit'
        });

        console.log("[SYSTEM] Tables recreated.");

        // 3. SEED DATA
        try {
          console.log("[SYSTEM] Seeding production data...");
          await seedProd();
          console.log("[SYSTEM] Production data seeded.");
          
          if (IS_DEV || input.includeDevSeed) {
            console.log("[SYSTEM] Seeding development data...");
            await seedDev();
            console.log("[SYSTEM] Development data seeded.");
          }
        } catch (seedError: any) {
          console.error("[SYSTEM] Seeding failed:", seedError);
          // Don't throw yet, let's see if we can return a partial success or specific error
          throw new Error(`Tables recreated but seeding failed: ${seedError.message}`);
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
