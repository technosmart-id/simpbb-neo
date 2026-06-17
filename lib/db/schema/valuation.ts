import { mysqlTable, primaryKey, char, tinyint, smallint, mediumint, bigint, decimal, varchar, int, text, double } from "drizzle-orm/mysql-core";

// ─── kayu_ulin ─────────────────────────────────────────────────

export const kayuUlin = mysqlTable("kayu_ulin", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnStatusKayuUlin: char("THN_STATUS_KAYU_ULIN", { length: 4 }).notNull(),
  statusKayuUlin: tinyint("STATUS_KAYU_ULIN"),
}, (table) => [
  primaryKey({ name: "pk_kayu_ulin", columns: [table.kdPropinsi, table.kdDati2, table.thnStatusKayuUlin] }),
]);

// ─── bangunan_lantai ─────────────────────────────────────────────────

export const bangunanLantai = mysqlTable("bangunan_lantai", {
  kdJpb: char("KD_JPB", { length: 2 }).notNull(),
  tipeBng: char("TIPE_BNG", { length: 5 }).notNull(),
  kdBngLantai: char("KD_BNG_LANTAI", { length: 8 }).notNull(),
  lantaiMinBngLantai: smallint("LANTAI_MIN_BNG_LANTAI"),
  lantaiMaxBngLantai: smallint("LANTAI_MAX_BNG_LANTAI"),
}, (table) => [
  primaryKey({ name: "pk_bangunan_lantai", columns: [table.kdJpb, table.tipeBng, table.kdBngLantai] }),
]);

// ─── tipe_bangunan ─────────────────────────────────────────────────

export const tipeBangunan = mysqlTable("tipe_bangunan", {
  tipeBng: char("TIPE_BNG", { length: 5 }).notNull().primaryKey(),
  nmTipeBng: varchar("NM_TIPE_BNG", { length: 30 }),
  luasMinTipeBng: mediumint("LUAS_MIN_TIPE_BNG"),
  luasMaxTipeBng: mediumint("LUAS_MAX_TIPE_BNG"),
  faktorPembagiTipeBng: decimal("FAKTOR_PEMBAGI_TIPE_BNG", { precision: 8, scale: 4 }),
}, (table) => [
]);

// ─── dbkb_standard ─────────────────────────────────────────────────

export const dbkbStandard = mysqlTable("dbkb_standard", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbStandard: char("THN_DBKB_STANDARD", { length: 4 }).notNull(),
  kdJpb: char("KD_JPB", { length: 2 }).notNull(),
  tipeBng: char("TIPE_BNG", { length: 5 }).notNull(),
  kdBngLantai: char("KD_BNG_LANTAI", { length: 8 }).notNull(),
  nilaiDbkbStandard: decimal("NILAI_DBKB_STANDARD", { precision: 11, scale: 4 }),
}, (table) => [
  primaryKey({ name: "pk_dbkb_standard", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbStandard, table.kdJpb, table.tipeBng, table.kdBngLantai] }),
]);

// ─── dbkb_material ─────────────────────────────────────────────────

