import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

export async function applyCustomSql(logFn = console.log, errFn = console.error) {
  logFn('[CUSTOM SQL] Connecting to database...');
  const connection = await mysql.createConnection({
    uri: DATABASE_URL!,
    multipleStatements: true, // Crucial for executing scripts with multiple queries/delimiters
  });

  try {
    const customSqlDir = path.join(process.cwd(), 'lib', 'db', 'custom-sql');
    
    if (!fs.existsSync(customSqlDir)) {
      logFn('[CUSTOM SQL] No custom-sql directory found. Skipping.');
      return;
    }

    const files = fs.readdirSync(customSqlDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Run 01_..., 02_... in order

    for (const file of files) {
      logFn(`[CUSTOM SQL] Applying ${file}...`);
      const filePath = path.join(customSqlDir, file);
      
      let sqlContent = fs.readFileSync(filePath, 'utf-8');
      
      const statements = sqlContent
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      try {
        for (const statement of statements) {
            await connection.query(statement);
        }
        logFn(`  ✅ ${file} applied successfully.`);
      } catch (err: any) {
        errFn(`  ❌ Error applying ${file}: ${err.message}`);
        throw err;
      }
    }
    logFn('✅ All custom SQL scripts applied successfully.');
  } finally {
    await connection.end();
  }
}

import { fileURLToPath } from 'url';

// Allow running directly from command line
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  applyCustomSql().catch(() => process.exit(1));
}
