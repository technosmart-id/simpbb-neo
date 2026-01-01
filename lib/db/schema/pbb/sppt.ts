import {
  bigint,
  char,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// sppt - Tax documents (SPPT)
export const sppt = pgTable(
  "sppt",
  {
    // NOP (7-part composite key)
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    // Tax year
    thnPajakSppt: char("thn_pajak_sppt", { length: 4 }).notNull(),
    // Cycle and bank info
    siklusSppt: smallint("siklus_sppt").notNull(),
    kdKanwilBank: char("kd_kanwil_bank", { length: 2 }).notNull(),
    kdKppbbBank: char("kd_kppbb_bank", { length: 2 }).notNull(),
    kdBankTunggal: char("kd_bank_tunggal", { length: 2 }).notNull(),
    kdBankPersepsi: char("kd_bank_persepsi", { length: 2 }).notNull(),
    kdTp: char("kd_tp", { length: 2 }).notNull(),
    // Taxpayer (WP) info on SPPT
    nmWpSppt: varchar("nm_wp_sppt", { length: 30 }).notNull(),
    jlnWpSppt: varchar("jln_wp_sppt", { length: 30 }).notNull(),
    blokKavNoWpSppt: varchar("blok_kav_no_wp_sppt", { length: 15 }),
    rwWpSppt: char("rw_wp_sppt", { length: 2 }),
    rtWpSppt: char("rt_wp_sppt", { length: 3 }),
    kelurahanWpSppt: varchar("kelurahan_wp_sppt", { length: 30 }),
    kotaWpSppt: varchar("kota_wp_sppt", { length: 30 }),
    kdPosWpSppt: varchar("kd_pos_wp_sppt", { length: 5 }),
    npwpSppt: varchar("npwp_sppt", { length: 16 }),
    noPersilSppt: varchar("no_persil_sppt", { length: 5 }),
    // Land and building class
    kdKlsTanah: char("kd_kls_tanah", { length: 3 }).notNull().default("XXX"),
    thnAwalKlsTanah: char("thn_awal_kls_tanah", { length: 4 })
      .notNull()
      .default("1986"),
    kdKlsBng: char("kd_kls_bng", { length: 3 }).notNull().default("XXX"),
    thnAwalKlsBng: char("thn_awal_kls_bng", { length: 4 })
      .notNull()
      .default("1986"),
    // Due date
    tglJatuhTempoSppt: timestamp("tgl_jatuh_tempo_sppt", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    // Area and values
    luasBumiSppt: bigint("luas_bumi_sppt", { mode: "number" })
      .notNull()
      .default(0),
    luasBngSppt: bigint("luas_bng_sppt", { mode: "number" })
      .notNull()
      .default(0),
    njopBumiSppt: bigint("njop_bumi_sppt", { mode: "number" })
      .notNull()
      .default(0),
    njopBngSppt: bigint("njop_bng_sppt", { mode: "number" })
      .notNull()
      .default(0),
    njopSppt: bigint("njop_sppt", { mode: "number" }).notNull(),
    njoptkpSppt: integer("njoptkp_sppt").notNull(),
    njkpSppt: numeric("njkp_sppt", { precision: 5, scale: 2 }),
    // Tax amounts
    pbbTerhutangSppt: bigint("pbb_terhutang_sppt", {
      mode: "number",
    }).notNull(),
    faktorPengurangSppt: bigint("faktor_pengurang_sppt", { mode: "number" }),
    pbbYgHarusDibayarSppt: bigint("pbb_yg_harus_dibayar_sppt", {
      mode: "number",
    }).notNull(),
    // Status
    statusPembayaranSppt: char("status_pembayaran_sppt", { length: 1 })
      .notNull()
      .default("0"),
    statusTagihanSppt: char("status_tagihan_sppt", { length: 1 })
      .notNull()
      .default("0"),
    statusCetakSppt: char("status_cetak_sppt", { length: 1 })
      .notNull()
      .default("0"),
    // Dates
    tglTerbitSppt: timestamp("tgl_terbit_sppt", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    tglCetakSppt: timestamp("tgl_cetak_sppt", {
      precision: 0,
      withTimezone: false,
    })
      .notNull()
      .defaultNow(),
    nipPencetakSppt: char("nip_pencetak_sppt", { length: 18 }).notNull(),
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
        table.thnPajakSppt,
      ],
    }),
  ]
);

// sppt_op_bersama - Shared SPPT (for NOP with shared burden)
export const spptOpBersama = pgTable(
  "sppt_op_bersama",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    thnPajakSppt: char("thn_pajak_sppt", { length: 4 }).notNull(),
    // Class info
    kdKlsTanah: char("kd_kls_tanah", { length: 3 }).notNull().default("XXX"),
    thnAwalKlsTanah: char("thn_awal_kls_tanah", { length: 4 })
      .notNull()
      .default("1986"),
    kdKlsBng: char("kd_kls_bng", { length: 3 }).notNull().default("XXX"),
    thnAwalKlsBng: char("thn_awal_kls_bng", { length: 4 })
      .notNull()
      .default("1986"),
    // Burden values
    luasBumiBebanSppt: bigint("luas_bumi_beban_sppt", { mode: "number" })
      .notNull()
      .default(0),
    luasBngBebanSppt: bigint("luas_bng_beban_sppt", { mode: "number" })
      .notNull()
      .default(0),
    njopBumiBebanSppt: bigint("njop_bumi_beban_sppt", { mode: "number" })
      .notNull()
      .default(0),
    njopBngBebanSppt: bigint("njop_bng_beban_sppt", { mode: "number" })
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
        table.thnPajakSppt,
      ],
    }),
  ]
);

// Export types
export type Sppt = typeof sppt.$inferSelect;
export type NewSppt = typeof sppt.$inferInsert;
export type SpptOpBersama = typeof spptOpBersama.$inferSelect;
