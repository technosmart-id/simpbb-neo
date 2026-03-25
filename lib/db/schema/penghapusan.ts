import {
  mysqlTable,
  mysqlEnum,
  int,
  tinyint,
  char,
  varchar,
  text,
  datetime,
  primaryKey,
  foreignKey,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { nopColumns, nopForeignKey } from "./_columns";
import { spop } from "./objek-pajak";

// ─── dat_penghapusan ──────────────────────────────────────────────

export const datPenghapusan = mysqlTable(
  "dat_penghapusan",
  {
    id: int("ID").autoincrement().primaryKey(),
    ...nopColumns(),
    jenisPenghapusan: tinyint("JENIS_PENGHAPUSAN").notNull(),
    alasan: text("ALASAN").notNull(),
    status: mysqlEnum("STATUS", ["pending", "approved", "rejected"])
      .notNull()
      .default("pending"),
    userPengaju: varchar("USER_PENGAJU", { length: 30 }).notNull(),
    tglPengajuan: datetime("TGL_PENGAJUAN")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    userApprover: varchar("USER_APPROVER", { length: 30 }),
    tglApproval: datetime("TGL_APPROVAL"),
    catatanApprover: text("CATATAN_APPROVER"),
  },
  (table) => [
    nopForeignKey("fk_penghapusan_spop", table, spop),
    index("idx_penghapusan_status").on(table.status),
    index("idx_penghapusan_nop").on(
      table.kdPropinsi,
      table.kdDati2,
      table.kdKecamatan,
      table.kdKelurahan,
      table.kdBlok,
      table.noUrut,
      table.kdJnsOp,
    ),
  ],
);

// ─── dat_penghapusan_sppt ─────────────────────────────────────────

export const datPenghapusanSppt = mysqlTable(
  "dat_penghapusan_sppt",
  {
    idPenghapusan: int("ID_PENGHAPUSAN").notNull(),
    ...nopColumns(),
    thnPajakSppt: char("THN_PAJAK_SPPT", { length: 4 }).notNull(),
    namaWp: varchar("NAMA_WP", { length: 100 }),
    njopBumiSppt: int("NJOP_BUMI_SPPT"),
    njopBngSppt: int("NJOP_BNG_SPPT"),
    pbbYgHarusDibayarSppt: int("PBB_YG_HARUS_DIBAYAR_SPPT"),
  },
  (table) => [
    primaryKey({
      name: "pk_penghapusan_sppt",
      columns: [
        table.idPenghapusan,
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
    foreignKey({
      name: "fk_penghapusan_sppt_header",
      columns: [table.idPenghapusan],
      foreignColumns: [datPenghapusan.id],
    }),
  ],
);
