import {
  mysqlTable,
  bigint,
  int,
  smallint,
  varchar,
  text,
  datetime,
  date,
  char,
  json,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ─── log_aktivitas ────────────────────────────────────────────────

export const logAktivitas = mysqlTable(
  "log_aktivitas",
  {
    id: bigint("ID", { mode: "number" }).autoincrement().primaryKey(),
    username: varchar("USERNAME", { length: 20 }).notNull(),
    aksi: varchar("AKSI", { length: 50 }).notNull(),
    modul: varchar("MODUL", { length: 50 }),
    keterangan: text("KETERANGAN"),
    ipAddress: varchar("IP_ADDRESS", { length: 45 }),
    createdAt: datetime("CREATED_AT").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_log_user").on(table.username),
    index("idx_log_tgl").on(table.createdAt),
  ],
);

export const logDeletePelayanan = mysqlTable("log_delete_pelayanan", {
  id: bigint("ID", { mode: "number" }).notNull().primaryKey().autoincrement(),
  tglDelete: datetime("TGL_DELETE"),
  userDelete: varchar("USER_DELETE", { length: 200 }),
  namaDelete: varchar("NAMA_DELETE", { length: 200 }),
  namaPemohon: varchar("NAMA_PEMOHON", { length: 300 }),
  alamatPemohon: varchar("ALAMAT_PEMOHON", { length: 500 }),
  noPelayanan: varchar("NO_PELAYANAN", { length: 13 }).notNull(),
  tanggalPelayanan: date("TANGGAL_PELAYANAN"),
  kdPropinsi: varchar("KD_PROPINSI", { length: 2 }),
  kdDati2: varchar("KD_DATI2", { length: 2 }),
  kdKecamatan: varchar("KD_KECAMATAN", { length: 3 }),
  kdKelurahan: varchar("KD_KELURAHAN", { length: 3 }),
  kdBlok: varchar("KD_BLOK", { length: 3 }),
  noUrut: varchar("NO_URUT", { length: 4 }),
  kdJnsOp: varchar("KD_JNS_OP", { length: 1 }),
  kdJnsPelayanan: char("KD_JNS_PELAYANAN", { length: 2 }),
  tanggalPerkiraanSelesai: date("TANGGAL_PERKIRAAN_SELESAI"),
  statusPelayanan: smallint("STATUS_PELAYANAN"),
  nipPetugasPenerima: varchar("NIP_PETUGAS_PENERIMA", { length: 300 }),
  namaPetugasPenerima: varchar("NAMA_PETUGAS_PENERIMA", { length: 300 }),
  nipAr: varchar("NIP_AR", { length: 300 }),
  namaAr: varchar("NAMA_AR", { length: 300 }),
  catatan: text("CATATAN"),
  keterangan: text("KETERANGAN"),
  tglMasukPenilai: datetime("TGL_MASUK_PENILAI"),
  nipMasukPenilai: varchar("NIP_MASUK_PENILAI", { length: 300 }),
  tglSelesai: datetime("TGL_SELESAI"),
  nipSelesai: varchar("NIP_SELESAI", { length: 300 }),
  tglTerkonfirmasiWp: datetime("TGL_TERKONFIRMASI_WP"),
  nipTerkonfirmasiWp: varchar("NIP_TERKONFIRMASI_WP", { length: 300 }),
  ttdJabatanKiri: varchar("TTD_JABATAN_KIRI", { length: 500 }),
  ttdNamaKiri: varchar("TTD_NAMA_KIRI", { length: 500 }),
  ttdNipKiri: varchar("TTD_NIP_KIRI", { length: 500 }),
  ttdJabatanKanan: varchar("TTD_JABATAN_KANAN", { length: 500 }),
  ttdNamaKanan: varchar("TTD_NAMA_KANAN", { length: 500 }),
  ttdNipKanan: varchar("TTD_NIP_KANAN", { length: 500 }),
}, (table) => [
]);
