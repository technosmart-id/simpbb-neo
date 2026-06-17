import {
  mysqlTable,
  varchar,
  int,
  tinyint,
  datetime,
  index,
} from "drizzle-orm/mysql-core";

// ─── pemekaran ─────────────────────────────────────────────────
export const pemekaran = mysqlTable("pemekaran", {
  id: int("ID").notNull().primaryKey().autoincrement(),
  jenisPemekaran: int("JENIS_PEMEKARAN"),
  kdPropinsiLama: varchar("KD_PROPINSI_LAMA", { length: 2 }),
  kdDati2Lama: varchar("KD_DATI2_LAMA", { length: 2 }),
  kdKecamatanLama: varchar("KD_KECAMATAN_LAMA", { length: 3 }),
  kdKelurahanLama: varchar("KD_KELURAHAN_LAMA", { length: 3 }),
  kdBlokAwal: varchar("KD_BLOK_AWAL", { length: 3 }),
  noUrutAwal: varchar("NO_URUT_AWAL", { length: 4 }),
  noUrutAkhir: varchar("NO_URUT_AKHIR", { length: 4 }),
  kdBlokAkhir: varchar("KD_BLOK_AKHIR", { length: 3 }),
  kdPropinsiBaru: varchar("KD_PROPINSI_BARU", { length: 2 }),
  kdDati2Baru: varchar("KD_DATI2_BARU", { length: 2 }),
  kdKecamatanBaru: varchar("KD_KECAMATAN_BARU", { length: 3 }),
  kdKelurahanBaru: varchar("KD_KELURAHAN_BARU", { length: 3 }),
  kdBlokBaru: varchar("KD_BLOK_BARU", { length: 3 }),
  tglEntry: datetime("TGL_ENTRY"),
  userEntry: varchar("USER_ENTRY", { length: 200 }),
  isCancel: tinyint("IS_CANCEL").default(0),
}, (table) => [
]);

// ─── pemekaran_detail ─────────────────────────────────────────────────
export const pemekaranDetail = mysqlTable("pemekaran_detail", {
  id: int("ID").notNull().primaryKey().autoincrement(),
  pemekaranId: int("PEMEKARAN_ID"),
  kdPropinsiLama: varchar("KD_PROPINSI_LAMA", { length: 2 }).notNull(),
  kdDati2Lama: varchar("KD_DATI2_LAMA", { length: 2 }).notNull(),
  kdKecamatanLama: varchar("KD_KECAMATAN_LAMA", { length: 3 }).notNull(),
  kdKelurahanLama: varchar("KD_KELURAHAN_LAMA", { length: 3 }).notNull(),
  kdBlokLama: varchar("KD_BLOK_LAMA", { length: 3 }).notNull(),
  noUrutLama: varchar("NO_URUT_LAMA", { length: 4 }).notNull(),
  kdJnsOpLama: varchar("KD_JNS_OP_LAMA", { length: 1 }).notNull(),
  kdPropinsiBaru: varchar("KD_PROPINSI_BARU", { length: 2 }).notNull(),
  kdDati2Baru: varchar("KD_DATI2_BARU", { length: 2 }).notNull(),
  kdKecamatanBaru: varchar("KD_KECAMATAN_BARU", { length: 3 }).notNull(),
  kdKelurahanBaru: varchar("KD_KELURAHAN_BARU", { length: 3 }).notNull(),
  kdBlokBaru: varchar("KD_BLOK_BARU", { length: 3 }).notNull(),
  noUrutBaru: varchar("NO_URUT_BARU", { length: 4 }).notNull(),
  kdJnsOpBaru: varchar("KD_JNS_OP_BARU", { length: 1 }).notNull(),
}, (table) => [
  index("idx_pemekaran_detail_lama").on(table.kdPropinsiLama),
  index("idx_pemekaran_detail_baru").on(table.kdPropinsiBaru),
]);
