import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "simpbb_neo",
});

const [tables] = await conn.query("SHOW TABLES");
console.log("Tables in database:", tables);

for (const row of tables as Record<string, unknown>[]) {
  if (row) {
      const tableName = Object.values(row)[0];
      await conn.query(`DROP TABLE \`${tableName}\``);
      console.log(`Dropped table: ${tableName}`);
  }
}

console.log("All tables dropped!");
await conn.end();
