import {
  mysqlTable,
  varchar,
  char,
  int,
  smallint,
  bigint,
  text,
  date,
  datetime,
  double,
  primaryKey,
} from "drizzle-orm/mysql-core";

// ─── pelayanan ─────────────────────────────────────────────────
export const pelayanan = mysqlTable("pelayanan", {
  id: bigint("ID", { mode: "number" }).notNull().primaryKey().autoincrement(),
  namaPemohon: varchar("NAMA_PEMOHON", { length: 300 }),
  alamatPemohon: varchar("ALAMAT_PEMOHON", { length: 500 }),
  letakOp: varchar("LETAK_OP", { length: 250 }),
  kecamatan: varchar("KECAMATAN", { length: 250 }),
  kelurahan: varchar("KELURAHAN", { length: 250 }),
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
  tglPenetapan: datetime("TGL_PENETAPAN"),
  nipPenetapan: varchar("NIP_PENETAPAN", { length: 300 }),
  tglBerkasDitunda: datetime("TGL_BERKAS_DITUNDA"),
  nipBerkasDitunda: varchar("NIP_BERKAS_DITUNDA", { length: 300 }),
  ttdJabatanKiri: varchar("TTD_JABATAN_KIRI", { length: 500 }),
  ttdNamaKiri: varchar("TTD_NAMA_KIRI", { length: 500 }),
  ttdNipKiri: varchar("TTD_NIP_KIRI", { length: 500 }),
  ttdJabatanKanan: varchar("TTD_JABATAN_KANAN", { length: 500 }),
  ttdNamaKanan: varchar("TTD_NAMA_KANAN", { length: 500 }),
  ttdNipKanan: varchar("TTD_NIP_KANAN", { length: 500 }),
  keteranganBerkas: text("KETERANGAN_BERKAS"),
  ekstra: text("EKSTRA"),
}, (table) => [
]);

// ─── pelayanan_dokumen ─────────────────────────────────────────────────
export const pelayananDokumen = mysqlTable("pelayanan_dokumen", {
  pelayananId: bigint("pelayanan_id", { mode: "number" }).notNull(),
  dokumenId: smallint("dokumen_id").notNull(),
}, (table) => [
  primaryKey({ columns: [table.pelayananId, table.dokumenId] }),
]);

// ─── pelayanan_lampiran_kolektif ─────────────────────────────────────────────────
export const pelayananLampiranKolektif = mysqlTable("pelayanan_lampiran_kolektif", {
  id: bigint("ID", { mode: "number" }).notNull().primaryKey().autoincrement(),
  noPelayanan: varchar("NO_PELAYANAN", { length: 30 }).notNull(),
  nop: varchar("NOP", { length: 40 }),
  nama: varchar("NAMA", { length: 100 }),
  alamat: text("ALAMAT"),
  lt: double("LT"),
  lb: double("LB"),
  keterangan: text("KETERANGAN"),
}, (table) => [
]);

// ─── histori_mutasi ─────────────────────────────────────────────────
export const historiMutasi = mysqlTable("histori_mutasi", {
  noPelayanan: varchar("no_pelayanan", { length: 50 }).notNull(),
  nopSebelum: varchar("nop_sebelum", { length: 20 }),
  namaSebelum: varchar("nama_sebelum", { length: 200 }),
  ltSebelum: int("lt_sebelum"),
  lbSebelum: int("lb_sebelum"),
  pbbSebelum: bigint("pbb_sebelum", { mode: "number" }),
  nopSesudah: varchar("nop_sesudah", { length: 18 }),
  namaSesudah: varchar("nama_sesudah", { length: 200 }),
  ltSesudah: int("lt_sesudah"),
  lbSesudah: int("lb_sesudah"),
  pbbSesudah: bigint("pbb_sesudah", { mode: "number" }),
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  keterangan: text("keterangan"),
}, (table) => [
]);
