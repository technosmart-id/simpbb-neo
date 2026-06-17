import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CLONE_DB_URL = "mysql://simpbb:af1u5nyk62vgugfm@203.130.255.4:33063/simpbb";
const OUTPUT_FILE = './sppt-2025-merged.csv';

async function extractSpptMerged() {
  console.log('🔗 Connecting to clone database...');
  const conn = await mysql.createConnection(CLONE_DB_URL);

  try {
    console.log('📊 Querying SPPT with payments (using subquery)...');

    // Use a subquery to pre-aggregate payments, then join - more efficient
    const query = `
      SELECT
        CONCAT(s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN, s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP) as nop,
        s.THN_PAJAK_SPPT as thnPajakSppt,
        s.NM_WP_SPPT as nmWpSppt,
        s.JLN_WP_SPPT as jlnWpSppt,
        s.LUAS_BUMI_SPPT as luasBumiSppt,
        s.LUAS_BNG_SPPT as luasBngSppt,
        s.NJOP_BUMI_SPPT as njopBumiSppt,
        s.NJOP_BNG_SPPT as njopBngSppt,
        s.NJOP_SPPT as njopSppt,
        s.NJOPTKP_SPPT as njoptkpSppt,
        s.NJKP_SPPT as njkpSppt,
        s.PBB_TERHUTANG_SPPT as pbbTerhutangSppt,
        s.FAKTOR_PENGURANG_SPPT as faktorPengurangSppt,
        s.PBB_YG_HARUS_DIBAYAR_SPPT as pbbYgHarusDibayarSppt,
        s.STATUS_PEMBAYARAN_SPPT as statusPembayaranSppt,
        k.NM_KECAMATAN as nmKecamatan,
        l.NM_KELURAHAN as nmKelurahan,
        IFNULL(pay.jumlahPembayaran, 0) as jumlahPembayaran,
        IFNULL(pay.totalBayar, 0) as totalBayar,
        IFNULL(pay.totalDenda, 0) as totalDenda,
        pay.tglBayarPertama,
        pay.tglBayarTerakhir
      FROM sppt s
      LEFT JOIN ref_kecamatan k ON s.KD_PROPINSI = k.KD_PROPINSI
        AND s.KD_DATI2 = k.KD_DATI2
        AND s.KD_KECAMATAN = k.KD_KECAMATAN
      LEFT JOIN ref_kelurahan l ON s.KD_PROPINSI = l.KD_PROPINSI
        AND s.KD_DATI2 = l.KD_DATI2
        AND s.KD_KECAMATAN = l.KD_KECAMATAN
        AND s.KD_KELURAHAN = l.KD_KELURAHAN
      LEFT JOIN (
        SELECT
          pp.KD_PROPINSI, pp.KD_DATI2, pp.KD_KECAMATAN, pp.KD_KELURAHAN,
          pp.KD_BLOK, pp.NO_URUT, pp.KD_JNS_OP, pp.THN_PAJAK_SPPT,
          COUNT(*) as jumlahPembayaran,
          SUM(pp.JML_SPPT_YG_DIBAYAR) as totalBayar,
          SUM(pp.DENDA_SPPT) as totalDenda,
          MIN(pp.TGL_PEMBAYARAN_SPPT) as tglBayarPertama,
          MAX(pp.TGL_PEMBAYARAN_SPPT) as tglBayarTerakhir
        FROM pembayaran_sppt pp
        WHERE pp.THN_PAJAK_SPPT = '2025'
        GROUP BY
          pp.KD_PROPINSI, pp.KD_DATI2, pp.KD_KECAMATAN, pp.KD_KELURAHAN,
          pp.KD_BLOK, pp.NO_URUT, pp.KD_JNS_OP, pp.THN_PAJAK_SPPT
      ) pay ON s.KD_PROPINSI = pay.KD_PROPINSI
        AND s.KD_DATI2 = pay.KD_DATI2
        AND s.KD_KECAMATAN = pay.KD_KECAMATAN
        AND s.KD_KELURAHAN = pay.KD_KELURAHAN
        AND s.KD_BLOK = pay.KD_BLOK
        AND s.NO_URUT = pay.NO_URUT
        AND s.KD_JNS_OP = pay.KD_JNS_OP
        AND s.THN_PAJAK_SPPT = pay.THN_PAJAK_SPPT
      WHERE s.THN_PAJAK_SPPT = '2025'
      ORDER BY s.KD_KECAMATAN, s.KD_KELURAHAN, s.KD_BLOK, s.NO_URUT
    `;

    const [rows] = await conn.query(query);
    const data = rows as any[];

    console.log(`✅ Found ${data.length} rows`);

    if (data.length === 0) {
      console.log('⚠️ No data found.');
      return;
    }

    // Transform data
    const transformed = data.map((row: any) => ({
      NOP: row.nop,
      'Tahun': row.thnPajakSppt,
      'Nama WP': (row.nmWpSppt || '').trim(),
      'Alamat': (row.jlnWpSppt || '').trim(),
      'Kecamatan': (row.nmKecamatan || '').trim(),
      'Kelurahan': (row.nmKelurahan || '').trim(),
      'Luas Bumi': row.luasBumiSppt || 0,
      'Luas Bangunan': row.luasBngSppt || 0,
      'NJOP Bumi': row.njopBumiSppt || 0,
      'NJOP Bangunan': row.njopBngSppt || 0,
      'Total NJOP': row.njopSppt || 0,
      'NJOPTKP': row.njoptkpSppt || 0,
      'PBB Harus Dibayar': row.pbbYgHarusDibayarSppt || 0,
      'Status': row.statusPembayaranSppt == 0 ? 'Belum' : row.statusPembayaranSppt == 1 ? 'Lunas' : 'Lunas JT',
      'Jml Pembayaran': row.jumlahPembayaran || 0,
      'Total Bayar': row.totalBayar || 0,
      'Total Denda': row.totalDenda || 0,
      'Tgl Bayar Pertama': row.tglBayarPertama ? new Date(row.tglBayarPertama).toLocaleDateString('id-ID') : '',
      'Tgl Bayar Terakhir': row.tglBayarTerakhir ? new Date(row.tglBayarTerakhir).toLocaleDateString('id-ID') : '',
    }));

    // Write CSV
    const headers = Object.keys(transformed[0]);
    const csv = [
      headers.join(','),
      ...transformed.map((row: any) => headers.map(h => {
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
    console.log(`  Total rows: ${data.length}`);
    console.log(`  With payments: ${data.filter(r => r.jumlahPembayaran > 0).length}`);
    console.log(`  Without payments: ${data.filter(r => r.jumlahPembayaran === 0).length}`);

  } finally {
    await conn.end();
  }
}

extractSpptMerged().catch(console.error);
