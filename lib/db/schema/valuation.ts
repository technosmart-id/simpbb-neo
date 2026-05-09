import { mysqlTable, primaryKey, char, tinyint, smallint, mediumint, bigint, decimal, varchar, int } from "drizzle-orm/mysql-core";

export const kayuulin = mysqlTable("kayu_ulin", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_status_kayu_ulin: char("THN_STATUS_KAYU_ULIN", { length: 4 }),
  status_kayu_ulin: tinyint("STATUS_KAYU_ULIN"),
}, (table) => [
  primaryKey({ name: "pk_kayu_ulin", columns: [table.kd_propinsi, table.kd_dati2, table.thn_status_kayu_ulin] }),
]);

export const bangunanlantai = mysqlTable("bangunan_lantai", {
  kd_jpb: char("KD_JPB", { length: 2 }),
  tipe_bng: char("TIPE_BNG", { length: 5 }),
  kd_bng_lantai: char("KD_BNG_LANTAI", { length: 8 }),
  lantai_min_bng_lantai: int("LANTAI_MIN_BNG_LANTAI"),
  lantai_max_bng_lantai: int("LANTAI_MAX_BNG_LANTAI"),
}, (table) => [
  primaryKey({ name: "pk_bangunan_lantai", columns: [table.kd_jpb, table.tipe_bng, table.kd_bng_lantai] }),
]);

export const tipebangunan = mysqlTable("tipe_bangunan", {
  tipe_bng: char("TIPE_BNG", { length: 5 }),
  nm_tipe_bng: varchar("NM_TIPE_BNG", { length: 30 }),
  luas_min_tipe_bng: mediumint("LUAS_MIN_TIPE_BNG"),
  luas_max_tipe_bng: mediumint("LUAS_MAX_TIPE_BNG"),
  faktor_pembagi_tipe_bng: decimal("FAKTOR_PEMBAGI_TIPE_BNG", { precision: 8, scale: 4 }),
}, (table) => [
  primaryKey({ name: "pk_tipe_bangunan", columns: [table.tipe_bng] }),
]);

export const dbkbstandard = mysqlTable("dbkb_standard", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_standard: char("THN_DBKB_STANDARD", { length: 4 }),
  kd_jpb: char("KD_JPB", { length: 2 }),
  tipe_bng: char("TIPE_BNG", { length: 5 }),
  kd_bng_lantai: char("KD_BNG_LANTAI", { length: 8 }),
  nilai_dbkb_standard: decimal("NILAI_DBKB_STANDARD", { precision: 11, scale: 4 }),
}, (table) => [
  primaryKey({ name: "pk_dbkb_standard", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_standard, table.kd_jpb, table.tipe_bng, table.kd_bng_lantai] }),
]);

