import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CLONE_DB_URL = "mysql://simpbb:af1u5nyk62vgugfm@203.130.255.4:33063/simpbb";
const OUTPUT_FILE = './pembayaran-2025-aggregated.csv';

async function extractPaymentsAggregated() {
  console.log('🔗 Connecting to clone database...');
  const conn = await mysql.createConnection(CLONE_DB_URL);

  try {
    console.log('📊 Querying aggregated payment data...');

    const query = `
      SELECT
        CONCAT(s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN, s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP) as nop,
        s.THN_PAJAK_SPPT as thnPajakSppt,
        COUNT(p.PEMBAYARAN_SPPT_KE) as jumlahPembayaran,
        SUM(p.JML_SPPT_YG_DIBAYAR) as totalBayar,
        SUM(p.DENDA_SPPT) as totalDenda,
        MIN(p.TGL_PEMBAYARAN_SPPT) as tglBayarPertama,
        MAX(p.TGL_PEMBAYARAN_SPPT) as tglBayarTerakhir
      FROM sppt s
      INNER JOIN pembayaran_sppt p ON s.KD_PROPINSI = p.KD_PROPINSI
        AND s.KD_DATI2 = p.KD_DATI2
        AND s.KD_KECAMATAN = p.KD_KECAMATAN
        AND s.KD_KELURAHAN = p.KD_KELURAHAN
        AND s.KD_BLOK = p.KD_BLOK
        AND s.NO_URUT = p.NO_URUT
        AND s.KD_JNS_OP = p.KD_JNS_OP
        AND s.THN_PAJAK_SPPT = p.THN_PAJAK_SPPT
      WHERE s.THN_PAJAK_SPPT = '2025'
      GROUP BY
        s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN,
        s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP, s.THN_PAJAK_SPPT
      ORDER BY
        s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN,
        s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP, s.THN_PAJAK_SPPT
    `;

    const [rows] = await conn.query(query);
    const data = rows as any[];

    console.log(`✅ Found ${data.length} rows with payments`);

    if (data.length === 0) {
      console.log('⚠️ No payment data found.');
      return;
    }

    // Transform data
    const transformed = data.map((row: any) => ({
      NOP: row.nop,
      'Tahun': row.thnPajakSppt,
      'Jml Pembayaran': row.jumlahPembayaran,
      'Total Bayar': row.totalBayar || 0,
      'Total Denda': row.totalDenda || 0,
      'Tgl Bayar Pertama': row.tglBayarPertama ? new Date(row.tglBayarPertama).toLocaleDateString('id-ID') : '',
      'Tgl Bayar Terakhir': row.tglBayarTerakhir ? new Date(row.tglBayarTerakhir).toLocaleDateString('id-ID') : '',
    }));

    // Write CSV
    const headers = Object.keys(transformed[0]);
    const csv = [
      headers.join(','),
      ...transformed.map(row => headers.map(h => {
        const val = row[h];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${String(val).replace(/"/g, '""')}"`;
        }
        return val ?? '';
      }).join(','))
    ].join('\n');

    fs.writeFileSync(OUTPUT_FILE, csv, 'utf8');
    console.log(`📄 Exported to: ${OUTPUT_FILE}`);

    console.log('\n📊 Summary:');
    console.log(`  Rows: ${data.length}`);
    console.log(`  Total dibayar: ${data.reduce((sum, r) => sum + (r.totalBayar || 0), 0).toLocaleString()}`);
    console.log(`  Total denda: ${data.reduce((sum, r) => sum + (r.totalDenda || 0), 0).toLocaleString()}`);

  } finally {
    await conn.end();
  }
}

extractPaymentsAggregated().catch(console.error);
