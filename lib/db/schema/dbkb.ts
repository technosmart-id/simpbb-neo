import { mysqlTable, int, char, varchar, decimal, index } from "drizzle-orm/mysql-core";

export const materialBangunan = mysqlTable(
  "material_bangunan",
  {
    id: int("ID").autoincrement().primaryKey(),
    kategori: char("KATEGORI", { length: 2 }).notNull(),          // A1, A2, A3, B
    kodeMaterial: varchar("KODE_MATERIAL", { length: 10 }).notNull(),
    namaMaterial: varchar("NAMA_MATERIAL", { length: 100 }).notNull(),
    nilaiAwal: decimal("NILAI_AWAL", { precision: 15, scale: 2 }).notNull().default("0"),
    nilaiBaru: decimal("NILAI_BARU", { precision: 15, scale: 2 }).notNull().default("0"),
    thnBerlaku: char("THN_BERLAKU", { length: 4 }).notNull(),
  },
  (table) => [
    index("idx_mat_bng_kategori").on(table.kategori),
    index("idx_mat_bng_thn").on(table.thnBerlaku),
  ],
);

export const refKategoriMaterialBangunan = mysqlTable(
  "ref_kategori_material_bangunan",
  {
    kategori: char("KATEGORI", { length: 2 }).primaryKey(),
    namaKategori: varchar("NAMA_KATEGORI", { length: 100 }).notNull(),
    bobot: decimal("BOBOT", { precision: 5, scale: 2 }).notNull(),
  },
);
