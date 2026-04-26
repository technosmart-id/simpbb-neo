
import mysql from 'mysql2/promise';

async function check() {
  const connection = await mysql.createConnection("mysql://simpbb:af1u5nyk62vgugfm@203.130.255.4:33063/simpbb");
  const [rows] = await connection.execute('SHOW TABLES');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

check().catch(console.error);
