import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CLONE_DB_URL = "mysql://simpbb:af1u5nyk62vgugfm@203.130.255.4:33063/simpbb";
const OUTPUT_FILE = './sppt-2025-with-payments.csv';

async function extractSpptWithPayments() {
  console.log('🔗 Connecting to clone database...');
  const conn = await mysql.createConnection(CLONE_DB_URL);

  try {
    console.log('📊 Querying SPPT data with aggregated payments...');

    const query = `
      SELECT
        CONCAT(s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN, s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP) as nop,
        s.THN_PAJAK_SPPT as thnPajakSppt,
        MAX(s.NM_WP_SPPT) as nmWpSppt,
        MAX(s.JLN_WP_SPPT) as jlnWpSppt,
        MAX(s.LUAS_BUMI_SPPT) as luasBumiSppt,
        MAX(s.LUAS_BNG_SPPT) as luasBngSppt,
        MAX(s.NJOP_BUMI_SPPT) as njopBumiSppt,
        MAX(s.NJOP_BNG_SPPT) as njopBngSppt,
        MAX(s.NJOP_SPPT) as njopSppt,
        MAX(s.NJOPTKP_SPPT) as njoptkpSppt,
        MAX(s.NJKP_SPPT) as njkpSppt,
        MAX(s.PBB_TERHUTANG_SPPT) as pbbTerhutangSppt,
        MAX(s.FAKTOR_PENGURANG_SPPT) as faktorPengurangSppt,
        MAX(s.PBB_YG_HARUS_DIBAYAR_SPPT) as pbbYgHarusDibayarSppt,
        MAX(s.STATUS_PEMBAYARAN_SPPT) as statusPembayaranSppt,
        MAX(s.TGL_JATUH_TEMPO_SPPT) as tglJatuhTempoSppt,
        MAX(k.NM_KECAMATAN) as nmKecamatan,
        MAX(l.NM_KELURAHAN) as nmKelurahan,
        COUNT(p.PEMBAYARAN_SPPT_KE) as jumlahPembayaran,
        SUM(p.JML_SPPT_YG_DIBAYAR) as totalBayar,
        SUM(p.DENDA_SPPT) as totalDenda,
        MIN(p.TGL_PEMBAYARAN_SPPT) as tglBayarPertama,
        MAX(p.TGL_PEMBAYARAN_SPPT) as tglBayarTerakhir
      FROM sppt s
      LEFT JOIN ref_kecamatan k ON s.KD_PROPINSI = k.KD_PROPINSI
        AND s.KD_DATI2 = k.KD_DATI2
        AND s.KD_KECAMATAN = k.KD_KECAMATAN
      LEFT JOIN ref_kelurahan l ON s.KD_PROPINSI = l.KD_PROPINSI
        AND s.KD_DATI2 = l.KD_DATI2
        AND s.KD_KECAMATAN = l.KD_KECAMATAN
        AND s.KD_KELURAHAN = l.KD_KELURAHAN
      LEFT JOIN pembayaran_sppt p ON s.KD_PROPINSI = p.KD_PROPINSI
        AND s.KD_DATI2 = p.KD_DATI2
        AND s.KD_KECAMATAN = p.KD_KECAMATAN
        AND s.KD_KELURAHAN = p.KD_KELURAHAN
        AND s.KD_BLOK = p.KD_BLOK
        AND s.NO_URUT = p.NO_URUT
        AND s.KD_JNS_OP = p.KD_JNS_OP
        AND s.THN_PAJAK_SPPT = p.THN_PAJAK_SPPT
      WHERE s.THN_PAJAK_SPPT >= '2025' AND s.THN_PAJAK_SPPT <= '2025'
      GROUP BY
        s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN,
        s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP, s.THN_PAJAK_SPPT
      ORDER BY
        s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN,
        s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP, s.THN_PAJAK_SPPT
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
    console.log(`  With payments: ${data.filter(r => r.jumlahPembayaran > 0).length}`);
    console.log(`  Without payments: ${data.filter(r => !r.jumlahPembayaran).length}`);

  } finally {
    await conn.end();
  }
}

extractSpptWithPayments().catch(console.error);
