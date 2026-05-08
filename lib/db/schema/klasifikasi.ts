import {
  mysqlTable,
  varchar,
  char,
  decimal,
  int,
  year,
  tinyint,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─── kelas_bumi ───────────────────────────────────────────────────

export const kelasBumi = mysqlTable("kelas_bumi", {
  kelasBumi: varchar("KELAS_BUMI", { length: 5 }).primaryKey(),
  nilaiMinimum: decimal("NILAI_MINIMUM", { precision: 8, scale: 2 }).notNull(),
  nilaiMaksimum: decimal("NILAI_MAKSIMUM", { precision: 8, scale: 2 }).notNull(),
  njopBumi: decimal("NJOP_BUMI", { precision: 8, scale: 2 }).notNull(),
});

// ─── kelas_bangunan ───────────────────────────────────────────────

export const kelasBangunan = mysqlTable("kelas_bangunan", {
  kelasBangunan: varchar("KELAS_BANGUNAN", { length: 5 }).primaryKey(),
  nilaiMinimum: decimal("NILAI_MINIMUM", { precision: 8, scale: 2 }).notNull(),
  nilaiMaksimum: decimal("NILAI_MAKSIMUM", { precision: 8, scale: 2 }).notNull(),
  njopBangunan: decimal("NJOP_BANGUNAN", { precision: 8, scale: 2 }).notNull(),
});

// ─── kelas_tanah ──────────────────────────────────────────────────
// Note: This table is often used for historical land classes or specific cycles.

export const kelasTanah = mysqlTable("kelas_tanah", {
  kdKlsTanah: char("KD_KLS_TANAH", { length: 3 }).notNull(),
  thnAwalKlsTanah: char("THN_AWAL_KLS_TANAH", { length: 4 }).notNull(),
  thnAkhirKlsTanah: char("THN_AKHIR_KLS_TANAH", { length: 4 }).notNull(),
  nilaiMinTanah: decimal("NILAI_MIN_TANAH", { precision: 15, scale: 2 }),
  nilaiMaxTanah: decimal("NILAI_MAX_TANAH", { precision: 15, scale: 2 }),
  nilaiPerM2Tanah: decimal("NILAI_PER_M2_TANAH", { precision: 15, scale: 2 }),
}, (table) => [
  primaryKey({ columns: [table.kdKlsTanah, table.thnAwalKlsTanah, table.thnAkhirKlsTanah] }),
]);

// ─── tarif ────────────────────────────────────────────────────────

export const tarif = mysqlTable("tarif", {
  id: int("ID").autoincrement().primaryKey(),
  thnAwal: year("THN_AWAL").notNull(),
  thnAkhir: year("THN_AKHIR"),
  njopMin: decimal("NJOP_MIN", { precision: 15, scale: 2 }).notNull(),
  njopMax: decimal("NJOP_MAX", { precision: 15, scale: 2 }).notNull(),
  nilaiTarif: decimal("NILAI_TARIF", { precision: 8, scale: 4 }).notNull(),
});

// ─── jenis_sppt ───────────────────────────────────────────────────

export const jenisSppt = mysqlTable(
  "jenis_sppt",
  {
    id: int("ID").autoincrement().primaryKey(),
    name: varchar("NAME", { length: 100 }).notNull(),
    tarifKhusus: decimal("TARIF_KHUSUS", { precision: 8, scale: 4 }),
    njkpKhusus: int("NJKP_KHUSUS"),
  }
);

// ─── fasilitas ────────────────────────────────────────────────────

export const fasilitas = mysqlTable("fasilitas", {
  kdFasilitas: char("KD_FASILITAS", { length: 2 }).primaryKey(),
  nmFasilitas: varchar("NM_FASILITAS", { length: 63 }).notNull(),
  satuanFasilitas: varchar("SATUAN_FASILITAS", { length: 10 }).notNull(),
  nilaiFasilitas: decimal("NILAI_FASILITAS", { precision: 15, scale: 2 }).notNull().default("0"),
  statusFasilitas: char("STATUS_FASILITAS", { length: 1 }).notNull().default("1"),
  ketergantungan: char("KETERGANTUNGAN", { length: 1 }).notNull().default("0"),
});
