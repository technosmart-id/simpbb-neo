/**
 * Generate TypeScript seeder data from extracted TSV files.
 * Maps legacy DB column names to Drizzle schema camelCase field names.
 * Run: node scripts/generate-sample-data.mjs
 */
import fs from "fs";
import path from "path";

const OUT_DIR = "/tmp/spop-extract";
const OUT_FILE = path.resolve(process.cwd(), "lib/db/seed/sample-spop-data.ts");

// ─── Column mappings: DB column → Drizzle field name ──────────────────
// Only include columns that exist in the Drizzle schema.
// Format: { dbCol: drizzleField, ... }
// Use null for columns to skip.

const MAPPINGS = {
  spop: {
    KD_PROPINSI: "kdPropinsi", KD_DATI2: "kdDati2", KD_KECAMATAN: "kdKecamatan",
    KD_KELURAHAN: "kdKelurahan", KD_BLOK: "kdBlok", NO_URUT: "noUrut", KD_JNS_OP: "kdJnsOp",
    SUBJEK_PAJAK_ID: "subjekPajakId", NO_FORMULIR_SPOP: "noFormulirSpop",
    JNS_TRANSAKSI_OP: "jnsTransaksiOp",
    KD_PROPINSI_BERSAMA: "kdPropinsiBersama", KD_DATI2_BERSAMA: "kdDati2Bersama",
    KD_KECAMATAN_BERSAMA: "kdKecamatanBersama", KD_KELURAHAN_BERSAMA: "kdKelurahanBersama",
    KD_BLOK_BERSAMA: "kdBlokBersama", NO_URUT_BERSAMA: "noUrutBersama", KD_JNS_OP_BERSAMA: "kdJnsOpBersama",
    KD_PROPINSI_ASAL: "kdPropinsiAsal", KD_DATI2_ASAL: "kdDati2Asal",
    KD_KECAMATAN_ASAL: "kdKecamatanAsal", KD_KELURAHAN_ASAL: "kdKelurahanAsal",
    KD_BLOK_ASAL: "kdBlokAsal", NO_URUT_ASAL: "noUrutAsal", KD_JNS_OP_ASAL: "kdJnsOpAsal",
    NO_SPPT_LAMA: "noSpptLama",
    JALAN_OP: "jalanOp", BLOK_KAV_NO_OP: "blokKavNoOp", RT_OP: "rtOp", RW_OP: "rwOp", KELURAHAN_OP: "kelurahanOp",
    KD_STATUS_WP: "kdStatusWp", LUAS_BUMI: "luasBumi", KD_ZNT: "kdZnt", JNS_BUMI: "jnsBumi",
    NILAI_SISTEM_BUMI: "nilaiSistemBumi",
    TGL_PENDATAAN_OP: "tglPendataanOp", NM_PENDATAAN_OP: "nmPendataanOp", NIP_PENDATA: "nipPendata",
    TGL_PEMERIKSAAN_OP: "tglPemeriksaanOp", NM_PEMERIKSAAN_OP: "nmPemeriksaanOp", NIP_PEMERIKSA_OP: "nipPemeriksaOp",
    NO_PERSIL: null, // not in Drizzle schema
  },
  dat_subjek_pajak: {
    SUBJEK_PAJAK_ID: "subjekPajakId", NM_WP: "nmWp", JALAN_WP: "jalanWp",
    BLOK_KAV_NO_WP: "blokKavNoWp", RW_WP: "rwWp", RT_WP: "rtWp",
    KELURAHAN_WP: "kelurahanWp", KOTA_WP: "kotaWp", KD_POS_WP: "kdPosWp",
    TELP_WP: "telpWp", NPWP: "npwp", STATUS_PEKERJAAN_WP: "statusPekerjaanWp",
    EMAIL_WP: "emailWp",
  },
  dat_op_bangunan: {
    KD_PROPINSI: "kdPropinsi", KD_DATI2: "kdDati2", KD_KECAMATAN: "kdKecamatan",
    KD_KELURAHAN: "kdKelurahan", KD_BLOK: "kdBlok", NO_URUT: "noUrut", KD_JNS_OP: "kdJnsOp",
    NO_BNG: "noBng", NO_FORMULIR_LSPOP: "noFormulirLspop", JNS_TRANSAKSI_BNG: "jnsTransaksiBng",
    KD_JPB: "kdJpb",
    LUAS_BNG: "luasBng", JML_LANTAI_BNG: "jmlLantaiBng",
    THN_DIBANGUN_BNG: "thnDibangunBng", THN_RENOVASI_BNG: "thnRenovasiBng",
    KONDISI_BNG: "kondisiBng", JNS_KONSTRUKSI_BNG: "jnsKonstruksiBng",
    JNS_ATAP_BNG: "jnsAtapBng", KD_DINDING: "kdDinding", KD_LANTAI: "kdLantai", KD_LANGIT_LANGIT: "kdLangitLangit",
    NILAI_SISTEM_BNG: "nilaiSistemBng", NILAI_INDIVIDU: "nilaiIndividu",
    TGL_PENDATAAN_BNG: "tglPendataanBng", NIP_PENDATA_BNG: "nipPendataBng",
    TGL_PEMERIKSAAN_BNG: "tglPemeriksaanBng", NIP_PEMERIKSA_BNG: "nipPemeriksaBng",
    TGL_KUNJUNGAN_KEMBALI: "tglKunjunganKembali",
    AKTIF: "aktif",
    // Legacy columns not in Drizzle:
    TGL_PEREKAMAN_BNG: null, NIP_PEREKAM_BNG: null,
  },
  dat_fasilitas_bangunan: {
    KD_PROPINSI: "kdPropinsi", KD_DATI2: "kdDati2", KD_KECAMATAN: "kdKecamatan",
    KD_KELURAHAN: "kdKelurahan", KD_BLOK: "kdBlok", NO_URUT: "noUrut", KD_JNS_OP: "kdJnsOp",
    NO_BNG: "noBng", KD_FASILITAS: "kdFasilitas", JML_SATUAN: "jmlSatuan",
  },
  fasilitas: {
    KD_FASILITAS: "kdFasilitas", NM_FASILITAS: "nmFasilitas",
    SATUAN_FASILITAS: "satuanFasilitas", STATUS_FASILITAS: "statusFasilitas",
    KETERGANTUNGAN: "ketergantungan",
  },
  dat_legalitas_bumi: {
    KD_PROPINSI: "kdPropinsi", KD_DATI2: "kdDati2", KD_KECAMATAN: "kdKecamatan",
    KD_KELURAHAN: "kdKelurahan", KD_BLOK: "kdBlok", NO_URUT: "noUrut", KD_JNS_OP: "kdJnsOp",
    NO_LEGALITAS_TANAH: "noLegalitasTanah",
  },
  ref_propinsi: {
    KD_PROPINSI: "kdPropinsi", NM_PROPINSI: "nmPropinsi",
  },
  ref_dati2: {
    KD_PROPINSI: "kdPropinsi", KD_DATI2: "kdDati2", NM_DATI2: "nmDati2",
  },
  ref_kecamatan: {
    KD_PROPINSI: "kdPropinsi", KD_DATI2: "kdDati2", KD_KECAMATAN: "kdKecamatan",
    NM_KECAMATAN: "nmKecamatanOnly", // DB has NM_KECAMATAN which maps to nmKecamatanOnly in Drizzle
  },
  ref_kelurahan: {
    KD_PROPINSI: "kdPropinsi", KD_DATI2: "kdDati2", KD_KECAMATAN: "kdKecamatan",
    KD_KELURAHAN: "kdKelurahan", KD_SEKTOR: "kdSektor",
    NM_KELURAHAN: "nmKelurahanOnly", // DB has NM_KELURAHAN which maps to nmKelurahanOnly in Drizzle
    NO_KELURAHAN: "noKelurahan", KD_POS_KELURAHAN: "kdPosKelurahan",
  },
};

