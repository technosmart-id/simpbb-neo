import mysql from 'mysql2/promise';

async function main() {
  try {
    console.log('Resetting simpbb_neo database...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root'
    });
    
    await connection.query('DROP DATABASE IF EXISTS simpbb_neo;');
    await connection.query('CREATE DATABASE simpbb_neo;');
    await connection.end();
    
    console.log('✅ Database simpbb_neo dropped and recreated successfully.');
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    process.exit(1);
  }
}

main();
