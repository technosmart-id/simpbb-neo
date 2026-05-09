import {
  mysqlTable,
  varchar,
  char,
  smallint,
  primaryKey,
} from "drizzle-orm/mysql-core";

// ─── ref_propinsi ─────────────────────────────────────────────────
export const refPropinsi = mysqlTable("ref_propinsi", {
  kdPropinsi: varchar("KD_PROPINSI", { length: 2 }).notNull().primaryKey(),
  nmPropinsi: varchar("NM_PROPINSI", { length: 30 }).notNull(),
}, (table) => [
]);

// ─── ref_dati2 ─────────────────────────────────────────────────
export const refDati2 = mysqlTable("ref_dati2", {
  kdPropinsi: varchar("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: varchar("KD_DATI2", { length: 2 }).notNull(),
  nmDati2: varchar("NM_DATI2", { length: 30 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_ref_dati2", columns: [table.kdPropinsi, table.kdDati2] }),
]);

// ─── ref_kecamatan ─────────────────────────────────────────────────
export const refKecamatan = mysqlTable("ref_kecamatan", {
  kdPropinsi: varchar("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: varchar("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: varchar("KD_KECAMATAN", { length: 3 }).notNull(),
  nmKecamatan: varchar("NM_KECAMATAN", { length: 30 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_ref_kecamatan", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan] }),
]);

// ─── ref_kelurahan ─────────────────────────────────────────────────
export const refKelurahan = mysqlTable("ref_kelurahan", {
  kdPropinsi: varchar("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: varchar("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: varchar("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: varchar("KD_KELURAHAN", { length: 3 }).notNull(),
  kdSektor: varchar("KD_SEKTOR", { length: 2 }).notNull(),
  nmKelurahan: varchar("NM_KELURAHAN", { length: 30 }).notNull(),
  noKelurahan: smallint("NO_KELURAHAN"),
  kdPosKelurahan: varchar("KD_POS_KELURAHAN", { length: 5 }),
}, (table) => [
  primaryKey({ name: "pk_ref_kelurahan", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan] }),
]);

// ─── ref_jns_pelayanan ─────────────────────────────────────────────────
export const refJnsPelayanan = mysqlTable("ref_jns_pelayanan", {
  kdJnsPelayanan: char("KD_JNS_PELAYANAN", { length: 2 }).notNull().primaryKey(),
  nmJenisPelayanan: varchar("NM_JENIS_PELAYANAN", { length: 50 }).notNull(),
}, (table) => [
]);
