import mysql from 'mysql2/promise';
import { db } from "@/lib/db";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SOURCE_DB_URL = "mysql://simpbb:af1u5nyk62vgugfm@203.130.255.4:33063/simpbb";

const tablesToSync = [
    'kayu_ulin',
    'bangunan_lantai',
    'tipe_bangunan',
    'dbkb_standard',
    'dbkb_material',
    'dbkb_mezanin',
    'dbkb_daya_dukung',
    'fas_dep_min_max',
    'fas_non_dep',
    'range_penyusutan',
    'penyusutan',
    'dbkb_jpb2',
    'dbkb_jpb3',
    'dbkb_jpb4',
    'dbkb_jpb5',
    'dbkb_jpb6',
    'dbkb_jpb7',
    'dbkb_jpb8',
    'dbkb_jpb9',
    'dbkb_jpb12',
    'dbkb_jpb13',
    'dbkb_jpb14',
    'dbkb_jpb15',
    'dbkb_jpb16'
];

export async function seedValuationData() {
    console.log("🔗 Connecting to source database for valuation reference data...");
    
    const source = await mysql.createConnection({ uri: SOURCE_DB_URL });
    const local = await mysql.createConnection({ uri: process.env.DATABASE_URL! });

    try {
        for (const tableName of tablesToSync) {
            console.log(`📦 Syncing table: ${tableName}`);
            const [data]: any = await source.query(`SELECT * FROM ${tableName}`);
            
            if (data.length === 0) {
                console.log(`  - No rows found in ${tableName}. Skipping.`);
                continue;
            }

            console.log(`  - Found ${data.length} rows. Upserting...`);
            
            const columns = Object.keys(data[0]);
            const columnsSql = columns.map(c => `\`${c}\``).join(',');
            const updateClause = columns.map(col => `\`${col}\` = VALUES(\`${col}\`)`).join(',');
            
            // Multi-row INSERT for speed
            const chunkSize = 200; 
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                const values: any[] = [];
                const placeholders: string[] = [];
                
                for (const row of chunk) {
                    placeholders.push(`(${columns.map(() => '?').join(',')})`);
                    values.push(...columns.map(col => row[col]));
                }

                const query = `INSERT INTO \`${tableName}\` (${columnsSql}) VALUES ${placeholders.join(',')} ON DUPLICATE KEY UPDATE ${updateClause}`;
                await local.query(query, values);
            }
            console.log(`  ✅ ${tableName} synced.`);
        }
    } finally {
        await source.end();
        await local.end();
    }
}
