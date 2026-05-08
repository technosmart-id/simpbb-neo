// Load environment variables first
import { resolve } from "path"
import dotenv from "dotenv"
dotenv.config({ path: resolve(process.cwd(), ".env.local") })

import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
})

export const db = drizzle(connection, { schema, mode: "default" })

// Export the DB type for use in other modules
export type DB = typeof db
