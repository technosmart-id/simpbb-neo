import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://simpbb:L8pXMtPp0q0yPgCfTTvK@203.130.255.4:3306/simpbb";

async function check() {
  let connection;
  try {
    console.log("Connecting to:", DATABASE_URL);
    connection = await mysql.createConnection(DATABASE_URL);
    
    const tables = [
      'user',
      'organization',
      'spop',
      'dat_op_bangunan',
      'sppt',
      'pembayaran_sppt',
      'ref_propinsi'
    ];

    console.log("\nTable Counts:");
    for (const table of tables) {
      try {
        const [rows]: any = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        console.log(`- ${table}: ${rows[0].count}`);
      } catch (err) {
        console.log(`- ${table}: TABLE NOT FOUND or error`);
      }
    }

    const [spopSample]: any = await connection.query("SELECT * FROM spop LIMIT 1");
    if (spopSample.length > 0) {
      console.log("\nSPOP Sample (First record):");
      console.log(JSON.stringify(spopSample[0], null, 2));
    } else {
      console.log("\nSPOP table is empty.");
    }

  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    if (connection) await connection.end();
  }
}

check();
