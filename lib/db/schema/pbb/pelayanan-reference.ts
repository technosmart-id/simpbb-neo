import { char, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

// ref_kanwil - Regional office reference
export const refKanwil = pgTable("ref_kanwil", {
  kdKanwil: char("kd_kanwil", { length: 2 }).primaryKey(),
  nmKanwil: varchar("nm_kanwil", { length: 30 }).notNull(),
  alKanwil: varchar("al_kanwil", { length: 50 }).notNull(),
  kotaTerbitKanwil: varchar("kota_terbit_kanwil", { length: 30 }).notNull(),
  noFaksimili: varchar("no_faksimili", { length: 50 }),
  noTelpon: varchar("no_telpon", { length: 50 }),
});

// ref_kppbb - Tax service office reference
export const refKppbb = pgTable(
  "ref_kppbb",
  {
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    nmKppbb: varchar("nm_kppbb", { length: 30 }).notNull(),
    alKppbb: varchar("al_kppbb", { length: 50 }).notNull(),
    kotaTerbitKppbb: varchar("kota_terbit_kppbb", { length: 30 }).notNull(),
    noFaksimili: varchar("no_faksimili", { length: 50 }),
    noTelpon: varchar("no_telpon", { length: 50 }),
  },
  (table) => [primaryKey({ columns: [table.kdKanwil, table.kdKppbb] })]
);

// ref_jns_pelayanan - Service type reference
export const refJnsPelayanan = pgTable("ref_jns_pelayanan", {
  kdJnsPelayanan: char("kd_jns_pelayanan", { length: 2 }).primaryKey(),
  nmJenisPelayanan: varchar("nm_jenis_pelayanan", { length: 50 }).notNull(),
});

// ref_seksi - Section reference
export const refSeksi = pgTable("ref_seksi", {
  kdSeksi: char("kd_seksi", { length: 2 }).primaryKey(),
  nmSeksi: varchar("nm_seksi", { length: 75 }).notNull(),
  noSrtSeksi: char("no_srt_seksi", { length: 2 }).notNull(),
  kodeSurat1: varchar("kode_surat_1", { length: 5 }).notNull(),
  kodeSurat2: varchar("kode_surat_2", { length: 5 }).notNull(),
});

// Export types
export type RefKanwil = typeof refKanwil.$inferSelect;
export type RefKppbb = typeof refKppbb.$inferSelect;
export type RefJnsPelayanan = typeof refJnsPelayanan.$inferSelect;
export type RefSeksi = typeof refSeksi.$inferSelect;