export const dbkbMaterial = mysqlTable("dbkb_material", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbMaterial: char("THN_DBKB_MATERIAL", { length: 4 }).notNull(),
  kdPekerjaan: char("KD_PEKERJAAN", { length: 2 }).notNull(),
  kdKegiatan: char("KD_KEGIATAN", { length: 2 }).notNull(),
  nilaiDbkbMaterial: decimal("NILAI_DBKB_MATERIAL", { precision: 12, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_dbkb_material", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbMaterial, table.kdPekerjaan, table.kdKegiatan] }),
]);

// ─── dbkb_mezanin ─────────────────────────────────────────────────

export const dbkbMezanin = mysqlTable("dbkb_mezanin", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbMezanin: char("THN_DBKB_MEZANIN", { length: 4 }).notNull(),
  nilaiDbkbMezanin: int("NILAI_DBKB_MEZANIN"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_mezanin", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbMezanin] }),
]);

// ─── dbkb_daya_dukung ─────────────────────────────────────────────────

export const dbkbDayaDukung = mysqlTable("dbkb_daya_dukung", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbDayaDukung: char("THN_DBKB_DAYA_DUKUNG", { length: 4 }).notNull(),
  typeKonstruksi: char("TYPE_KONSTRUKSI", { length: 1 }).notNull(),
  nilaiDbkbDayaDukung: int("NILAI_DBKB_DAYA_DUKUNG"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_daya_dukung", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbDayaDukung, table.typeKonstruksi] }),
]);

// ─── fas_dep_min_max ─────────────────────────────────────────────────

export const fasDepMinMax = mysqlTable("fas_dep_min_max", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDepMinMax: char("THN_DEP_MIN_MAX", { length: 4 }).notNull(),
  kdFasilitas: char("KD_FASILITAS", { length: 2 }).notNull(),
  klsDepMin: mediumint("KLS_DEP_MIN").notNull(),
  klsDepMax: mediumint("KLS_DEP_MAX").notNull(),
  nilaiDepMinMax: decimal("NILAI_DEP_MIN_MAX", { precision: 10, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_fas_dep_min_max", columns: [table.kdPropinsi, table.kdDati2, table.thnDepMinMax, table.kdFasilitas, table.klsDepMin, table.klsDepMax] }),
]);

// ─── fas_non_dep ─────────────────────────────────────────────────

export const fasNonDep = mysqlTable("fas_non_dep", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnNonDep: char("THN_NON_DEP", { length: 4 }).notNull(),
  kdFasilitas: char("KD_FASILITAS", { length: 2 }).notNull(),
  nilaiNonDep: decimal("NILAI_NON_DEP", { precision: 10, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_fas_non_dep", columns: [table.kdPropinsi, table.kdDati2, table.thnNonDep, table.kdFasilitas] }),
]);

// ─── range_penyusutan ─────────────────────────────────────────────────

export const rangePenyusutan = mysqlTable("range_penyusutan", {
  kdRangePenyusutan: char("KD_RANGE_PENYUSUTAN", { length: 1 }).notNull().primaryKey(),
  nilaiMinPenyusutan: bigint("NILAI_MIN_PENYUSUTAN", { mode: "number" }),
  nilaiMaxPenyusutan: bigint("NILAI_MAX_PENYUSUTAN", { mode: "number" }),
}, (table) => [
]);

// ─── penyusutan ─────────────────────────────────────────────────

export const penyusutan = mysqlTable("penyusutan", {
  umurEfektif: tinyint("UMUR_EFEKTIF").notNull(),
  kdRangePenyusutan: char("KD_RANGE_PENYUSUTAN", { length: 1 }).notNull(),
  kondisiBngSusut: char("KONDISI_BNG_SUSUT", { length: 1 }).notNull(),
  nilaiPenyusutan: smallint("NILAI_PENYUSUTAN"),
}, (table) => [
  primaryKey({ name: "pk_penyusutan", columns: [table.umurEfektif, table.kdRangePenyusutan, table.kondisiBngSusut] }),
]);

// ─── tarif ─────────────────────────────────────────────────

export const tarif = mysqlTable("tarif", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnAwal: char("THN_AWAL", { length: 4 }).notNull(),
  thnAkhir: char("THN_AKHIR", { length: 4 }).notNull(),
  njopMin: decimal("NJOP_MIN", { precision: 15, scale: 0 }).notNull(),
  njopMax: decimal("NJOP_MAX", { precision: 15, scale: 0 }),
  nilaiTarif: decimal("NILAI_TARIF", { precision: 3, scale: 3 }),
  njkp: int("NJKP").notNull(),
}, (table) => [
  primaryKey({ name: "pk_tarif", columns: [table.kdPropinsi, table.kdDati2, table.thnAwal, table.thnAkhir, table.njopMin] }),
]);

// ─── dbkb_jpb2 ─────────────────────────────────────────────────

export const dbkbJpb2 = mysqlTable("dbkb_jpb2", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb2: char("THN_DBKB_JPB2", { length: 4 }).notNull(),
  klsDbkbJpb2: char("KLS_DBKB_JPB2", { length: 1 }).notNull(),
  lantaiMinJpb2: tinyint("LANTAI_MIN_JPB2").notNull(),
  lantaiMaxJpb2: tinyint("LANTAI_MAX_JPB2").notNull(),
  nilaiDbkbJpb2: int("NILAI_DBKB_JPB2"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb2", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb2, table.klsDbkbJpb2, table.lantaiMinJpb2, table.lantaiMaxJpb2] }),
]);

// ─── dbkb_jpb3 ─────────────────────────────────────────────────

export const dbkbJpb3 = mysqlTable("dbkb_jpb3", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb3: char("THN_DBKB_JPB3", { length: 4 }).notNull(),
  lbrBentMinDbkbJpb3: smallint("LBR_BENT_MIN_DBKB_JPB3").notNull(),
  lbrBentMaxDbkbJpb3: smallint("LBR_BENT_MAX_DBKB_JPB3").notNull(),
  tingKolomMinDbkbJpb3: smallint("TING_KOLOM_MIN_DBKB_JPB3").notNull(),
  tingKolomMaxDbkbJpb3: smallint("TING_KOLOM_MAX_DBKB_JPB3").notNull(),
  nilaiDbkbJpb3: decimal("NILAI_DBKB_JPB3", { precision: 12, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb3", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb3, table.lbrBentMinDbkbJpb3, table.lbrBentMaxDbkbJpb3, table.tingKolomMinDbkbJpb3, table.tingKolomMaxDbkbJpb3] }),
]);

// ─── dbkb_jpb4 ─────────────────────────────────────────────────

export const dbkbJpb4 = mysqlTable("dbkb_jpb4", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb4: char("THN_DBKB_JPB4", { length: 4 }).notNull(),
  klsDbkbJpb4: char("KLS_DBKB_JPB4", { length: 1 }).notNull(),
  lantaiMinJpb4: tinyint("LANTAI_MIN_JPB4").notNull(),
  lantaiMaxJpb4: tinyint("LANTAI_MAX_JPB4").notNull(),
  nilaiDbkbJpb4: int("NILAI_DBKB_JPB4"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb4", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb4, table.klsDbkbJpb4, table.lantaiMinJpb4, table.lantaiMaxJpb4] }),
]);

// ─── dbkb_jpb5 ─────────────────────────────────────────────────

export const dbkbJpb5 = mysqlTable("dbkb_jpb5", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb5: char("THN_DBKB_JPB5", { length: 4 }).notNull(),
  klsDbkbJpb5: char("KLS_DBKB_JPB5", { length: 1 }).notNull(),
  lantaiMinJpb5: tinyint("LANTAI_MIN_JPB5").notNull(),
  lantaiMaxJpb5: tinyint("LANTAI_MAX_JPB5").notNull(),
  nilaiDbkbJpb5: int("NILAI_DBKB_JPB5"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb5", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb5, table.klsDbkbJpb5, table.lantaiMinJpb5, table.lantaiMaxJpb5] }),
]);

// ─── dbkb_jpb6 ─────────────────────────────────────────────────

export const dbkbJpb6 = mysqlTable("dbkb_jpb6", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb6: char("THN_DBKB_JPB6", { length: 4 }).notNull(),
  klsDbkbJpb6: char("KLS_DBKB_JPB6", { length: 1 }).notNull(),
  nilaiDbkbJpb6: int("NILAI_DBKB_JPB6"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb6", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb6, table.klsDbkbJpb6] }),
]);

// ─── dbkb_jpb7 ─────────────────────────────────────────────────

export const dbkbJpb7 = mysqlTable("dbkb_jpb7", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb7: char("THN_DBKB_JPB7", { length: 4 }).notNull(),
  jnsDbkbJpb7: char("JNS_DBKB_JPB7", { length: 1 }).notNull(),
  bintangDbkbJpb7: char("BINTANG_DBKB_JPB7", { length: 1 }).notNull(),
  lantaiMinJpb7: tinyint("LANTAI_MIN_JPB7").notNull(),
  lantaiMaxJpb7: tinyint("LANTAI_MAX_JPB7").notNull(),
  nilaiDbkbJpb7: int("NILAI_DBKB_JPB7"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb7", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb7, table.jnsDbkbJpb7, table.bintangDbkbJpb7, table.lantaiMinJpb7, table.lantaiMaxJpb7] }),
]);

// ─── dbkb_jpb8 ─────────────────────────────────────────────────

export const dbkbJpb8 = mysqlTable("dbkb_jpb8", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb8: char("THN_DBKB_JPB8", { length: 4 }).notNull(),
  lbrBentMinDbkbJpb8: smallint("LBR_BENT_MIN_DBKB_JPB8").notNull(),
  lbrBentMaxDbkbJpb8: smallint("LBR_BENT_MAX_DBKB_JPB8").notNull(),
  tingKolomMinDbkbJpb8: smallint("TING_KOLOM_MIN_DBKB_JPB8").notNull(),
  tingKolomMaxDbkbJpb8: smallint("TING_KOLOM_MAX_DBKB_JPB8").notNull(),
  nilaiDbkbJpb8: decimal("NILAI_DBKB_JPB8", { precision: 12, scale: 2 }),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb8", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb8, table.lbrBentMinDbkbJpb8, table.lbrBentMaxDbkbJpb8, table.tingKolomMinDbkbJpb8, table.tingKolomMaxDbkbJpb8] }),
]);

// ─── dbkb_jpb9 ─────────────────────────────────────────────────

export const dbkbJpb9 = mysqlTable("dbkb_jpb9", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb9: char("THN_DBKB_JPB9", { length: 4 }).notNull(),
  klsDbkbJpb9: char("KLS_DBKB_JPB9", { length: 1 }).notNull(),
  lantaiMinJpb9: tinyint("LANTAI_MIN_JPB9").notNull(),
  lantaiMaxJpb9: tinyint("LANTAI_MAX_JPB9").notNull(),
  nilaiDbkbJpb9: int("NILAI_DBKB_JPB9"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb9", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb9, table.klsDbkbJpb9, table.lantaiMinJpb9, table.lantaiMaxJpb9] }),
]);

// ─── dbkb_jpb12 ─────────────────────────────────────────────────

export const dbkbJpb12 = mysqlTable("dbkb_jpb12", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb12: char("THN_DBKB_JPB12", { length: 4 }).notNull(),
  typeDbkbJpb12: char("TYPE_DBKB_JPB12", { length: 1 }).notNull(),
  nilaiDbkbJpb12: int("NILAI_DBKB_JPB12"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb12", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb12, table.typeDbkbJpb12] }),
]);

// ─── dbkb_jpb13 ─────────────────────────────────────────────────

export const dbkbJpb13 = mysqlTable("dbkb_jpb13", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb13: char("THN_DBKB_JPB13", { length: 4 }).notNull(),
  klsDbkbJpb13: char("KLS_DBKB_JPB13", { length: 1 }).notNull(),
  lantaiMinJpb13: tinyint("LANTAI_MIN_JPB13").notNull(),
  lantaiMaxJpb13: tinyint("LANTAI_MAX_JPB13").notNull(),
  nilaiDbkbJpb13: int("NILAI_DBKB_JPB13"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb13", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb13, table.klsDbkbJpb13, table.lantaiMinJpb13, table.lantaiMaxJpb13] }),
]);

// ─── dbkb_jpb14 ─────────────────────────────────────────────────

export const dbkbJpb14 = mysqlTable("dbkb_jpb14", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb14: char("THN_DBKB_JPB14", { length: 4 }).notNull(),
  nilaiDbkbJpb14: int("NILAI_DBKB_JPB14"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb14", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb14] }),
]);

// ─── dbkb_jpb15 ─────────────────────────────────────────────────

export const dbkbJpb15 = mysqlTable("dbkb_jpb15", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb15: char("THN_DBKB_JPB15", { length: 4 }).notNull(),
  jnsTangkiDbkbJpb15: char("JNS_TANGKI_DBKB_JPB15", { length: 1 }).notNull(),
  kapasitasMinDbkbJpb15: decimal("KAPASITAS_MIN_DBKB_JPB15", { precision: 9, scale: 4 }).notNull(),
  kapasitasMaxDbkbJpb15: decimal("KAPASITAS_MAX_DBKB_JPB15", { precision: 9, scale: 4 }).notNull(),
  nilaiDbkbJpb15: int("NILAI_DBKB_JPB15"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb15", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb15, table.jnsTangkiDbkbJpb15, table.kapasitasMinDbkbJpb15, table.kapasitasMaxDbkbJpb15] }),
]);

// ─── dbkb_jpb16 ─────────────────────────────────────────────────

export const dbkbJpb16 = mysqlTable("dbkb_jpb16", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
  kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
  thnDbkbJpb16: char("THN_DBKB_JPB16", { length: 4 }).notNull(),
  klsDbkbJpb16: char("KLS_DBKB_JPB16", { length: 1 }).notNull(),
  lantaiMinJpb16: tinyint("LANTAI_MIN_JPB16").notNull(),
  lantaiMaxJpb16: tinyint("LANTAI_MAX_JPB16").notNull(),
  nilaiDbkbJpb16: int("NILAI_DBKB_JPB16"),
}, (table) => [
  primaryKey({ name: "pk_dbkb_jpb16", columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbJpb16, table.klsDbkbJpb16, table.lantaiMinJpb16, table.lantaiMaxJpb16] }),
]);
