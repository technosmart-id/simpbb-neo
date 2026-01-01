import {
  bigint,
  char,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { datSubjekPajak } from "./subjek-pajak";

// dat_objek_pajak - Main tax object data
export const datObjekPajak = pgTable(
  "dat_objek_pajak",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    subjekPajakId: char("subjek_pajak_id", { length: 30 })
      .notNull()
      .references(() => datSubjekPajak.subjekPajakId),
    noFormulirSpop: char("no_formulir_spop", { length: 11 }).notNull(),
    noPersil: varchar("no_persil", { length: 5 }),
    jalanOp: varchar("jalan_op", { length: 30 }).notNull(),
    blokKavNoOp: varchar("blok_kav_no_op", { length: 15 }),
    rwOp: char("rw_op", { length: 2 }),
    rtOp: char("rt_op", { length: 3 }),
    kdStatusCabang: smallint("kd_status_cabang").notNull().default(1),
    kdStatusWp: char("kd_status_wp", { length: 1 }).notNull().default("1"),
    totalLuasBumi: bigint("total_luas_bumi", { mode: "number" })
      .notNull()
      .default(0),
    totalLuasBng: bigint("total_luas_bng", { mode: "number" })
      .notNull()
      .default(0),
    njopBumi: bigint("njop_bumi", { mode: "number" }).notNull().default(0),
    njopBng: bigint("njop_bng", { mode: "number" }).notNull().default(0),
    statusPetaOp: smallint("status_peta_op").notNull().default(0),
    jnsTransaksiOp: char("jns_transaksi_op", { length: 1 })
      .notNull()
      .default("1"),
    tglPendataanOp: timestamp("tgl_pendataan_op", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    nipPendata: char("nip_pendata", { length: 18 }).notNull(),
    tglPemeriksaanOp: timestamp("tgl_pemeriksaan_op", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    nipPemeriksaOp: char("nip_pemeriksa_op", { length: 18 }).notNull(),
    tglPerekamanOp: timestamp("tgl_perekaman_op", {
      precision: 0,
      withTimezone: false,
    })
      .notNull()
      .defaultNow(),
    nipPerekamOp: char("nip_perekam_op", { length: 18 }).notNull(),
    // Extra fields from legacy database stored as JSONB
    metadata: jsonb("metadata"),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdBlok,
        table.noUrut,
        table.kdJnsOp,
      ],
    }),
  ]
);

// dat_op_bumi - Land data
export const datOpBumi = pgTable(
  "dat_op_bumi",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBumi: smallint("no_bumi").notNull().default(1),
    kdZnt: char("kd_znt", { length: 2 }).notNull(),
    luasBumi: bigint("luas_bumi", { mode: "number" }).notNull().default(0),
    jnsBumi: char("jns_bumi", { length: 1 }).notNull().default("1"),
    nilaiSistemBumi: bigint("nilai_sistem_bumi", { mode: "number" })
      .notNull()
      .default(0),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdBlok,
        table.noUrut,
        table.kdJnsOp,
        table.noBumi,
      ],
    }),
  ]
);

// dat_op_induk - Parent tax object
export const datOpInduk = pgTable(
  "dat_op_induk",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdBlok,
        table.noUrut,
        table.kdJnsOp,
      ],
    }),
  ]
);

// dat_op_anggota - Member tax object (linked to parent)
export const datOpAnggota = pgTable(
  "dat_op_anggota",
  {
    // Parent NOP
    kdPropinsiInduk: char("kd_propinsi_induk", { length: 2 }).notNull(),
    kdDati2Induk: char("kd_dati2_induk", { length: 2 }).notNull(),
    kdKecamatanInduk: char("kd_kecamatan_induk", { length: 3 }).notNull(),
    kdKelurahanInduk: char("kd_kelurahan_induk", { length: 3 }).notNull(),
    kdBlokInduk: char("kd_blok_induk", { length: 3 }).notNull(),
    noUrutInduk: char("no_urut_induk", { length: 4 }).notNull(),
    kdJnsOpInduk: char("kd_jns_op_induk", { length: 1 }).notNull(),
    // Member NOP
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    // Burden values
    luasBumiBeban: bigint("luas_bumi_beban", { mode: "number" }),
    luasBngBeban: bigint("luas_bng_beban", { mode: "number" }),
    nilaiSistemBumiBeban: bigint("nilai_sistem_bumi_beban", { mode: "number" }),
    nilaiSistemBngBeban: bigint("nilai_sistem_bng_beban", { mode: "number" }),
    njopBumiBeban: bigint("njop_bumi_beban", { mode: "number" }),
    njopBngBeban: bigint("njop_bng_beban", { mode: "number" }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsiInduk,
        table.kdDati2Induk,
        table.kdKecamatanInduk,
        table.kdKelurahanInduk,
        table.kdBlokInduk,
        table.noUrutInduk,
        table.kdJnsOpInduk,
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdBlok,
        table.noUrut,
        table.kdJnsOp,
      ],
    }),
  ]
);

// dat_znt - Zone values
export const datZnt = pgTable(
  "dat_znt",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdZnt: char("kd_znt", { length: 2 }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdZnt,
      ],
    }),
  ]
);

// dat_nir - Land value indicators
export const datNir = pgTable(
  "dat_nir",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdZnt: char("kd_znt", { length: 2 }).notNull(),
    thnNirZnt: char("thn_nir_znt", { length: 4 }).notNull(),
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    jnsDokumen: char("jns_dokumen", { length: 1 }).notNull(),
    noDokumen: char("no_dokumen", { length: 11 }).notNull(),
    nir: numeric("nir", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdZnt,
        table.thnNirZnt,
      ],
    }),
  ]
);

// Export types
export type DatObjekPajak = typeof datObjekPajak.$inferSelect;
export type NewDatObjekPajak = typeof datObjekPajak.$inferInsert;
export type DatOpBumi = typeof datOpBumi.$inferSelect;
export type DatOpInduk = typeof datOpInduk.$inferSelect;
export type DatOpAnggota = typeof datOpAnggota.$inferSelect;
export type DatZnt = typeof datZnt.$inferSelect;
export type DatNir = typeof datNir.$inferSelect;
