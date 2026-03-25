import {
  mysqlTable,
  varchar,
  char,
  decimal,
  int,
  year,
  tinyint,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─── kelas_bumi ───────────────────────────────────────────────────

export const kelasBumi = mysqlTable("kelas_bumi", {
  kelasBumi: varchar("KELAS_BUMI", { length: 5 }).primaryKey(),
  nilaiMinimum: decimal("NILAI_MINIMUM", { precision: 15, scale: 2 }).notNull(),
  nilaiMaksimum: decimal("NILAI_MAKSIMUM", { precision: 15, scale: 2 }).notNull(),
  njopBumi: decimal("NJOP_BUMI", { precision: 15, scale: 2 }).notNull(),
});

// ─── kelas_bangunan ───────────────────────────────────────────────

export const kelasBangunan = mysqlTable("kelas_bangunan", {
  kelasBangunan: varchar("KELAS_BANGUNAN", { length: 5 }).primaryKey(),
  nilaiMinimum: decimal("NILAI_MINIMUM", { precision: 15, scale: 2 }).notNull(),
  nilaiMaksimum: decimal("NILAI_MAKSIMUM", { precision: 15, scale: 2 }).notNull(),
  njopBangunan: decimal("NJOP_BANGUNAN", { precision: 15, scale: 2 }).notNull(),
});

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
    kode: varchar("KODE", { length: 10 }).notNull(),
    nama: varchar("NAMA", { length: 100 }).notNull(),
    tarifKhusus: decimal("TARIF_KHUSUS", { precision: 8, scale: 4 }),
    aktif: tinyint("AKTIF").notNull().default(1),
  },
  (table) => [uniqueIndex("uk_jenis_sppt_kode").on(table.kode)],
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
