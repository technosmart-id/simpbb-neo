import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'simpbb_neo'
  });
  
  const [rows] = await connection.query('SELECT name, slug, is_default_role FROM org_roles');
  console.log('Roles found:', rows);
  
  await connection.end();
}
main();
