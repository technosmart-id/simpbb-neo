import {
  mysqlTable,
  varchar,
  tinyint,
  date,
  datetime,
  primaryKey,
  bigint,
  index,
} from "drizzle-orm/mysql-core";

// ─── pembayaran_sppt ──────────────────────────────────────────────

export const pembayaranSppt = mysqlTable("pembayaran_sppt", {
  kdPropinsi: varchar("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: varchar("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: varchar("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: varchar("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: varchar("KD_BLOK", { length: 3 }).notNull(),
  noUrut: varchar("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: varchar("KD_JNS_OP", { length: 1 }).notNull(),
  thnPajakSppt: varchar("THN_PAJAK_SPPT", { length: 4 }).notNull(),
  pembayaranSpptKe: tinyint("PEMBAYARAN_SPPT_KE").notNull(),
  kdKanwilBank: varchar("KD_KANWIL_BANK", { length: 2 }).notNull(),
  kdKppbbBank: varchar("KD_KPPBB_BANK", { length: 2 }).notNull(),
  kdBankTunggal: varchar("KD_BANK_TUNGGAL", { length: 2 }).notNull(),
  kdBankPersepsi: varchar("KD_BANK_PERSEPSI", { length: 2 }).notNull(),
  kdTp: varchar("KD_TP", { length: 2 }).notNull(),
  dendaSppt: bigint("DENDA_SPPT", { mode: "number" }),
  jmlSpptYgDibayar: bigint("JML_SPPT_YG_DIBAYAR", { mode: "number" }).notNull(),
  tglPembayaranSppt: date("TGL_PEMBAYARAN_SPPT"),
  tglRekamByrSppt: datetime("TGL_REKAM_BYR_SPPT").notNull(),
  nipRekamByrSppt: varchar("NIP_REKAM_BYR_SPPT", { length: 15 }).notNull(),
  noBukti: varchar("NO_BUKTI", { length: 50 }),
}, (table) => [
  primaryKey({ name: "pk_pembayaran_sppt", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.thnPajakSppt, table.pembayaranSpptKe, table.kdKanwilBank, table.kdKppbbBank, table.kdBankTunggal, table.kdBankPersepsi, table.kdTp] }),
  index("idx_pembayaran_sppt_tgl").on(table.tglPembayaranSppt),
]);
