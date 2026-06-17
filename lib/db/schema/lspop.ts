import {
  mysqlTable,
  varchar,
  char,
  decimal,
  int,
  tinyint,
  smallint,
  datetime,
  primaryKey,
  bigint,
  date,
} from "drizzle-orm/mysql-core";

// ─── dat_op_bangunan ─────────────────────────────────────────────────
export const datOpBangunan = mysqlTable("dat_op_bangunan", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  kdJpb: char("KD_JPB", { length: 2 }),
  noFormulirLspop: char("NO_FORMULIR_LSPOP", { length: 11 }),
  thnDibangunBng: char("THN_DIBANGUN_BNG", { length: 4 }).notNull().default("0"),
  thnRenovasiBng: char("THN_RENOVASI_BNG", { length: 4 }),
  luasBng: bigint("LUAS_BNG", { mode: "number" }).notNull().default(0),
  jmlLantaiBng: int("JML_LANTAI_BNG").notNull().default(1),
  kondisiBng: char("KONDISI_BNG", { length: 1 }),
  jnsKonstruksiBng: char("JNS_KONSTRUKSI_BNG", { length: 1 }),
  jnsAtapBng: char("JNS_ATAP_BNG", { length: 1 }),
  kdDinding: char("KD_DINDING", { length: 1 }),
  kdLantai: char("KD_LANTAI", { length: 1 }),
  kdLangitLangit: char("KD_LANGIT_LANGIT", { length: 1 }),
  nilaiSistemBng: bigint("NILAI_SISTEM_BNG", { mode: "number" }).notNull().default(0),
  jnsTransaksiBng: char("JNS_TRANSAKSI_BNG", { length: 1 }),
  tglPendataanBng: datetime("TGL_PENDATAAN_BNG"),
  nipPendataBng: char("NIP_PENDATA_BNG", { length: 30 }),
  tglPemeriksaanBng: datetime("TGL_PEMERIKSAAN_BNG"),
  nipPemeriksaBng: char("NIP_PEMERIKSA_BNG", { length: 30 }),
  tglPerekamanBng: datetime("TGL_PEREKAMAN_BNG"),
  nipPerekamBng: char("NIP_PEREKAM_BNG", { length: 30 }),
  tglKunjunganKembali: date("TGL_KUNJUNGAN_KEMBALI"),
  nilaiIndividu: bigint("NILAI_INDIVIDU", { mode: "number" }).notNull().default(0),
  aktif: tinyint("AKTIF").notNull().default(1),
}, (table) => [
  primaryKey({ name: "pk_dat_op_bangunan", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

// ─── dat_fasilitas_bangunan ───────────────────────────────────────────
export const datFasilitasBangunan = mysqlTable("dat_fasilitas_bangunan", {
  kdPropinsi: varchar("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: varchar("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: varchar("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: varchar("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: varchar("KD_BLOK", { length: 3 }).notNull(),
  noUrut: varchar("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: varchar("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: smallint("NO_BNG").notNull(),
  kdFasilitas: varchar("KD_FASILITAS", { length: 2 }).notNull(),
  jmlSatuan: bigint("JML_SATUAN", { mode: "number" }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_dat_fasilitas_bangunan", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng, table.kdFasilitas] }),
]);

// ─── dat_jpb* ──────────────────────────────────────────────────

export const datJpb2 = mysqlTable("dat_jpb2", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  klsJpb2: char("KLS_JPB2", { length: 1 }).notNull().default("1"),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb2", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb3 = mysqlTable("dat_jpb3", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  typeKonstruksi: char("TYPE_KONSTRUKSI", { length: 1 }).notNull().default("1"),
  tingKolomJpb3: decimal("TING_KOLOM_JPB3", { precision: 4, scale: 0 }).notNull(),
  lbrBentJpb3: decimal("LBR_BENT_JPB3", { precision: 4, scale: 0 }).notNull(),
  luasMezzanineJpb3: decimal("LUAS_MEZZANINE_JPB3", { precision: 4, scale: 0 }).notNull(),
  kelilingDindingJpb3: decimal("KELILING_DINDING_JPB3", { precision: 4, scale: 0 }).notNull(),
  dayaDukungLantaiJpb3: decimal("DAYA_DUKUNG_LANTAI_JPB3", { precision: 8, scale: 0 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb3", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb4 = mysqlTable("dat_jpb4", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  klsJpb4: char("KLS_JPB4", { length: 1 }).notNull().default("1"),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb4", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb5 = mysqlTable("dat_jpb5", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  klsJpb5: char("KLS_JPB5", { length: 1 }).notNull().default("1"),
  luasKmrJpb5DgnAcSent: decimal("LUAS_KMR_JPB5_DGN_AC_SENT", { precision: 12, scale: 0 }).notNull(),
  luasRngLainJpb5DgnAcSent: decimal("LUAS_RNG_LAIN_JPB5_DGN_AC_SENT", { precision: 12, scale: 0 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb5", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb6 = mysqlTable("dat_jpb6", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  klsJpb6: char("KLS_JPB6", { length: 1 }).notNull().default("1"),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb6", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb7 = mysqlTable("dat_jpb7", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  jnsJpb7: char("JNS_JPB7", { length: 1 }).notNull().default("1"),
  bintangJpb7: char("BINTANG_JPB7", { length: 1 }).notNull().default("5"),
  jmlKmrJpb7: decimal("JML_KMR_JPB7", { precision: 4, scale: 0 }).notNull(),
  luasKmrJpb7DgnAcSent: decimal("LUAS_KMR_JPB7_DGN_AC_SENT", { precision: 12, scale: 0 }).notNull(),
  luasKmrLainJpb7DgnAcSent: decimal("LUAS_KMR_LAIN_JPB7_DGN_AC_SENT", { precision: 12, scale: 0 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb7", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb8 = mysqlTable("dat_jpb8", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  typeKonstruksi: char("TYPE_KONSTRUKSI", { length: 1 }).notNull().default("1"),
  tingKolomJpb8: decimal("TING_KOLOM_JPB8", { precision: 4, scale: 0 }).notNull(),
  lbrBentJpb8: decimal("LBR_BENT_JPB8", { precision: 4, scale: 0 }).notNull(),
  luasMezzanineJpb8: decimal("LUAS_MEZZANINE_JPB8", { precision: 4, scale: 0 }).notNull(),
  kelilingDindingJpb8: decimal("KELILING_DINDING_JPB8", { precision: 4, scale: 0 }).notNull(),
  dayaDukungLantaiJpb8: decimal("DAYA_DUKUNG_LANTAI_JPB8", { precision: 8, scale: 0 }),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb8", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb9 = mysqlTable("dat_jpb9", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  klsJpb9: char("KLS_JPB9", { length: 1 }).notNull().default("1"),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb9", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb12 = mysqlTable("dat_jpb12", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  typeJpb12: char("TYPE_JPB12", { length: 1 }).notNull().default("1"),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb12", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb13 = mysqlTable("dat_jpb13", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  klsJpb13: char("KLS_JPB13", { length: 1 }).notNull().default("1"),
  jmlJpb13: decimal("JML_JPB13", { precision: 4, scale: 0 }).notNull(),
  luasJpb13DgnAcSent: decimal("LUAS_JPB13_DGN_AC_SENT", { precision: 12, scale: 0 }).notNull(),
  luasJpb13LainDgnAcSent: decimal("LUAS_JPB13_LAIN_DGN_AC_SENT", { precision: 12, scale: 0 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb13", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb14 = mysqlTable("dat_jpb14", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  luasKanopiJpb14: decimal("LUAS_KANOPI_JPB14", { precision: 12, scale: 0 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb14", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb15 = mysqlTable("dat_jpb15", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  letakTangkiJpb15: char("LETAK_TANGKI_JPB15", { length: 1 }).notNull().default("1"),
  kapasitasTangkiJpb15: decimal("KAPASITAS_TANGKI_JPB15", { precision: 6, scale: 0 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb15", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);

export const datJpb16 = mysqlTable("dat_jpb16", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
  kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
  kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
  noUrut: char("NO_URUT", { length: 4 }).notNull(),
  kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  noBng: int("NO_BNG").notNull(),
  klsJpb16: char("KLS_JPB16", { length: 1 }).notNull().default("1"),
}, (table) => [
  primaryKey({ name: "pk_dat_jpb16", columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan, table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.noBng] }),
]);
