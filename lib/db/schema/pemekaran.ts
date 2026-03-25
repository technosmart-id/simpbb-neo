import {
  mysqlTable,
  char,
  varchar,
  int,
  text,
  date,
  foreignKey,
  index,
} from "drizzle-orm/mysql-core";

// ─── pemekaran ────────────────────────────────────────────────────

export const pemekaran = mysqlTable("pemekaran", {
  id: int("ID").autoincrement().primaryKey(),
  namaPemekaran: varchar("NAMA_PEMEKARAN", { length: 100 }).notNull(),
  tglBerlaku: date("TGL_BERLAKU").notNull(),
  keterangan: text("KETERANGAN"),
});

// ─── pemekaran_detail ─────────────────────────────────────────────

export const pemekaranDetail = mysqlTable(
  "pemekaran_detail",
  {
    id: int("ID").autoincrement().primaryKey(),
    pemekaranId: int("PEMEKARAN_ID").notNull(),

    // NOP Lama
    kdPropinsiLama: char("KD_PROPINSI_LAMA", { length: 2 }).notNull(),
    kdDati2Lama: char("KD_DATI2_LAMA", { length: 2 }).notNull(),
    kdKecamatanLama: char("KD_KECAMATAN_LAMA", { length: 3 }).notNull(),
    kdKelurahanLama: char("KD_KELURAHAN_LAMA", { length: 3 }).notNull(),
    kdBlokLama: char("KD_BLOK_LAMA", { length: 3 }).notNull(),
    noUrutLama: char("NO_URUT_LAMA", { length: 4 }).notNull(),
    kdJnsOpLama: char("KD_JNS_OP_LAMA", { length: 1 }).notNull(),

    // NOP Baru
    kdPropinsiBaru: char("KD_PROPINSI_BARU", { length: 2 }).notNull(),
    kdDati2Baru: char("KD_DATI2_BARU", { length: 2 }).notNull(),
    kdKecamatanBaru: char("KD_KECAMATAN_BARU", { length: 3 }).notNull(),
    kdKelurahanBaru: char("KD_KELURAHAN_BARU", { length: 3 }).notNull(),
    kdBlokBaru: char("KD_BLOK_BARU", { length: 3 }).notNull(),
    noUrutBaru: char("NO_URUT_BARU", { length: 4 }).notNull(),
    kdJnsOpBaru: char("KD_JNS_OP_BARU", { length: 1 }).notNull(),
  },
  (table) => [
    index("idx_pemekaran_nop_lama").on(
      table.kdPropinsiLama,
      table.kdDati2Lama,
      table.kdKecamatanLama,
      table.kdKelurahanLama,
      table.kdBlokLama,
      table.noUrutLama,
      table.kdJnsOpLama,
    ),
    foreignKey({
      name: "fk_pemekaran_detail_induk",
      columns: [table.pemekaranId],
      foreignColumns: [pemekaran.id],
    }),
  ],
);
