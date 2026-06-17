import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CLONE_DB_URL = "mysql://simpbb:af1u5nyk62vgugfm@203.130.255.4:33063/simpbb";

const tablesToFix = [
  'ref_propinsi', 'ref_dati2', 'ref_kecamatan', 'ref_kelurahan',
  'ref_kategori', 'ref_jns_pelayanan',
  'tarif', 'sppt', 'penyusutan', 'pemekaran', 'pemekaran_detail',
  'spop', 'dat_op_bangunan', 'dat_fasilitas_bangunan', 'dat_subjek_pajak',
  'kelas_bumi', 'kelas_bangunan', 'fasilitas', 'login', 'group_akses', 'akses'
];

async function getTruth() {
  const cloneConn = await mysql.createConnection(CLONE_DB_URL);
  
  try {
    for (const tableName of tablesToFix) {
      console.log(`\n// ─── ${tableName} ─────────────────────────────────────────────────`);
      const [cols]: any = await cloneConn.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [tableName]);

      const [pks]: any = await cloneConn.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
      `, [tableName]);
      
      const pkNames = pks.map((p: any) => p.COLUMN_NAME);

      console.log(`export const ${toCamel(tableName)} = mysqlTable("${tableName}", {`);
      
      for (const col of cols) {
        let drizzleType = "";
        let config: any = { length: null, precision: null, scale: null };
        
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
          const precision = type.match(/(\d+),(\d+)/);
          drizzleType = `decimal("${colName}", { precision: ${precision![1]}, scale: ${precision![2]} })`;
        } else if (type.includes('bigint')) {
          drizzleType = `bigint("${colName}", { mode: "number" })`;
        } else if (type.includes('int')) {
          drizzleType = `int("${colName}")`;
        } else if (type.includes('smallint')) {
          drizzleType = `smallint("${colName}")`;
        } else if (type.includes('tinyint(1)')) {
          drizzleType = `boolean("${colName}")`;
        } else if (type.includes('tinyint')) {
          drizzleType = `tinyint("${colName}")`;
        } else if (type.includes('timestamp')) {
          drizzleType = `timestamp("${colName}")`;
        } else if (type.includes('datetime')) {
          drizzleType = `datetime("${colName}")`;
        } else if (type.includes('date')) {
          drizzleType = `date("${colName}")`;
        } else if (type.includes('longtext')) {
          drizzleType = `longtext("${colName}")`;
        } else if (type.includes('text')) {
          drizzleType = `text("${colName}")`;
        } else {
          drizzleType = `custom_type("${colName}") /* ${type} */`;
        }

        let line = `  ${drizzleName}: ${drizzleType}`;
        if (col.IS_NULLABLE === 'NO') line += '.notNull()';
        if (pkNames.length === 1 && pkNames[0] === colName) line += '.primaryKey()';
        if (col.EXTRA.includes('auto_increment')) line += '.autoincrement()';
        
        console.log(line + ",");
      }

      console.log(`}, (table) => [`);
      if (pkNames.length > 1) {
        console.log(`  primaryKey({ columns: [${pkNames.map(toCamel).map((n: string) => `table.${n}`).join(', ')}] }),`);
      }
      console.log(`]);`);
    }
  } finally {
    await cloneConn.end();
  }
}

function toCamel(str: string) {
  return str.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

getTruth();
