import { char } from "drizzle-orm/pg-core";

// NOP (Nomor Objek Pajak) composite key columns - 18 character code
// Format: PP.DD.KKK.KKK.BBB.UUUU.J
// Example: 51.71.010.001.001.0001.0
export const nopColumns = {
  kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
  kdDati2: char("kd_dati2", { length: 2 }).notNull(),
  kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
  kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
  kdBlok: char("kd_blok", { length: 3 }).notNull(),
  noUrut: char("no_urut", { length: 4 }).notNull(),
  kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
};

// Helper to get NOP primary key columns array
export const nopPrimaryKey = [
  "kdPropinsi",
  "kdDati2",
  "kdKecamatan",
  "kdKelurahan",
  "kdBlok",
  "noUrut",
  "kdJnsOp",
] as const;
