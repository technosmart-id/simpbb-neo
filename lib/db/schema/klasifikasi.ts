import {
  mysqlTable,
  varchar,
  char,
  int,
  decimal,
  year,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

// ─── kelas_bumi ───────────────────────────────────────────────────

export const kelasBumi = mysqlTable("kelas_bumi", {
  kelasBumi: varchar("KELAS_BUMI", { length: 5 }).notNull().primaryKey(),
  nilaiMinimum: decimal("NILAI_MINIMUM", { precision: 8, scale: 2 }).notNull(),
  nilaiMaksimum: decimal("NILAI_MAKSIMUM", { precision: 8, scale: 2 }).notNull(),
  njopBumi: decimal("NJOP_BUMI", { precision: 8, scale: 2 }).notNull(),
}, (table) => [
  index("idx_kelas_bumi_minimum").on(table.nilaiMinimum),
]);

// ─── kelas_bangunan ───────────────────────────────────────────────

export const kelasBangunan = mysqlTable("kelas_bangunan", {
  kelasBangunan: varchar("KELAS_BANGUNAN", { length: 5 }).notNull().primaryKey(),
  nilaiMinimum: decimal("NILAI_MINIMUM", { precision: 8, scale: 2 }).notNull(),
  nilaiMaksimum: decimal("NILAI_MAKSIMUM", { precision: 8, scale: 2 }).notNull(),
  njopBangunan: decimal("NJOP_BANGUNAN", { precision: 8, scale: 2 }).notNull(),
}, (table) => [
  index("idx_kelas_bangunan_minimum").on(table.nilaiMinimum),
]);

// ─── jenis_sppt ───────────────────────────────────────────────────

export const jenisSppt = mysqlTable(
  "jenis_sppt",
  {
    id: int("ID").autoincrement().primaryKey(),
    name: varchar("NAME", { length: 255 }),
    tarifKhusus: decimal("TARIF_KHUSUS", { precision: 3, scale: 3 }),
    njkpKhusus: int("NJKP_KHUSUS"),
  }
);

// ─── fasilitas ────────────────────────────────────────────────────

export const fasilitas = mysqlTable("fasilitas", {
  kdFasilitas: char("KD_FASILITAS", { length: 2 }).primaryKey(),
  nmFasilitas: varchar("NM_FASILITAS", { length: 50 }),
  satuanFasilitas: varchar("SATUAN_FASILITAS", { length: 10 }),
  statusFasilitas: char("STATUS_FASILITAS", { length: 1 }),
  ketergantungan: char("KETERGANTUNGAN", { length: 1 }),
});
