import { mysqlTable, char, varchar, primaryKey } from "drizzle-orm/mysql-core";

// ─── ref_kategori ─────────────────────────────────────────────────

export const refKategori = mysqlTable(
  "ref_kategori",
  {
    kategori: varchar("KATEGORI", { length: 100 }).notNull(),
    kode: char("KODE", { length: 2 }).notNull(),
    nama: varchar("NAMA", { length: 100 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.kategori, table.kode] })],
);

// ─── ref_jns_pelayanan ────────────────────────────────────────────

export const refJnsPelayanan = mysqlTable("ref_jns_pelayanan", {
  kdJnsPelayanan: char("KD_JNS_PELAYANAN", { length: 2 }).primaryKey(),
  nmJenisPelayanan: varchar("NM_JENIS_PELAYANAN", { length: 100 }).notNull(),
});
