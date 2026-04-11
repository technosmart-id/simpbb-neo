import { os } from "../context"
import { execSync } from "child_process"
import { z } from "zod"

export const systemRouter = os.router({
  resetDb: os
    .input(z.object({}))
    .handler(async () => {
      try {
        console.log("[SYSTEM] Resetting database...")
        // Run the db:reset script from package.json
        // This script is: "tsx scripts/reset-db.ts && drizzle-kit push && npm run db:seed"
        const output = execSync("npm run db:reset", { encoding: "utf-8" })
        console.log("[SYSTEM] Database reset output:", output)
        return { success: true, message: "Database reset successfully", output }
      } catch (error: any) {
        console.error("[SYSTEM] Database reset failed:", error)
        throw new Error(error.message || "Failed to reset database")
      }
    }),
})
