import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const CLONE_DB_URL = "mysql://simpbb:af1u5nyk62vgugfm@203.130.255.4:33063/simpbb";

const valuationTables = [
  'kayu_ulin', 'bangunan_lantai', 'tipe_bangunan', 'dbkb_standard', 'dbkb_material', 
  'dbkb_mezanin', 'dbkb_daya_dukung', 'fas_dep_min_max', 'fas_non_dep', 
  'range_penyusutan', 'penyusutan', 'tarif',
  'dbkb_jpb2', 'dbkb_jpb3', 'dbkb_jpb4', 'dbkb_jpb5', 'dbkb_jpb6', 
  'dbkb_jpb7', 'dbkb_jpb8', 'dbkb_jpb9', 'dbkb_jpb12', 'dbkb_jpb13', 
  'dbkb_jpb14', 'dbkb_jpb15', 'dbkb_jpb16'
];

async function generateValuationSchema() {
  const cloneConn = await mysql.createConnection(CLONE_DB_URL);
  let output = `import { mysqlTable, primaryKey, char, tinyint, smallint, mediumint, bigint, decimal, varchar, int, text, double } from "drizzle-orm/mysql-core";\n\n`;

  try {
    for (const tableName of valuationTables) {
      const [cols]: any = await cloneConn.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [tableName]);

      if (cols.length === 0) continue;

      const [pks]: any = await cloneConn.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
      `, [tableName]);
      
      const pkNames = pks.map((p: any) => p.COLUMN_NAME);

      output += `// ─── ${tableName} ─────────────────────────────────────────────────\n\n`;
      output += `export const ${toCamel(tableName)} = mysqlTable("${tableName}", {\n`;
      
      for (const col of cols) {
        let drizzleType = "";
        const type = col.COLUMN_TYPE.toLowerCase();
        const colName = col.COLUMN_NAME;
        const drizzleName = toCamel(colName);
        
        if (type.includes('varchar')) {
          const len = type.match(/\d+/)?.[0];
          drizzleType = `varchar("${colName}", { length: ${len} })`;
        } else if (type.includes('char')) {
          const len = type.match(/\d+/)?.[0];
          drizzleType = `char("${colName}", { length: ${len} })`;
        } else if (type.includes('decimal')) {
          const precisionMatch = type.match(/(\d+),(\d+)/);
          if (precisionMatch) {
            drizzleType = `decimal("${colName}", { precision: ${precisionMatch[1]}, scale: ${precisionMatch[2]} })`;
          } else {
            const precisionOnly = type.match(/(\d+)/);
            drizzleType = `decimal("${colName}", { precision: ${precisionOnly ? precisionOnly[1] : 15}, scale: 0 })`;
          }
        } else if (type.includes('bigint')) {
          drizzleType = `bigint("${colName}", { mode: "number" })`;
        } else if (type.includes('int')) {
          drizzleType = `int("${colName}")`;
        } else if (type.includes('smallint')) {
          drizzleType = `smallint("${colName}")`;
        } else if (type.includes('tinyint(1)')) {
          drizzleType = `tinyint("${colName}")`;
        } else if (type.includes('tinyint')) {
          drizzleType = `tinyint("${colName}")`;
        } else if (type.includes('double')) {
          drizzleType = `double("${colName}")`;
        } else if (type.includes('float')) {
          drizzleType = `double("${colName}") /* float */`;
        } else if (type.includes('text')) {
          drizzleType = `text("${colName}")`;
        } else {
          drizzleType = `text("${colName}") /* ${type} */`;
        }

        let line = `  ${drizzleName}: ${drizzleType}`;
        if (col.IS_NULLABLE === 'NO') line += '.notNull()';
        if (pkNames.length === 1 && pkNames[0] === colName) line += '.primaryKey()';
        
        output += line + ",\n";
      }

      output += `}, (table) => [\n`;
      if (pkNames.length > 1) {
        output += `  primaryKey({ name: "pk_${tableName}", columns: [${pkNames.map(toCamel).map((n: string) => `table.${n}`).join(', ')}] }),\n`;
      }
      output += `]);\n\n`;
    }

    fs.writeFileSync('lib/db/schema/valuation.ts', output);
    console.log("Valuation schema generated successfully.");

  } finally {
    await cloneConn.end();
  }
}

function toCamel(str: string) {
  return str.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

generateValuationSchema();
