import {
  mysqlTable,
  char,
  varchar,
  int,
  smallint,
  decimal,
  tinyint,
  text,
  date,
  datetime,
  bigint,
  primaryKey,
  foreignKey,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { refJnsPelayanan } from "./referensi";

// ─── pelayanan ────────────────────────────────────────────────────

export const pelayanan = mysqlTable(
  "pelayanan",
  {
    noPelayanan: varchar("NO_PELAYANAN", { length: 30 }).primaryKey(),

    // NOP terkait (nullable — kolektif pakai nilai dummy)
    kdPropinsi: char("KD_PROPINSI", { length: 2 }),
    kdDati2: char("KD_DATI2", { length: 2 }),
    kdKecamatan: char("KD_KECAMATAN", { length: 3 }),
    kdKelurahan: char("KD_KELURAHAN", { length: 3 }),
    kdBlok: char("KD_BLOK", { length: 3 }),
    noUrut: char("NO_URUT", { length: 4 }),
    kdJnsOp: char("KD_JNS_OP", { length: 1 }),

    // Jenis & Tanggal
    kdJnsPelayanan: char("KD_JNS_PELAYANAN", { length: 2 }).notNull(),
    tanggalPelayanan: date("TANGGAL_PELAYANAN").notNull(),
    tanggalPerkiraanSelesai: date("TANGGAL_PERKIRAAN_SELESAI"),

    // Pemohon
    namaPemohon: varchar("NAMA_PEMOHON", { length: 100 }),
    alamatPemohon: text("ALAMAT_PEMOHON"),

    // Lokasi OP
    letakOp: varchar("LETAK_OP", { length: 200 }),
    kecamatan: varchar("KECAMATAN", { length: 50 }),
    kelurahan: varchar("KELURAHAN", { length: 50 }),

    // Status Alur
    statusPelayanan: smallint("STATUS_PELAYANAN").notNull().default(1),

    // Petugas Penerima
    nipPetugasPenerima: varchar("NIP_PETUGAS_PENERIMA", { length: 40 }),
    namaPetugasPenerima: varchar("NAMA_PETUGAS_PENERIMA", { length: 100 }),

    // Account Representative
    nipAr: varchar("NIP_AR", { length: 40 }),
    namaAr: varchar("NAMA_AR", { length: 100 }),

    // Catatan
    catatan: text("CATATAN"),
    keterangan: text("KETERANGAN"),

    // Status Masuk Penilai
    tglMasukPenilai: date("TGL_MASUK_PENILAI"),
    nipMasukPenilai: varchar("NIP_MASUK_PENILAI", { length: 40 }),

    // Status Masuk Penetapan
    tglMasukPenetapan: date("TGL_MASUK_PENETAPAN"),
    nipMasukPenetapan: varchar("NIP_MASUK_PENETAPAN", { length: 40 }),

    // Status Selesai
    tglSelesai: date("TGL_SELESAI"),
    nipSelesai: varchar("NIP_SELESAI", { length: 40 }),

    // Status Terkonfirmasi WP
    tglTerkonfirmasiWp: date("TGL_TERKONFIRMASI_WP"),
    nipTerkonfirmasiWp: varchar("NIP_TERKONFIRMASI_WP", { length: 40 }),

    // Status Ditunda
    tglBerkasDitunda: date("TGL_BERKAS_DITUNDA"),
    alasanDitunda: text("ALASAN_DITUNDA"),

    // Kolektif
    isKolektif: tinyint("IS_KOLEKTIF").notNull().default(0),

    // Tanda Tangan Berkas
    ttdKiriJabatan: varchar("TTD_KIRI_JABATAN", { length: 100 }),
    ttdKiriNama: varchar("TTD_KIRI_NAMA", { length: 100 }),
    ttdKiriNip: varchar("TTD_KIRI_NIP", { length: 40 }),
    ttdKananJabatan: varchar("TTD_KANAN_JABATAN", { length: 100 }),
    ttdKananNama: varchar("TTD_KANAN_NAMA", { length: 100 }),
    ttdKananNip: varchar("TTD_KANAN_NIP", { length: 40 }),
  },
  (table) => [
    index("idx_pelayanan_nop").on(
      table.kdPropinsi,
      table.kdDati2,
      table.kdKecamatan,
      table.kdKelurahan,
      table.kdBlok,
      table.noUrut,
      table.kdJnsOp,
    ),
    index("idx_pelayanan_status").on(table.statusPelayanan),
    index("idx_pelayanan_tgl").on(table.tanggalPelayanan),
    foreignKey({
      name: "fk_pelayanan_jns",
      columns: [table.kdJnsPelayanan],
      foreignColumns: [refJnsPelayanan.kdJnsPelayanan],
    }),
  ],
);

// ─── pelayanan_dokumen ────────────────────────────────────────────

export const pelayananDokumen = mysqlTable(
  "pelayanan_dokumen",
  {
    noPelayanan: varchar("NO_PELAYANAN", { length: 30 }).notNull(),
    dokumenId: tinyint("DOKUMEN_ID").notNull(),
    fileName: varchar("file_name", { length: 255 }),
    filePath: varchar("file_path", { length: 500 }),
    fileSize: int("file_size"),
    uploadedAt: datetime("uploaded_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.noPelayanan, table.dokumenId] }),
    foreignKey({
      name: "fk_dok_pelayanan",
      columns: [table.noPelayanan],
      foreignColumns: [pelayanan.noPelayanan],
    }),
  ],
);

// ─── pelayanan_lampiran_kolektif ──────────────────────────────────

export const pelayananLampiranKolektif = mysqlTable(
  "pelayanan_lampiran_kolektif",
  {
    id: int("ID").autoincrement().primaryKey(),
    noPelayanan: varchar("NO_PELAYANAN", { length: 30 }).notNull(),
    nop: varchar("NOP", { length: 18 }),
    nama: varchar("NAMA", { length: 100 }),
    alamat: text("ALAMAT"),
    lt: decimal("LT", { precision: 12, scale: 2 }),
    lb: decimal("LB", { precision: 12, scale: 2 }),
    keterangan: text("KETERANGAN"),
  },
  (table) => [
    index("idx_lamp_kol_pelayanan").on(table.noPelayanan),
    foreignKey({
      name: "fk_lamp_kol_pelayanan",
      columns: [table.noPelayanan],
      foreignColumns: [pelayanan.noPelayanan],
    }),
  ],
);

// ─── histori_mutasi ───────────────────────────────────────────────

export const historiMutasi = mysqlTable(
  "histori_mutasi",
  {
    noPelayanan: varchar("NO_PELAYANAN", { length: 50 }).notNull(),
    nopSebelum: varchar("NOP_SEBELUM", { length: 20 }),
    namaSebelum: varchar("NAMA_SEBELUM", { length: 200 }),
    ltSebelum: int("LT_SEBELUM"),
    lbSebelum: int("LB_SEBELUM"),
    pbbSebelum: bigint("PBB_SEBELUM", { mode: "number" }),
    nopSesudah: varchar("NOP_SESUDAH", { length: 18 }),
    namaSesudah: varchar("NAMA_SESUDAH", { length: 200 }),
    ltSesudah: int("LT_SESUDAH"),
    lbSesudah: int("LB_SESUDAH"),
    pbbSesudah: bigint("PBB_SESUDAH", { mode: "number" }),
    // Clone has no PK here (id is a non-unique index). Drizzle emits table-level
    // indexes as separate CREATE INDEX statements, which MySQL rejects for an
    // AUTO_INCREMENT column at CREATE TABLE time (err 1075). An inline UNIQUE
    // satisfies the "auto column must be a key" rule while keeping the table
    // PK-less (id is unique regardless).
    id: bigint("ID", { mode: "number" }).autoincrement().notNull().unique(),
    keterangan: text("KETERANGAN"),
  },
);