// ─── Column type classification ───────────────────────────────────────
// Numeric columns (int/tinyint/bigint/year) → bare number
const NUMERIC_COLS = new Set([
  "LUAS_BUMI", "LUAS_BNG", "NILAI_SISTEM_BUMI", "NILAI_SISTEM_BNG",
  "NO_BNG", "JML_LANTAI_BNG", "JML_SATUAN", "NO_KELURAHAN", "SIKLUS_SPPT",
  "PEMBAYARAN_KE", "PEMBAYARAN_SPPT_KE", "AKTIF", "THN_PAJAK_SPPT",
  "LUAS_BUMI_BEBAN", "LUAS_BNG_BEBAN", "NILAI_SISTEM_BUMI_BEBAN",
  "NILAI_SISTEM_BNG_BEBAN", "NJOP_BUMI_BEBAN", "NJOP_BNG_BEBAN",
  "TING_KOLOM_JPB3", "LBR_BENT_JPB3", "DAYA_DUKUNG_LANTAI_JPB3",
  "KELILING_DINDING_JPB3", "LUAS_MEZZANINE_JPB3",
  "KLS_JPB2", "KLS_JPB4", "KLS_JPB5", "KLS_JPB6", "KLS_JPB13", "KLS_JPB16",
  "BINTANG_JPB7", "JML_KMR_JPB7",
]);

