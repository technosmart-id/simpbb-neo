import {
  bigint,
  char,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  timestamp,
} from "drizzle-orm/pg-core";

// pembayaran_sppt - Payment records
export const pembayaranSppt = pgTable(
  "pembayaran_sppt",
  {
    // NOP (7-part)
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    // Tax year and payment sequence
    thnPajakSppt: char("thn_pajak_sppt", { length: 4 }).notNull(),
    pembayaranSpptKe: smallint("pembayaran_sppt_ke").notNull(),
    // Bank info
    kdKanwilBank: char("kd_kanwil_bank", { length: 2 }).notNull(),
    kdKppbbBank: char("kd_kppbb_bank", { length: 2 }).notNull(),
    kdBankTunggal: char("kd_bank_tunggal", { length: 2 }).notNull(),
    kdBankPersepsi: char("kd_bank_persepsi", { length: 2 }).notNull(),
    kdTp: char("kd_tp", { length: 2 }).notNull(),
    // Payment details
    dendaSppt: bigint("denda_sppt", { mode: "number" }),
    jmlSpptYgDibayar: bigint("jml_sppt_yg_dibayar", {
      mode: "number",
    }).notNull(),
    tglPembayaranSppt: timestamp("tgl_pembayaran_sppt", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    tglRekamByrSppt: timestamp("tgl_rekam_byr_sppt", {
      precision: 0,
      withTimezone: false,
    })
      .notNull()
      .defaultNow(),
    nipRekamByrSppt: char("nip_rekam_byr_sppt", { length: 18 }).notNull(),
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
        table.pembayaranSpptKe,
        table.kdKanwilBank,
        table.kdKppbbBank,
        table.kdBankTunggal,
        table.kdBankPersepsi,
        table.kdTp,
      ],
    }),
  ]
);

// Export types
export type PembayaranSppt = typeof pembayaranSppt.$inferSelect;
export type NewPembayaranSppt = typeof pembayaranSppt.$inferInsert;
