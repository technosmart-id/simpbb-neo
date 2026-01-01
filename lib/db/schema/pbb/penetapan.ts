import {
  bigint,
  char,
  index,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// fas_non_dep - Non-depreciable facility values
export const fasNonDep = pgTable(
  "fas_non_dep",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    thnNonDep: char("thn_non_dep", { length: 4 }).notNull(),
    kdFasilitas: char("kd_fasilitas", { length: 2 }).notNull(),
    nilaiNonDep: numeric("nilai_non_dep", {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.thnNonDep,
        table.kdFasilitas,
      ],
    }),
  ]
);

// range_penyusutan - Depreciation range lookup
export const rangePenyusutan = pgTable("range_penyusutan", {
  kdRangePenyusutan: char("kd_range_penyusutan", { length: 1 }).primaryKey(),
  nilaiMinPenyusutan: bigint("nilai_min_penyusutan", { mode: "number" }),
  nilaiMaxPenyusutan: bigint("nilai_max_penyusutan", { mode: "number" }),
});

export type FasNonDep = typeof fasNonDep.$inferSelect;
export type NewFasNonDep = typeof fasNonDep.$inferInsert;
export type RangePenyusutan = typeof rangePenyusutan.$inferSelect;
export type NewRangePenyusutan = typeof rangePenyusutan.$inferInsert;

// dat_subjek_pajak_njoptkp - Tracks which NOP gets NJOPTKP for each taxpayer
export const datSubjekPajakNjoptkp = pgTable(
  "dat_subjek_pajak_njoptkp",
  {
    subjekPajakId: char("subjek_pajak_id", { length: 30 }).primaryKey(),
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    thnNjoptkp: char("thn_njoptkp", { length: 4 }).notNull(),
  },
  (table) => [
    index("dat_subjek_pajak_njoptkp_nop_idx").on(
      table.kdPropinsi,
      table.kdDati2,
      table.kdKecamatan,
      table.kdKelurahan,
      table.kdBlok,
      table.noUrut,
      table.kdJnsOp
    ),
  ]
);

// dat_nilai_individu - Individual property valuations (override system values)
export const datNilaiIndividu = pgTable(
  "dat_nilai_individu",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    noFormulirIndividu: char("no_formulir_individu", { length: 11 }).notNull(),
    nilaiIndividu: bigint("nilai_individu", { mode: "number" }).notNull(),
    tglPenilaianIndividu: timestamp("tgl_penilaian_individu", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    nipPenilaiIndividu: char("nip_penilai_individu", { length: 18 }).notNull(),
    tglPemeriksaanIndividu: timestamp("tgl_pemeriksaan_individu", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    nipPemeriksaIndividu: char("nip_pemeriksa_individu", {
      length: 18,
    }).notNull(),
    tglRekamNilaiIndividu: timestamp("tgl_rekam_nilai_individu", {
      precision: 0,
      withTimezone: false,
    })
      .notNull()
      .defaultNow(),
    nipPerekamIndividu: char("nip_perekam_individu", { length: 18 }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdBlok,
        table.noUrut,
        table.kdJnsOp,
        table.noBng,
      ],
    }),
    uniqueIndex("dat_nilai_individu_formulir_idx").on(
      table.noFormulirIndividu,
      table.kdPropinsi,
      table.kdDati2,
      table.kdKecamatan,
      table.kdKelurahan,
      table.kdBlok,
      table.noUrut,
      table.kdJnsOp,
      table.noBng
    ),
  ]
);

// pengurangan_pst - PST-based tax reductions
export const penguranganPst = pgTable(
  "pengurangan_pst",
  {
    // Service request reference
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    thnPelayanan: char("thn_pelayanan", { length: 4 }).notNull(),
    bundelPelayanan: char("bundel_pelayanan", { length: 4 }).notNull(),
    noUrutPelayanan: char("no_urut_pelayanan", { length: 3 }).notNull(),
    // Applicant NOP
    kdPropinsiPemohon: char("kd_propinsi_pemohon", { length: 2 }).notNull(),
    kdDati2Pemohon: char("kd_dati2_pemohon", { length: 2 }).notNull(),
    kdKecamatanPemohon: char("kd_kecamatan_pemohon", { length: 3 }).notNull(),
    kdKelurahanPemohon: char("kd_kelurahan_pemohon", { length: 3 }).notNull(),
    kdBlokPemohon: char("kd_blok_pemohon", { length: 3 }).notNull(),
    noUrutPemohon: char("no_urut_pemohon", { length: 4 }).notNull(),
    kdJnsOpPemohon: char("kd_jns_op_pemohon", { length: 1 }).notNull(),
    // Reduction details
    thnPengPst: char("thn_peng_pst", { length: 4 }).notNull(),
    jnsSk: char("jns_sk", { length: 1 }).notNull(),
    noSk: char("no_sk", { length: 30 }).notNull(),
    statusSkPengPst: char("status_sk_peng_pst", { length: 1 }).notNull(),
    pctPenguranganPst: numeric("pct_pengurangan_pst", {
      precision: 5,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdKanwil,
        table.kdKppbb,
        table.thnPelayanan,
        table.bundelPelayanan,
        table.noUrutPelayanan,
        table.kdPropinsiPemohon,
        table.kdDati2Pemohon,
        table.kdKecamatanPemohon,
        table.kdKelurahanPemohon,
        table.kdBlokPemohon,
        table.noUrutPemohon,
        table.kdJnsOpPemohon,
      ],
    }),
  ]
);

