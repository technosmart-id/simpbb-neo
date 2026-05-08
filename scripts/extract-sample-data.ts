/**
 * Extract sample SPOP data from remote database
 * Usage: npx tsx scripts/extract-sample-data.ts [REMOTE_DB_URL]
 *
 * Generates lib/db/seed/sample-spop-data.ts with 100 sample SPOP records
 * (50 from one kelurahan + 50 from another kelurahan in a different kecamatan)
 * along with all related tables.
 */

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const REMOTE_DB_URL = process.argv[2] || process.env.REMOTE_DB_URL;

if (!REMOTE_DB_URL) {
  console.error(
    "❌ Provide remote DB URL as argument or REMOTE_DB_URL env var"
  );
  console.error(
    "   Usage: npx tsx scripts/extract-sample-data.ts mysql://user:pass@host:port/db"
  );
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────

function serializeValue(val: unknown): string {
  if (val === null || val === undefined) return "null";
  if (val instanceof Date) return `new Date("${val.toISOString()}")`;
  if (typeof val === "number") return String(val);
  if (typeof val === "bigint") return String(val);
  if (typeof val === "string") return JSON.stringify(val);
  if (typeof val === "boolean") return String(val);
  return JSON.stringify(String(val));
}

function serializeRow(row: Record<string, unknown>): string {
  const pairs = Object.entries(row).map(([k, v]) => `${k}: ${serializeValue(v)}`);
  return "  { " + pairs.join(", ") + " }";
}

function serializeArray(name: string, rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return `export const ${name}: Record<string, unknown>[] = [];`;
  const items = rows.map(serializeRow).join(",\n");
  return `export const ${name} = [\n${items},\n] as const;`;
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🔌 Connecting to remote database...");
  const conn = await mysql.createConnection(REMOTE_DB_URL!);
  console.log("  ✓ Connected\n");

  // ── Step 1: Find two kelurahan from different kecamatan ──────────
  console.log("📍 Finding sample kelurahan...");

  const [topKelRows]: any = await conn.query(`
    SELECT KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, COUNT(*) as cnt
    FROM spop
    GROUP BY KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN
    ORDER BY cnt DESC
    LIMIT 10
  `);

  if (topKelRows.length < 2) {
    console.error("❌ Need at least 2 kelurahan with data, found:", topKelRows.length);
    process.exit(1);
  }

  const kelA = topKelRows[0];
  // Pick kelurahan B from a DIFFERENT kecamatan
  const kelB = topKelRows.find(
    (r: any) =>
      r.KD_KECAMATAN !== kelA.KD_KECAMATAN ||
      r.KD_PROPINSI !== kelA.KD_PROPINSI ||
      r.KD_DATI2 !== kelA.KD_DATI2
  );

  if (!kelB) {
    console.error("❌ Could not find a second kelurahan from a different kecamatan");
    process.exit(1);
  }

  console.log(`  ✓ Kelurahan A: ${kelA.KD_PROPINSI}.${kelA.KD_DATI2}.${kelA.KD_KECAMATAN}.${kelA.KD_KELURAHAN} (${kelA.cnt} SPOP)`);
  console.log(`  ✓ Kelurahan B: ${kelB.KD_PROPINSI}.${kelB.KD_DATI2}.${kelB.KD_KECAMATAN}.${kelB.KD_KELURAHAN} (${kelB.cnt} SPOP)\n`);

  // ── Step 2: Select 50 random SPOP from each kelurahan ────────────
  console.log("📋 Selecting 50 random SPOP from each kelurahan...");

  const [spopA]: any = await conn.query(
    `SELECT * FROM spop WHERE KD_PROPINSI = ? AND KD_DATI2 = ? AND KD_KECAMATAN = ? AND KD_KELURAHAN = ? ORDER BY RAND() LIMIT 50`,
    [kelA.KD_PROPINSI, kelA.KD_DATI2, kelA.KD_KECAMATAN, kelA.KD_KELURAHAN]
  );

  const [spopB]: any = await conn.query(
    `SELECT * FROM spop WHERE KD_PROPINSI = ? AND KD_DATI2 = ? AND KD_KECAMATAN = ? AND KD_KELURAHAN = ? ORDER BY RAND() LIMIT 50`,
    [kelB.KD_PROPINSI, kelB.KD_DATI2, kelB.KD_KECAMATAN, kelB.KD_KELURAHAN]
  );

  const allSpop = [...spopA, ...spopB];
  console.log(`  ✓ Selected ${allSpop.length} SPOP records\n`);

  // Build NOP tuples for child queries
  const nopTuples = allSpop.map(
    (s: any) => `('${s.KD_PROPINSI}','${s.KD_DATI2}','${s.KD_KECAMATAN}','${s.KD_KELURAHAN}','${s.KD_BLOK}','${s.NO_URUT}','${s.KD_JNS_OP}')`
  );
  const nopIn = nopTuples.join(",");

  // Build kelurahan-level filter for the 2 kelurahan
  const kelFilter = `('${kelA.KD_PROPINSI}','${kelA.KD_DATI2}','${kelA.KD_KECAMATAN}','${kelA.KD_KELURAHAN}'),('${kelB.KD_PROPINSI}','${kelB.KD_DATI2}','${kelB.KD_KECAMATAN}','${kelB.KD_KELURAHAN}')`;

  // ── Step 3: Fetch dat_subjek_pajak ───────────────────────────────
  console.log("👤 Fetching dat_subjek_pajak...");
  const subjekIds = [...new Set(allSpop.map((s: any) => s.SUBJEK_PAJAK_ID))];
  const subjekPlaceholders = subjekIds.map(() => "?").join(",");
  const [datSubjekPajak]: any = await conn.query(
    `SELECT * FROM dat_subjek_pajak WHERE SUBJEK_PAJAK_ID IN (${subjekPlaceholders})`,
    subjekIds
  );
  console.log(`  ✓ ${datSubjekPajak.length} records\n`);

  // ── Step 4: Fetch dat_op_bangunan ────────────────────────────────
  console.log("🏗️  Fetching dat_op_bangunan...");
  const [datOpBangunan]: any = await conn.query(`
    SELECT b.* FROM dat_op_bangunan b
    WHERE (b.KD_PROPINSI, b.KD_DATI2, b.KD_KECAMATAN, b.KD_KELURAHAN, b.KD_BLOK, b.NO_URUT, b.KD_JNS_OP)
    IN (${nopIn})
  `);
  console.log(`  ✓ ${datOpBangunan.length} records\n`);

  // ── Step 5: Fetch dat_fasilitas_bangunan ─────────────────────────
  console.log("🏠 Fetching dat_fasilitas_bangunan...");
  let datFasilitasBangunan: any[] = [];
  if (datOpBangunan.length > 0) {
    const bangunanNops = datOpBangunan.map(
      (b: any) => `('${b.KD_PROPINSI}','${b.KD_DATI2}','${b.KD_KECAMATAN}','${b.KD_KELURAHAN}','${b.KD_BLOK}','${b.NO_URUT}','${b.KD_JNS_OP}',${b.NO_BNG})`
    ).join(",");
    const [fasRows]: any = await conn.query(`
      SELECT f.* FROM dat_fasilitas_bangunan f
      WHERE (f.KD_PROPINSI, f.KD_DATI2, f.KD_KECAMATAN, f.KD_KELURAHAN, f.KD_BLOK, f.NO_URUT, f.KD_JNS_OP, f.NO_BNG)
      IN (${bangunanNops})
    `);
    datFasilitasBangunan = fasRows;
  }
  console.log(`  ✓ ${datFasilitasBangunan.length} records\n`);

  // ── Step 6: Fetch fasilitas master ───────────────────────────────
  console.log("🔧 Fetching fasilitas master...");
  let fasilitas: any[] = [];
  if (datFasilitasBangunan.length > 0) {
    const fasKds = [...new Set(datFasilitasBangunan.map((f: any) => f.KD_FASILITAS))];
    const [fasRows]: any = await conn.query(
      `SELECT * FROM fasilitas WHERE KD_FASILITAS IN (${fasKds.map(() => "?").join(",")})`,
      fasKds
    );
    fasilitas = fasRows;
  }
  console.log(`  ✓ ${fasilitas.length} records\n`);

  // ── Step 7: Fetch dat_op_induk ───────────────────────────────────
  console.log("🏗️  Fetching dat_op_induk...");
  const [datOpInduk]: any = await conn.query(`
    SELECT i.* FROM dat_op_induk i
    WHERE (i.KD_PROPINSI, i.KD_DATI2, i.KD_KECAMATAN, i.KD_KELURAHAN, i.KD_BLOK, i.NO_URUT, i.KD_JNS_OP)
    IN (${nopIn})
  `);
  console.log(`  ✓ ${datOpInduk.length} records\n`);

  // ── Step 8: Fetch dat_op_anggota ─────────────────────────────────
  console.log("👥 Fetching dat_op_anggota...");
  const [datOpAnggota]: any = await conn.query(`
    SELECT a.* FROM dat_op_anggota a
    WHERE (a.KD_PROPINSI, a.KD_DATI2, a.KD_KECAMATAN, a.KD_KELURAHAN, a.KD_BLOK, a.NO_URUT, a.KD_JNS_OP)
    IN (${nopIn})
  `);
  console.log(`  ✓ ${datOpAnggota.length} records\n`);

  // ── Step 9: Fetch dat_legalitas_bumi ─────────────────────────────
  console.log("📄 Fetching dat_legalitas_bumi...");
  const [datLegalitasBumi]: any = await conn.query(`
    SELECT l.* FROM dat_legalitas_bumi l
    WHERE (l.KD_PROPINSI, l.KD_DATI2, l.KD_KECAMATAN, l.KD_KELURAHAN, l.KD_BLOK, l.NO_URUT, l.KD_JNS_OP)
    IN (${nopIn})
  `);
  console.log(`  ✓ ${datLegalitasBumi.length} records\n`);

  // ── Step 10: Fetch sppt ──────────────────────────────────────────
  console.log("📊 Fetching sppt...");
  const [spptRows]: any = await conn.query(`
    SELECT s.* FROM sppt s
    WHERE (s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN, s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP)
    IN (${nopIn})
  `);
  console.log(`  ✓ ${spptRows.length} records\n`);

  // ── Step 11: Fetch pembayaran_sppt ───────────────────────────────
  console.log("💰 Fetching pembayaran_sppt...");
  let pembayaranSppt: any[] = [];
  if (spptRows.length > 0) {
    const spptNops = spptRows.map(
      (s: any) => `('${s.KD_PROPINSI}','${s.KD_DATI2}','${s.KD_KECAMATAN}','${s.KD_KELURAHAN}','${s.KD_BLOK}','${s.NO_URUT}','${s.KD_JNS_OP}',${s.THN_PAJAK_SPPT})`
    ).join(",");
    const [payRows]: any = await conn.query(`
      SELECT p.* FROM pembayaran_sppt p
      WHERE (p.KD_PROPINSI, p.KD_DATI2, p.KD_KECAMATAN, p.KD_KELURAHAN, p.KD_BLOK, p.NO_URUT, p.KD_JNS_OP, p.THN_PAJAK_SPPT)
      IN (${spptNops})
    `);
    pembayaranSppt = payRows;
  }
  console.log(`  ✓ ${pembayaranSppt.length} records\n`);

  // ── Step 12: Fetch wilayah reference data ────────────────────────
  console.log("🗺️  Fetching wilayah reference data...");

  const propinsiKds = [...new Set([kelA.KD_PROPINSI, kelB.KD_PROPINSI])];
  const [refPropinsi]: any = await conn.query(
    `SELECT * FROM ref_propinsi WHERE KD_PROPINSI IN (${propinsiKds.map(() => "?").join(",")})`,
    propinsiKds
  );

  const dati2Keys = [
    { prop: kelA.KD_PROPINSI, dati: kelA.KD_DATI2 },
    { prop: kelB.KD_PROPINSI, dati: kelB.KD_DATI2 },
  ];
  const [refDati2]: any = await conn.query(
    `SELECT * FROM ref_dati2 WHERE (KD_PROPINSI, KD_DATI2) IN (${dati2Keys.map(() => "(?,?)").join(",")})`,
    dati2Keys.flatMap((d) => [d.prop, d.dati])
  );

  const kecKeys = [
    { prop: kelA.KD_PROPINSI, dati: kelA.KD_DATI2, kec: kelA.KD_KECAMATAN },
    { prop: kelB.KD_PROPINSI, dati: kelB.KD_DATI2, kec: kelB.KD_KECAMATAN },
  ];
  const [refKecamatan]: any = await conn.query(
    `SELECT * FROM ref_kecamatan WHERE (KD_PROPINSI, KD_DATI2, KD_KECAMATAN) IN (${kecKeys.map(() => "(?,?,?)").join(",")})`,
    kecKeys.flatMap((k) => [k.prop, k.dati, k.kec])
  );

  const kelKeys = [
    { prop: kelA.KD_PROPINSI, dati: kelA.KD_DATI2, kec: kelA.KD_KECAMATAN, kel: kelA.KD_KELURAHAN },
    { prop: kelB.KD_PROPINSI, dati: kelB.KD_DATI2, kec: kelB.KD_KECAMATAN, kel: kelB.KD_KELURAHAN },
  ];
  const [refKelurahan]: any = await conn.query(
    `SELECT * FROM ref_kelurahan WHERE (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN) IN (${kelKeys.map(() => "(?,?,?,?)").join(",")})`,
    kelKeys.flatMap((k) => [k.prop, k.dati, k.kec, k.kel])
  );

  console.log(`  ✓ ${refPropinsi.length} propinsi, ${refDati2.length} dati2, ${refKecamatan.length} kecamatan, ${refKelurahan.length} kelurahan\n`);

  // ── Step 13: Convert column names to camelCase for Drizzle ───────
  console.log("🔄 Converting column names to camelCase...");

  const toCamel = (str: string) =>
    str
      .toLowerCase()
      .replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

  const convertRow = (row: any) => {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(row)) {
      out[toCamel(key)] = val;
    }
    return out;
  };

  const data = {
    sampleRefPropinsi: refPropinsi.map(convertRow),
    sampleRefDati2: refDati2.map(convertRow),
    sampleRefKecamatan: refKecamatan.map(convertRow),
    sampleRefKelurahan: refKelurahan.map(convertRow),
    sampleFasilitas: fasilitas.map(convertRow),
    sampleDatSubjekPajak: datSubjekPajak.map(convertRow),
    sampleSpop: allSpop.map(convertRow),
    sampleDatOpInduk: datOpInduk.map(convertRow),
    sampleDatOpAnggota: datOpAnggota.map(convertRow),
    sampleDatLegalitasBumi: datLegalitasBumi.map(convertRow),
    sampleDatOpBangunan: datOpBangunan.map(convertRow),
    sampleDatFasilitasBangunan: datFasilitasBangunan.map(convertRow),
    sampleSppt: spptRows.map(convertRow),
    samplePembayaranSppt: pembayaranSppt.map(convertRow),
  };

  // ── Step 14: Generate TypeScript file ────────────────────────────
  console.log("📝 Generating TypeScript data file...");

  const blocks = Object.entries(data).map(([name, rows]) =>
    serializeArray(name, rows)
  );

  // Build stats summary
  const stats = Object.entries(data)
    .map(([name, rows]) => `//   ${name}: ${rows.length} rows`)
    .join("\n");

  const fileContent = `/**
 * Auto-generated sample SPOP data for development seeding.
 * DO NOT EDIT MANUALLY — regenerate with: npx tsx scripts/extract-sample-data.ts
 *
 * Data summary:
${stats}
 */

${blocks.join("\n\n")}
`;

  const outPath = path.resolve(process.cwd(), "lib/db/seed/sample-spop-data.ts");
  fs.writeFileSync(outPath, fileContent, "utf-8");
  console.log(`  ✓ Written to ${outPath}\n`);

  // ── Summary ──────────────────────────────────────────────────────
  console.log("══════════════════════════════════════════════════");
  console.log("✅ Extraction complete!");
  console.log("══════════════════════════════════════════════════");
  console.log(`  Kelurahan A: ${kelA.KD_PROPINSI}.${kelA.KD_DATI2}.${kelA.KD_KECAMATAN}.${kelA.KD_KELURAHAN} (50 SPOP)`);
  console.log(`  Kelurahan B: ${kelB.KD_PROPINSI}.${kelB.KD_DATI2}.${kelB.KD_KECAMATAN}.${kelB.KD_KELURAHAN} (50 SPOP)`);
  console.log(`  Total SPOP: ${allSpop.length}`);
  console.log(`  Subjek Pajak: ${datSubjekPajak.length}`);
  console.log(`  Bangunan: ${datOpBangunan.length}`);
  console.log(`  Fasilitas Bangunan: ${datFasilitasBangunan.length}`);
  console.log(`  SPPT: ${spptRows.length}`);
  console.log(`  Pembayaran: ${pembayaranSppt.length}`);
  console.log("══════════════════════════════════════════════════\n");

  await conn.end();
}

main().catch((err) => {
  console.error("❌ Extraction failed:", err);
  process.exit(1);
});