// Decimal columns → string literal (Drizzle accepts strings for decimal)
const DECIMAL_COLS = new Set([
  "LUAS_BUMI_SPPT", "LUAS_BNG_SPPT",
  "NJOP_BUMI_SPPT", "NJOP_BNG_SPPT", "NJOP_SPPT",
  "NJOPTKP_SPPT", "NJKP_SPPT", "PBB_TERHUTANG_SPPT",
  "FAKTOR_PENGURANG_SPPT", "PBB_YG_HARUS_DIBAYAR_SPPT",
  "DENDA_SPPT", "JML_SPPT_YG_DIBAYAR",
  "NILAI_FASILITAS",
  "LUAS_KMR_JPB7_DGN_AC_SENT", "LUAS_KMR_LAIN_JPB7_DGN_AC_SENT",
]);

const DATETIME_COLS = new Set([
  "TGL_PENDATAAN_OP", "TGL_PEMERIKSAAN_OP",
  "TGL_PENDATAAN_BNG", "TGL_PEMERIKSAAN_BNG", "TGL_KUNJUNGAN_KEMBALI",
  "TGL_PEMBAYARAN_SPPT",
]);

const DATE_COLS = new Set([
  "TGL_JATUH_TEMPO_SPPT", "TGL_TERBIT_SPPT", "TGL_CETAK_SPPT",
]);

// ─── TSV Reader ───────────────────────────────────────────────────────
function readTsv(filePath) {
  const content = fs.readFileSync(filePath, "utf-8").trim();
  if (!content) return [];
  return content.split("\n").map((line) => line.split("\t"));
}

// ─── Read DB column names from _cols.tsv ──────────────────────────────
function readDbCols(name) {
  const colFile = path.join(OUT_DIR, `${name}_cols.tsv`);
  if (!fs.existsSync(colFile)) return null;
  return fs.readFileSync(colFile, "utf-8").trim().split("\n").filter(Boolean);
}

// ─── Convert TSV to Drizzle-mapped objects using DB column order ──────
function convertTsv(tsvFile, mapping, colsOverride) {
  const rows = readTsv(tsvFile);
  if (rows.length === 0) return [];

  // Use actual DB column order
  const dbCols = colsOverride || readDbCols(
    path.basename(tsvFile).replace(".tsv", "")
  );
  if (!dbCols) throw new Error(`No columns for ${tsvFile}`);

  return rows.map((row) => {
    const obj = {};
    for (let i = 0; i < dbCols.length; i++) {
      const dbCol = dbCols[i];
      const drizzleField = mapping[dbCol];
      if (!drizzleField) continue; // skip unmapped or null-mapped
      const rawVal = i < row.length ? row[i] : undefined;
      obj[drizzleField] = rawVal === "NULL" || rawVal === "\\N" || rawVal === "" ? null : rawVal;
    }
    return obj;
  });
}
function serializeVal(val, dbCol) {
  if (val === null || val === "NULL" || val === "\\N" || val === "" || val === undefined) return null;
  if (DATETIME_COLS.has(dbCol)) return `new Date("${val.replace(" ", "T")}")`;
  if (DATE_COLS.has(dbCol)) return `new Date("${val}")`;
  if (NUMERIC_COLS.has(dbCol)) return val;
  if (DECIMAL_COLS.has(dbCol)) return `"${val}"`;
  // Everything else (char, varchar) → string
  return JSON.stringify(val);
}

