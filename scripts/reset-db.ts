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
    const connection = await mysql.createConnection(DATABASE_URL!);
    
    // Get all tables and views
    const [rows]: any = await connection.query('SHOW FULL TABLES;');
    const items = rows.map((row: any) => ({
      name: Object.values(row)[0] as string,
      type: Object.values(row)[1] as string
    }));
    
    if (items.length > 0) {
      console.log(`Dropping ${items.length} items...`);
      await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
      for (const item of items) {
        if (item.type === 'VIEW') {
          await connection.query(`DROP VIEW IF EXISTS \`${item.name}\`;`);
        } else {
          await connection.query(`DROP TABLE IF EXISTS \`${item.name}\`;`);
        }
      }
      await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('✅ All tables and views dropped successfully.');
    } else {
      console.log('ℹ️ No items found to drop.');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    process.exit(1);
  }
}

main();
