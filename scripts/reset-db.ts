import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function main() {
  try {
    console.log('Resetting database tables...');
    
    // Connect with the full URL (includes database name)
    const connection = await mysql.createConnection(DATABASE_URL);
    
    // Get all tables
    const [rows]: any = await connection.query('SHOW TABLES;');
    const tables = rows.map((row: any) => Object.values(row)[0]);
    
    if (tables.length > 0) {
      console.log(`Dropping ${tables.length} tables: ${tables.join(', ')}`);
      await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
      for (const table of tables) {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
      }
      await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('✅ All tables dropped successfully.');
    } else {
      console.log('ℹ️ No tables found to drop.');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    process.exit(1);
  }
}

main();
