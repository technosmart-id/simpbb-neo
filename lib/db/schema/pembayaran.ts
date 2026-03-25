import {
  mysqlTable,
  varchar,
  tinyint,
  decimal,
  date,
  datetime,
  year,
  text,
  primaryKey,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { nopColumns } from "./_columns";
import { sppt } from "./sppt";

// ─── pembayaran_sppt ──────────────────────────────────────────────

export const pembayaranSppt = mysqlTable(
  "pembayaran_sppt",
  {
    ...nopColumns(),
    thnPajakSppt: year("THN_PAJAK_SPPT").notNull(),
    pembayaranKe: tinyint("PEMBAYARAN_KE").notNull(),
    tglPembayaranSppt: date("TGL_PEMBAYARAN_SPPT").notNull(),
    jmlSpptYgDibayar: decimal("JML_SPPT_YG_DIBAYAR", { precision: 15, scale: 2 }).notNull().default("0"),
    dendaSppt: decimal("DENDA_SPPT", { precision: 15, scale: 2 }).notNull().default("0"),
    jmlBayar: decimal("JML_BAYAR", { precision: 15, scale: 2 }).notNull().default("0"),
    namaBayar: varchar("NAMA_BAYAR", { length: 100 }),
    channelPembayaran: varchar("CHANNEL_PEMBAYARAN", { length: 50 }),
    noReferensi: varchar("NO_REFERENSI", { length: 100 }),
    nipPetugas: varchar("NIP_PETUGAS", { length: 40 }),
    dibatalkan: tinyint("DIBATALKAN").notNull().default(0),
    tglBatal: datetime("TGL_BATAL"),
    alasanBatal: text("ALASAN_BATAL"),
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
        table.pembayaranKe,
      ],
    }),
    foreignKey({
      name: "fk_pembayaran_sppt",
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
      foreignColumns: [
        sppt.kdPropinsi,
        sppt.kdDati2,
        sppt.kdKecamatan,
        sppt.kdKelurahan,
        sppt.kdBlok,
        sppt.noUrut,
        sppt.kdJnsOp,
        sppt.thnPajakSppt,
      ],
    }),
  ],
);
