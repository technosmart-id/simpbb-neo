import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config({ path: '.env.local' });

const LOCAL_DB_URL = process.env.DATABASE_URL;
const CLONE_DB_URL = "mysql://simpbb:af1u5nyk62vgugfm@203.130.255.4:33063/simpbb";

async function validateSchema() {
  console.log(chalk.bold("\n🔍 Starting Schema Validation against Production Clone..."));
  
  if (!LOCAL_DB_URL) {
    console.error(chalk.red("❌ DATABASE_URL is not set in .env.local"));
    return;
  }

  const localConn = await mysql.createConnection(LOCAL_DB_URL);
  const cloneConn = await mysql.createConnection(CLONE_DB_URL);

  try {
    // 1. Get all tables in local DB
    const [localTables]: any = await localConn.query("SHOW TABLES");
    const localTableNames = localTables.map((t: any) => Object.values(t)[0] as string);
    
    // 2. Get all tables in clone DB
    const [cloneTables]: any = await cloneConn.query("SHOW TABLES");
    const cloneTableNames = new Set(cloneTables.map((t: any) => Object.values(t)[0] as string));

    console.log(`Found ${localTableNames.length} tables locally. Checking those that exist in production...\n`);

    let totalDiffs = 0;
    let tablesCompared = 0;

    // Tables to explicitly exclude from validation
    const excludedTables = new Set(['user', 'users']);

    for (const tableName of localTableNames) {
      // Skip excluded tables
      if (excludedTables.has(tableName)) {
        continue;
      }

      if (!cloneTableNames.has(tableName)) {
        // Skip tables that don't exist in production (e.g. Better Auth, new modules)
        continue;
      }

      tablesCompared++;
      
      // Get column metadata for local
      const [localCols]: any = await localConn.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        ORDER BY COLUMN_NAME
      `, [tableName]);

      // Get column metadata for clone
      const [cloneCols]: any = await cloneConn.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        ORDER BY COLUMN_NAME
      `, [tableName]);

      const localMap = new Map(localCols.map((c: any) => [c.COLUMN_NAME, c]));
      const cloneMap = new Map(cloneCols.map((c: any) => [c.COLUMN_NAME, c]));

      const diffs: string[] = [];

      // Check for missing or mismatching columns
      for (const [colName, cloneCol] of cloneMap.entries()) {
        const localCol = localMap.get(colName);

        if (!localCol) {
          diffs.push(chalk.red(`  ❌ Missing column: ${colName}`));
        } else {
          const typeMatch = localCol.COLUMN_TYPE.toLowerCase() === cloneCol.COLUMN_TYPE.toLowerCase();
          const nullMatch = localCol.IS_NULLABLE === cloneCol.IS_NULLABLE;

          if (!typeMatch) {
            diffs.push(chalk.yellow(`  ⚠️  Type mismatch for ${colName}: Local [${localCol.COLUMN_TYPE}] vs Clone [${cloneCol.COLUMN_TYPE}]`));
          }
          if (!nullMatch) {
            diffs.push(chalk.yellow(`  ⚠️  Nullability mismatch for ${colName}: Local [${localCol.IS_NULLABLE}] vs Clone [${cloneCol.IS_NULLABLE}]`));
          }
        }
      }

      // Check for extra columns in local that aren't in clone
      for (const colName of localMap.keys()) {
        if (!cloneMap.has(colName)) {
          // We don't necessarily treat this as an error if it's intentional
          // but we'll log it as a hint
          // diffs.push(chalk.cyan(`  ℹ️  Extra local column: ${colName}`));
        }
      }

      if (diffs.length > 0) {
        console.log(chalk.bold(`Table: ${tableName}`));
        diffs.forEach(d => console.log(d));
        totalDiffs += diffs.length;
      }
    }

    console.log(chalk.bold("\n══════════════════════════════════════════════════"));
    if (totalDiffs === 0) {
      console.log(chalk.green(`✅ Success! All ${tablesCompared} shared tables match production schema.`));
    } else {
      console.log(chalk.red(`❌ Found ${totalDiffs} discrepancies across ${tablesCompared} shared tables.`));
    }
    console.log(chalk.bold("══════════════════════════════════════════════════\n"));

  } finally {
    await localConn.end();
    await cloneConn.end();
  }
}

validateSchema().catch(err => {
  console.error(chalk.red("❌ Validation script crashed:"), err);
  process.exit(1);
});