export const dbkbmaterial = mysqlTable("dbkb_material", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_material: char("THN_DBKB_MATERIAL", { length: 4 }),
  kd_pekerjaan: char("KD_PEKERJAAN", { length: 2 }),
  kd_kegiatan: char("KD_KEGIATAN", { length: 2 }),
  nilai_dbkb_material: decimal("NILAI_DBKB_MATERIAL", { precision: 12, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_dbkb_material", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_material, table.kd_pekerjaan, table.kd_kegiatan] }),
]);

export const dbkbmezanin = mysqlTable("dbkb_mezanin", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_mezanin: char("THN_DBKB_MEZANIN", { length: 4 }),
  nilai_dbkb_mezanin: int("NILAI_DBKB_MEZANIN"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_mezanin", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_mezanin] }),
]);

export const dbkbdayadukung = mysqlTable("dbkb_daya_dukung", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_daya_dukung: char("THN_DBKB_DAYA_DUKUNG", { length: 4 }),
  type_konstruksi: char("TYPE_KONSTRUKSI", { length: 1 }),
  nilai_dbkb_daya_dukung: int("NILAI_DBKB_DAYA_DUKUNG"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_daya_dukung", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_daya_dukung, table.type_konstruksi] }),
]);

export const fasdepminmax = mysqlTable("fas_dep_min_max", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dep_min_max: char("THN_DEP_MIN_MAX", { length: 4 }),
  kd_fasilitas: char("KD_FASILITAS", { length: 2 }),
  kls_dep_min: mediumint("KLS_DEP_MIN"),
  kls_dep_max: mediumint("KLS_DEP_MAX"),
  nilai_dep_min_max: decimal("NILAI_DEP_MIN_MAX", { precision: 10, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_fas_dep_min_max", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dep_min_max, table.kd_fasilitas, table.kls_dep_min, table.kls_dep_max] }),
]);

export const fasnondep = mysqlTable("fas_non_dep", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_non_dep: char("THN_NON_DEP", { length: 4 }),
  kd_fasilitas: char("KD_FASILITAS", { length: 2 }),
  nilai_non_dep: decimal("NILAI_NON_DEP", { precision: 10, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_fas_non_dep", columns: [table.kd_propinsi, table.kd_dati2, table.thn_non_dep, table.kd_fasilitas] }),
]);

export const rangepenyusutan = mysqlTable("range_penyusutan", {
  kd_range_penyusutan: char("KD_RANGE_PENYUSUTAN", { length: 1 }),
  nilai_min_penyusutan: bigint("NILAI_MIN_PENYUSUTAN", { mode: "number" }),
  nilai_max_penyusutan: bigint("NILAI_MAX_PENYUSUTAN", { mode: "number" }),
}, (table) => [
  primaryKey({ name: "pk_range_penyusutan", columns: [table.kd_range_penyusutan] }),
]);

export const penyusutan = mysqlTable("penyusutan", {
  umur_efektif: tinyint("UMUR_EFEKTIF"),
  kd_range_penyusutan: char("KD_RANGE_PENYUSUTAN", { length: 1 }),
  kondisi_bng_susut: char("KONDISI_BNG_SUSUT", { length: 1 }),
  nilai_penyusutan: int("NILAI_PENYUSUTAN"),
}, (table) => [
  primaryKey({ name: "pk_penyusutan", columns: [table.umur_efektif, table.kd_range_penyusutan, table.kondisi_bng_susut] }),
]);

export const dbkbjpb2 = mysqlTable("dbkb_jpb2", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb2: char("THN_DBKB_JPB2", { length: 4 }),
  kls_dbkb_jpb2: char("KLS_DBKB_JPB2", { length: 1 }),
  lantai_min_jpb2: tinyint("LANTAI_MIN_JPB2"),
  lantai_max_jpb2: tinyint("LANTAI_MAX_JPB2"),
  nilai_dbkb_jpb2: int("NILAI_DBKB_JPB2"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb2", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb2, table.kls_dbkb_jpb2, table.lantai_min_jpb2, table.lantai_max_jpb2] }),
]);

export const dbkbjpb3 = mysqlTable("dbkb_jpb3", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb3: char("THN_DBKB_JPB3", { length: 4 }),
  lbr_bent_min_dbkb_jpb3: int("LBR_BENT_MIN_DBKB_JPB3"),
  lbr_bent_max_dbkb_jpb3: int("LBR_BENT_MAX_DBKB_JPB3"),
  ting_kolom_min_dbkb_jpb3: int("TING_KOLOM_MIN_DBKB_JPB3"),
  ting_kolom_max_dbkb_jpb3: int("TING_KOLOM_MAX_DBKB_JPB3"),
  nilai_dbkb_jpb3: decimal("NILAI_DBKB_JPB3", { precision: 12, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb3", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb3, table.lbr_bent_min_dbkb_jpb3, table.lbr_bent_max_dbkb_jpb3, table.ting_kolom_min_dbkb_jpb3, table.ting_kolom_max_dbkb_jpb3] }),
]);

export const dbkbjpb4 = mysqlTable("dbkb_jpb4", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb4: char("THN_DBKB_JPB4", { length: 4 }),
  kls_dbkb_jpb4: char("KLS_DBKB_JPB4", { length: 1 }),
  lantai_min_jpb4: tinyint("LANTAI_MIN_JPB4"),
  lantai_max_jpb4: tinyint("LANTAI_MAX_JPB4"),
  nilai_dbkb_jpb4: int("NILAI_DBKB_JPB4"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb4", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb4, table.kls_dbkb_jpb4, table.lantai_min_jpb4, table.lantai_max_jpb4] }),
]);

export const dbkbjpb5 = mysqlTable("dbkb_jpb5", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb5: char("THN_DBKB_JPB5", { length: 4 }),
  kls_dbkb_jpb5: char("KLS_DBKB_JPB5", { length: 1 }),
  lantai_min_jpb5: tinyint("LANTAI_MIN_JPB5"),
  lantai_max_jpb5: tinyint("LANTAI_MAX_JPB5"),
  nilai_dbkb_jpb5: int("NILAI_DBKB_JPB5"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb5", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb5, table.kls_dbkb_jpb5, table.lantai_min_jpb5, table.lantai_max_jpb5] }),
]);

export const dbkbjpb6 = mysqlTable("dbkb_jpb6", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb6: char("THN_DBKB_JPB6", { length: 4 }),
  kls_dbkb_jpb6: char("KLS_DBKB_JPB6", { length: 1 }),
  nilai_dbkb_jpb6: int("NILAI_DBKB_JPB6"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb6", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb6, table.kls_dbkb_jpb6] }),
]);

export const dbkbjpb7 = mysqlTable("dbkb_jpb7", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb7: char("THN_DBKB_JPB7", { length: 4 }),
  jns_dbkb_jpb7: char("JNS_DBKB_JPB7", { length: 1 }),
  bintang_dbkb_jpb7: char("BINTANG_DBKB_JPB7", { length: 1 }),
  lantai_min_jpb7: tinyint("LANTAI_MIN_JPB7"),
  lantai_max_jpb7: tinyint("LANTAI_MAX_JPB7"),
  nilai_dbkb_jpb7: int("NILAI_DBKB_JPB7"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb7", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb7, table.jns_dbkb_jpb7, table.bintang_dbkb_jpb7, table.lantai_min_jpb7, table.lantai_max_jpb7] }),
]);

export const dbkbjpb8 = mysqlTable("dbkb_jpb8", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb8: char("THN_DBKB_JPB8", { length: 4 }),
  lbr_bent_min_dbkb_jpb8: int("LBR_BENT_MIN_DBKB_JPB8"),
  lbr_bent_max_dbkb_jpb8: int("LBR_BENT_MAX_DBKB_JPB8"),
  ting_kolom_min_dbkb_jpb8: int("TING_KOLOM_MIN_DBKB_JPB8"),
  ting_kolom_max_dbkb_jpb8: int("TING_KOLOM_MAX_DBKB_JPB8"),
  nilai_dbkb_jpb8: decimal("NILAI_DBKB_JPB8", { precision: 12, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb8", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb8, table.lbr_bent_min_dbkb_jpb8, table.lbr_bent_max_dbkb_jpb8, table.ting_kolom_min_dbkb_jpb8, table.ting_kolom_max_dbkb_jpb8] }),
]);

export const dbkbjpb9 = mysqlTable("dbkb_jpb9", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb9: char("THN_DBKB_JPB9", { length: 4 }),
  kls_dbkb_jpb9: char("KLS_DBKB_JPB9", { length: 1 }),
  lantai_min_jpb9: tinyint("LANTAI_MIN_JPB9"),
  lantai_max_jpb9: tinyint("LANTAI_MAX_JPB9"),
  nilai_dbkb_jpb9: int("NILAI_DBKB_JPB9"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb9", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb9, table.kls_dbkb_jpb9, table.lantai_min_jpb9, table.lantai_max_jpb9] }),
]);

export const dbkbjpb12 = mysqlTable("dbkb_jpb12", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb12: char("THN_DBKB_JPB12", { length: 4 }),
  type_dbkb_jpb12: char("TYPE_DBKB_JPB12", { length: 1 }),
  nilai_dbkb_jpb12: int("NILAI_DBKB_JPB12"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb12", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb12, table.type_dbkb_jpb12] }),
]);

export const dbkbjpb13 = mysqlTable("dbkb_jpb13", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb13: char("THN_DBKB_JPB13", { length: 4 }),
  kls_dbkb_jpb13: char("KLS_DBKB_JPB13", { length: 1 }),
  lantai_min_jpb13: tinyint("LANTAI_MIN_JPB13"),
  lantai_max_jpb13: tinyint("LANTAI_MAX_JPB13"),
  nilai_dbkb_jpb13: int("NILAI_DBKB_JPB13"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb13", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb13, table.kls_dbkb_jpb13, table.lantai_min_jpb13, table.lantai_max_jpb13] }),
]);

export const dbkbjpb14 = mysqlTable("dbkb_jpb14", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb14: char("THN_DBKB_JPB14", { length: 4 }),
  nilai_dbkb_jpb14: int("NILAI_DBKB_JPB14"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb14", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb14] }),
]);

export const dbkbjpb15 = mysqlTable("dbkb_jpb15", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb15: char("THN_DBKB_JPB15", { length: 4 }),
  jns_tangki_dbkb_jpb15: char("JNS_TANGKI_DBKB_JPB15", { length: 1 }),
  kapasitas_min_dbkb_jpb15: decimal("KAPASITAS_MIN_DBKB_JPB15", { precision: 9, scale: 4 }),
  kapasitas_max_dbkb_jpb15: decimal("KAPASITAS_MAX_DBKB_JPB15", { precision: 9, scale: 4 }),
  nilai_dbkb_jpb15: int("NILAI_DBKB_JPB15"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb15", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb15, table.jns_tangki_dbkb_jpb15, table.kapasitas_min_dbkb_jpb15, table.kapasitas_max_dbkb_jpb15] }),
]);

export const dbkbjpb16 = mysqlTable("dbkb_jpb16", {
  kd_propinsi: char("KD_PROPINSI", { length: 2 }),
  kd_dati2: char("KD_DATI2", { length: 2 }),
  thn_dbkb_jpb16: char("THN_DBKB_JPB16", { length: 4 }),
  kls_dbkb_jpb16: char("KLS_DBKB_JPB16", { length: 1 }),
  lantai_min_jpb16: tinyint("LANTAI_MIN_JPB16"),
  lantai_max_jpb16: tinyint("LANTAI_MAX_JPB16"),
  nilai_dbkb_jpb16: int("NILAI_DBKB_JPB16"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb16", columns: [table.kd_propinsi, table.kd_dati2, table.thn_dbkb_jpb16, table.kls_dbkb_jpb16, table.lantai_min_jpb16, table.lantai_max_jpb16] }),
]);

