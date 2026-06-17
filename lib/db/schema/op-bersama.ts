import {
  mysqlTable,
  varchar,
  bigint,
  primaryKey,
} from "drizzle-orm/mysql-core";

// ─── dat_op_induk ─────────────────────────────────────────────────
export const datOpInduk = mysqlTable("dat_op_induk", {
  kdPropinsi: varchar("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: varchar("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: varchar("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: varchar("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: varchar("KD_BLOK", { length: 3 }).notNull(),
  noUrut: varchar("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: varchar("KD_JNS_OP", { length: 1 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_dat_op_induk", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp] }),
]);

// ─── dat_op_anggota ─────────────────────────────────────────────────
export const datOpAnggota = mysqlTable("dat_op_anggota", {
  kdPropinsiInduk: varchar("KD_PROPINSI_INDUK", { length: 2 }).notNull(),
  kdDati2Induk: varchar("KD_DATI2_INDUK", { length: 2 }).notNull(),
  kdKecamatanInduk: varchar("KD_KECAMATAN_INDUK", { length: 3 }).notNull(),
  kdKelurahanInduk: varchar("KD_KELURAHAN_INDUK", { length: 3 }).notNull(),
  kdBlokInduk: varchar("KD_BLOK_INDUK", { length: 3 }).notNull(),
  noUrutInduk: varchar("NO_URUT_INDUK", { length: 4 }).notNull(),
  kdJnsOpInduk: varchar("KD_JNS_OP_INDUK", { length: 1 }).notNull(),
  kdPropinsi: varchar("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: varchar("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: varchar("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: varchar("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: varchar("KD_BLOK", { length: 3 }).notNull(),
  noUrut: varchar("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: varchar("KD_JNS_OP", { length: 1 }).notNull(),
  luasBumiBeban: bigint("LUAS_BUMI_BEBAN", { mode: "number" }),
  luasBngBeban: bigint("LUAS_BNG_BEBAN", { mode: "number" }),
  nilaiSistemBumiBeban: bigint("NILAI_SISTEM_BUMI_BEBAN", { mode: "number" }),
  nilaiSistemBngBeban: bigint("NILAI_SISTEM_BNG_BEBAN", { mode: "number" }),
  njopBumiBeban: bigint("NJOP_BUMI_BEBAN", { mode: "number" }),
  njopBngBeban: bigint("NJOP_BNG_BEBAN", { mode: "number" }),
}, (table) => [
  primaryKey({ name: "pk_dat_op_anggota", columns: [table.kdPropinsiInduk, table.kdDati2Induk, table.kdKecamatanInduk, table.kdKelurahanInduk, table.kdBlokInduk, table.noUrutInduk, table.kdJnsOpInduk, table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp] }),
]);
