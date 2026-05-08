import {
  mysqlTable,
  varchar,
  bigint,
  int,
  year,
  date,
  datetime,
  timestamp,
  text,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { nopColumns } from "./_columns";

// ─── sppt_op_bersama ──────────────────────────────────────────────

export const spptOpBersama = mysqlTable(
  "sppt_op_bersama",
  {
    ...nopColumns(),
    thnPajakSppt: varchar("THN_PAJAK_SPPT", { length: 4 }).notNull(),
    kdKlsTanah: varchar("KD_KLS_TANAH", { length: 3 }).notNull(),
    thnAwalKlsTanah: varchar("THN_AWAL_KLS_TANAH", { length: 4 }).notNull(),
    kdKlsBng: varchar("KD_KLS_BNG", { length: 3 }).notNull(),
    thnAwalKlsBng: varchar("THN_AWAL_KLS_BNG", { length: 4 }).notNull(),
    luasBumiBebanSppt: bigint("LUAS_BUMI_BEBAN_SPPT", { mode: "number" }).notNull(),
    luasBngBebanSppt: bigint("LUAS_BNG_BEBAN_SPPT", { mode: "number" }).notNull(),
    njopBumiBebanSppt: bigint("NJOP_BUMI_BEBAN_SPPT", { mode: "number" }).notNull(),
    njopBngBebanSppt: bigint("NJOP_BNG_BEBAN_SPPT", { mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({
      name: "pk_sppt_op_bersama",
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
  ],
);

// ─── sppt_e ───────────────────────────────────────────────────────

export const spptE = mysqlTable(
  "sppt_e",
  {
    ...nopColumns(),
    thnPajakSppt: year("THN_PAJAK_SPPT").notNull(),
    cetakKe: int("CETAK_KE").notNull(),
    email: varchar("EMAIL", { length: 500 }),
    nmWpSppt: varchar("NM_WP_SPPT", { length: 255 }),
    pbbYgHarusDibayar: bigint("PBB_YG_HARUS_DIBAYAR", { mode: "number" }),
    tglPembayaranTerakhir: date("TGL_PEMBAYARAN_TERAKHIR"),
    tglDibuat: datetime("TGL_DIBUAT"),
    tglEmail: datetime("TGL_EMAIL"),
    tglRecord: timestamp("TGL_RECORD").default(sql`CURRENT_TIMESTAMP`),
    nipVerifikasi1: varchar("NIP_VERIFIKASI_1", { length: 100 }),
    nipVerifikasi2: varchar("NIP_VERIFIKASI_2", { length: 100 }),
    nipVerifikasi3: varchar("NIP_VERIFIKASI_3", { length: 100 }),
    tglVerifikasi1: datetime("TGL_VERIFIKASI_1"),
    tglVerifikasi2: datetime("TGL_VERIFIKASI_2"),
    tglVerifikasi3: datetime("TGL_VERIFIKASI_3"),
    tglKirimTtd: datetime("TGL_KIRIM_TTD"),
    tglTerimaTtd: datetime("TGL_TERIMA_TTD"),
    fileSppt: text("FILE_SPPT"),
  },
  (table) => [
    primaryKey({
      name: "pk_sppt_e",
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdBlok,
        table.noUrut,
        table.kdJnsOp,
        table.thnPajakSppt,
        table.cetakKe,
      ],
    }),
  ],
);
