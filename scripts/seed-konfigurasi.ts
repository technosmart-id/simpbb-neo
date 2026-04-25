import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const LOCAL_DB = process.env.DATABASE_URL!;
const PROD_DB = 'mysql://simpbb:af1u5nyk62vgugfm@203.130.255.4:33063/simpbb';

async function main() {
  const prodConn = await mysql.createConnection(PROD_DB);
  const localConn = await mysql.createConnection(LOCAL_DB);

  try {
    console.log('Fetching konfigurasi from prod...');
    const [rows]: any = await prodConn.execute('SELECT NAMA, NILAI FROM konfigurasi');
    
    console.log(`Found ${rows.length} config items. Seeding local...`);
    
    for (const row of rows) {
      const nilai = row.NILAI instanceof Buffer ? row.NILAI.toString() : row.NILAI;
      await localConn.execute(
        'INSERT INTO konfigurasi (NAMA, NILAI) VALUES (?, ?) ON DUPLICATE KEY UPDATE NILAI = VALUES(NILAI)',
        [row.NAMA, nilai]
      );
    }
    
    console.log('✅ Konfigurasi seeded.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prodConn.end();
    await localConn.end();
  }
}

main();
