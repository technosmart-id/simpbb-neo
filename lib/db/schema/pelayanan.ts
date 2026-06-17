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
    id: int("ID").autoincrement().primaryKey(),
    noPelayanan: varchar("NO_PELAYANAN", { length: 30 }).notNull(),
    nopSebelum: varchar("NOP_SEBELUM", { length: 18 }),
    namaSebelum: varchar("NAMA_SEBELUM", { length: 100 }),
    ltSebelum: decimal("LT_SEBELUM", { precision: 12, scale: 2 }),
    lbSebelum: decimal("LB_SEBELUM", { precision: 12, scale: 2 }),
    pbbSebelum: decimal("PBB_SEBELUM", { precision: 15, scale: 2 }),
    nopSesudah: varchar("NOP_SESUDAH", { length: 18 }),
    namaSesudah: varchar("NAMA_SESUDAH", { length: 100 }),
    ltSesudah: decimal("LT_SESUDAH", { precision: 12, scale: 2 }),
    lbSesudah: decimal("LB_SESUDAH", { precision: 12, scale: 2 }),
    pbbSesudah: decimal("PBB_SESUDAH", { precision: 15, scale: 2 }),
    tglMutasi: datetime("TGL_MUTASI").notNull().default(sql`CURRENT_TIMESTAMP`),
    nipPetugas: varchar("NIP_PETUGAS", { length: 40 }),
  },
  (table) => [
    index("idx_histori_mutasi_pelayanan").on(table.noPelayanan),
  ],
);