// pengurangan_permanen - Permanent tax reductions
export const penguranganPermanen = pgTable(
  "pengurangan_permanen",
  {
    // Service request reference
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    thnPelayanan: char("thn_pelayanan", { length: 4 }).notNull(),
    bundelPelayanan: char("bundel_pelayanan", { length: 4 }).notNull(),
    noUrutPelayanan: char("no_urut_pelayanan", { length: 3 }).notNull(),
    // Applicant NOP
    kdPropinsiPemohon: char("kd_propinsi_pemohon", { length: 2 }).notNull(),
    kdDati2Pemohon: char("kd_dati2_pemohon", { length: 2 }).notNull(),
    kdKecamatanPemohon: char("kd_kecamatan_pemohon", { length: 3 }).notNull(),
    kdKelurahanPemohon: char("kd_kelurahan_pemohon", { length: 3 }).notNull(),
    kdBlokPemohon: char("kd_blok_pemohon", { length: 3 }).notNull(),
    noUrutPemohon: char("no_urut_pemohon", { length: 4 }).notNull(),
    kdJnsOpPemohon: char("kd_jns_op_pemohon", { length: 1 }).notNull(),
    // Reduction period and details
    thnPengPermanenAwal: char("thn_peng_permanen_awal", {
      length: 4,
    }).notNull(),
    thnPengPermanenAkhir: char("thn_peng_permanen_akhir", { length: 4 })
      .notNull()
      .default("9999"),
    jnsSk: char("jns_sk", { length: 1 }).notNull(),
    noSk: char("no_sk", { length: 30 }).notNull(),
    statusSkPengPermanen: char("status_sk_peng_permanen", {
      length: 1,
    }).notNull(),
    pctPenguranganPermanen: numeric("pct_pengurangan_permanen", {
      precision: 5,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdKanwil,
        table.kdKppbb,
        table.thnPelayanan,
        table.bundelPelayanan,
        table.noUrutPelayanan,
        table.kdPropinsiPemohon,
        table.kdDati2Pemohon,
        table.kdKecamatanPemohon,
        table.kdKelurahanPemohon,
        table.kdBlokPemohon,
        table.noUrutPemohon,
        table.kdJnsOpPemohon,
      ],
    }),
  ]
);

// pengurangan_pengenaan_jpb - JPB-specific tax deductions
export const penguranganPengenaanJpb = pgTable(
  "pengurangan_pengenaan_jpb",
  {
    // Service request reference
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    thnPelayanan: char("thn_pelayanan", { length: 4 }).notNull(),
    bundelPelayanan: char("bundel_pelayanan", { length: 4 }).notNull(),
    noUrutPelayanan: char("no_urut_pelayanan", { length: 3 }).notNull(),
    // Applicant NOP
    kdPropinsiPemohon: char("kd_propinsi_pemohon", { length: 2 }).notNull(),
    kdDati2Pemohon: char("kd_dati2_pemohon", { length: 2 }).notNull(),
    kdKecamatanPemohon: char("kd_kecamatan_pemohon", { length: 3 }).notNull(),
    kdKelurahanPemohon: char("kd_kelurahan_pemohon", { length: 3 }).notNull(),
    kdBlokPemohon: char("kd_blok_pemohon", { length: 3 }).notNull(),
    noUrutPemohon: char("no_urut_pemohon", { length: 4 }).notNull(),
    kdJnsOpPemohon: char("kd_jns_op_pemohon", { length: 1 }).notNull(),
    // JPB reduction details
    thnPengenaanJpb: char("thn_pengenaan_jpb", { length: 4 }).notNull(),
    jnsSk: char("jns_sk", { length: 1 }).notNull(),
    noSk: char("no_sk", { length: 30 }).notNull(),
    pctPenguranganJpb: numeric("pct_pengurangan_jpb", {
      precision: 5,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdKanwil,
        table.kdKppbb,
        table.thnPelayanan,
        table.bundelPelayanan,
        table.noUrutPelayanan,
        table.kdPropinsiPemohon,
        table.kdDati2Pemohon,
        table.kdKecamatanPemohon,
        table.kdKelurahanPemohon,
        table.kdBlokPemohon,
        table.noUrutPemohon,
        table.kdJnsOpPemohon,
      ],
    }),
  ]
);

// Export types
export type DatSubjekPajakNjoptkp = typeof datSubjekPajakNjoptkp.$inferSelect;
export type NewDatSubjekPajakNjoptkp =
  typeof datSubjekPajakNjoptkp.$inferInsert;
export type DatNilaiIndividu = typeof datNilaiIndividu.$inferSelect;
export type NewDatNilaiIndividu = typeof datNilaiIndividu.$inferInsert;
export type PenguranganPst = typeof penguranganPst.$inferSelect;
export type NewPenguranganPst = typeof penguranganPst.$inferInsert;
export type PenguranganPermanen = typeof penguranganPermanen.$inferSelect;
export type NewPenguranganPermanen = typeof penguranganPermanen.$inferInsert;
export type PenguranganPengenaanJpb =
  typeof penguranganPengenaanJpb.$inferSelect;
export type NewPenguranganPengenaanJpb =
  typeof penguranganPengenaanJpb.$inferInsert;