// ─── Serialize an array of objects to TypeScript ──────────────────────
function serializeArray(name, objects, dbColMapping) {
  if (objects.length === 0) return `export const ${name} = [] as const;`;

  const lines = objects.map((obj) => {
    const pairs = Object.entries(obj).map(([key, rawVal]) => {
      // Find the DB col name for this drizzle field
      const dbCol = Object.entries(dbColMapping).find(([, v]) => v === key)?.[0] || "";
      const serialized = serializeVal(rawVal, dbCol);
      return `${key}: ${serialized}`;
    });
    return "  { " + pairs.join(", ") + " }";
  });

  return `export const ${name} = [\n${lines.join(",\n")},\n] as const;`;
}

// ─── Main ─────────────────────────────────────────────────────────────
function main() {
  console.log("🔄 Generating TypeScript data file from extracted TSV data...\n");

  const tables = [
    { name: "sampleRefPropinsi", tsv: "ref_propinsi", mapping: MAPPINGS.ref_propinsi },
    { name: "sampleRefDati2", tsv: "ref_dati2", mapping: MAPPINGS.ref_dati2 },
    { name: "sampleRefKecamatan", tsv: "ref_kecamatan", mapping: MAPPINGS.ref_kecamatan },
    { name: "sampleRefKelurahan", tsv: "ref_kelurahan", mapping: MAPPINGS.ref_kelurahan },
    { name: "sampleFasilitas", tsv: "fasilitas", mapping: MAPPINGS.fasilitas },
    { name: "sampleDatSubjekPajak", tsv: "dat_subjek_pajak", mapping: MAPPINGS.dat_subjek_pajak },
    { name: "sampleSpop", tsv: "spop", mapping: MAPPINGS.spop },
    { name: "sampleDatOpBangunan", tsv: "dat_op_bangunan", mapping: MAPPINGS.dat_op_bangunan },
    { name: "sampleDatFasilitasBangunan", tsv: "dat_fasilitas_bangunan", mapping: MAPPINGS.dat_fasilitas_bangunan },
    { name: "sampleDatLegalitasBumi", tsv: "dat_legalitas_bumi", mapping: MAPPINGS.dat_legalitas_bumi },
  ];

  // Column file prefix lookup (table name → _cols.tsv prefix)
  const COL_PREFIX = {
    ref_propinsi: "prop", ref_dati2: "dati2", ref_kecamatan: "kec",
    ref_kelurahan: "kel", fasilitas: "fasmaster", dat_subjek_pajak: "subjek",
    spop: "spop", dat_op_bangunan: "bangunan", dat_fasilitas_bangunan: "fas",
    dat_legalitas_bumi: "legal",
  };

  const blocks = [];
  for (const t of tables) {
    const tsvPath = path.join(OUT_DIR, `${t.tsv}.tsv`);
    const colPrefix = COL_PREFIX[t.tsv];
    const dbCols = colPrefix ? readDbCols(colPrefix) : null;
    let objects;
    if (t.tsv === "spop") {
      const rowsA = convertTsv(path.join(OUT_DIR, "spop_a.tsv"), t.mapping, dbCols);
      const rowsB = convertTsv(path.join(OUT_DIR, "spop_b.tsv"), t.mapping, dbCols);
      objects = [...rowsA, ...rowsB];
    } else if (t.tsv === "ref_kelurahan") {
      const rowsA = convertTsv(path.join(OUT_DIR, "ref_kel_a.tsv"), t.mapping, dbCols);
      const rowsB = convertTsv(path.join(OUT_DIR, "ref_kel_b.tsv"), t.mapping, dbCols);
      objects = [...rowsA, ...rowsB];
    } else {
      objects = convertTsv(tsvPath, t.mapping, dbCols);
    }
    console.log(`  ${t.name}: ${objects.length} rows`);
    blocks.push(serializeArray(t.name, objects, t.mapping));
  }

  // Handle SPPT - needs special column mapping
  const spptMapping = {
    KD_PROPINSI: "kdPropinsi", KD_DATI2: "kdDati2", KD_KECAMATAN: "kdKecamatan",
    KD_KELURAHAN: "kdKelurahan", KD_BLOK: "kdBlok", NO_URUT: "noUrut", KD_JNS_OP: "kdJnsOp",
    THN_PAJAK_SPPT: "thnPajakSppt", SIKLUS_SPPT: "siklusSppt",
    KD_KLS_TANAH: "kdKlsTanah", KD_KLS_BNG: "kdKlsBng",
    TGL_JATUH_TEMPO_SPPT: "tglJatuhTempo", TGL_TERBIT_SPPT: "tglTerbit", TGL_CETAK_SPPT: "tglCetak",
    LUAS_BUMI_SPPT: "luasBumi", LUAS_BNG_SPPT: "luasBng",
    NJOP_BUMI_SPPT: "njopBumi", NJOP_BNG_SPPT: "njopBng", NJOP_SPPT: "njopSppt",
    NJOPTKP_SPPT: "njoptkpSppt", NJKP_SPPT: "njkpSppt",
    PBB_TERHUTANG_SPPT: "pbbTerhutangSppt", FAKTOR_PENGURANG_SPPT: "faktorPengurangSppt",
    PBB_YG_HARUS_DIBAYAR_SPPT: "pbbYgHarusDibayarSppt",
    STATUS_PEMBAYARAN_SPPT: "statusPembayaranSppt",
    STATUS_TAGIHAN_SPPT: "statusTagihanSppt", STATUS_CETAK_SPPT: "statusCetakSppt",
    NM_WP_SPPT: "nmWp", JLN_WP_SPPT: "jalanWp",
    // Skip legacy columns
    KD_KANWIL_BANK: null, KD_KPPBB_BANK: null, KD_BANK_TUNGGAL: null,
    KD_BANK_PERSEPSI: null, KD_TP: null, BLOK_KAV_NO_WP_SPPT: null,
    RW_WP_SPPT: null, RT_WP_SPPT: null, KELURAHAN_WP_SPPT: null,
    KOTA_WP_SPPT: null, KD_POS_WP_SPPT: null, NPWP_SPPT: null,
    NO_PERSIL_SPPT: null, THN_AWAL_KLS_TANAH: null, THN_AWAL_KLS_BNG: null,
    NIP_PENCETAK_SPPT: null,
  };
  const spptCols = readDbCols("sppt");
  const spptObjects = convertTsv(path.join(OUT_DIR, "sppt.tsv"), spptMapping, spptCols);
  console.log(`  sampleSppt: ${spptObjects.length} rows`);
  blocks.push(serializeArray("sampleSppt", spptObjects, spptMapping));

  // Handle pembayaran_sppt - needs special mapping
  const bayarMapping = {
    KD_PROPINSI: "kdPropinsi", KD_DATI2: "kdDati2", KD_KECAMATAN: "kdKecamatan",
    KD_KELURAHAN: "kdKelurahan", KD_BLOK: "kdBlok", NO_URUT: "noUrut", KD_JNS_OP: "kdJnsOp",
    THN_PAJAK_SPPT: "thnPajakSppt",
    PEMBAYARAN_SPPT_KE: "pembayaranKe",
    TGL_PEMBAYARAN_SPPT: "tglPembayaranSppt",
    JML_SPPT_YG_DIBAYAR: "jmlSpptYgDibayar", DENDA_SPPT: "dendaSppt",
    // Skip legacy columns not in Drizzle
    KD_KANWIL_BANK: null, KD_KPPBB_BANK: null, KD_BANK_TUNGGAL: null,
    KD_BANK_PERSEPSI: null, KD_TP: null,
    TGL_REKAM_BYR_SPPT: null, NIP_REKAM_BYR_SPPT: null, NO_BUKTI: null,
  };
  const bayarCols = readDbCols("bayar");
  const bayarObjects = convertTsv(path.join(OUT_DIR, "pembayaran_sppt.tsv"), bayarMapping, bayarCols);
  console.log(`  samplePembayaranSppt: ${bayarObjects.length} rows`);
  blocks.push(serializeArray("samplePembayaranSppt", bayarObjects, bayarMapping));

  // Assemble the file
  const content = `/**
 * Auto-generated sample SPOP data for development seeding.
 * DO NOT EDIT MANUALLY — regenerate with: npx tsx scripts/extract-sample-data.ts
 *
 * 100 SPOP records from 2 kelurahan in different kecamatan:
 *   - Kelurahan 51.71.010.001 (Kec. 010, 50 records)
 *   - Kelurahan 51.71.030.008 (Kec. 030, 50 records)
 */

${blocks.join("\n\n")}
`;

  fs.writeFileSync(OUT_FILE, content, "utf-8");
  console.log(`\n✅ Written to ${OUT_FILE}`);
  console.log(`   Size: ${(fs.statSync(OUT_FILE).size / 1024).toFixed(1)} KB`);
}

main();
