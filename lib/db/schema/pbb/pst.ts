import {
  char,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// pst_permohonan - Service request main table
export const pstPermohonan = pgTable(
  "pst_permohonan",
  {
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    thnPelayanan: char("thn_pelayanan", { length: 4 }).notNull(),
    bundelPelayanan: char("bundel_pelayanan", { length: 4 }).notNull(),
    noUrutPelayanan: char("no_urut_pelayanan", { length: 3 }).notNull(),
    noSrtPermohonan: char("no_srt_permohonan", { length: 30 }),
    tglSuratPermohonan: timestamp("tgl_surat_permohonan", {
      precision: 0,
      withTimezone: false,
    }),
    namaPemohon: varchar("nama_pemohon", { length: 30 }),
    alamatPemohon: varchar("alamat_pemohon", { length: 40 }),
    keteranganPst: varchar("keterangan_pst", { length: 75 }),
    catatanPst: varchar("catatan_pst", { length: 75 }),
    statusKolektif: char("status_kolektif", { length: 1 })
      .notNull()
      .default("0"),
    tglTerimaDokumenWp: timestamp("tgl_terima_dokumen_wp", {
      precision: 0,
      withTimezone: false,
    })
      .notNull()
      .defaultNow(),
    tglPerkiraanSelesai: timestamp("tgl_perkiraan_selesai", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    nipPenerima: char("nip_penerima", { length: 18 }).notNull(),
    // Extra fields from MySQL pelayanan table
    metadata: jsonb("metadata"),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdKanwil,
        table.kdKppbb,
        table.thnPelayanan,
        table.bundelPelayanan,
        table.noUrutPelayanan,
      ],
    }),
  ]
);

// pst_detail - Service request detail
export const pstDetail = pgTable(
  "pst_detail",
  {
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    thnPelayanan: char("thn_pelayanan", { length: 4 }).notNull(),
    bundelPelayanan: char("bundel_pelayanan", { length: 4 }).notNull(),
    noUrutPelayanan: char("no_urut_pelayanan", { length: 3 }).notNull(),
    // NOP of requester
    kdPropinsiPemohon: char("kd_propinsi_pemohon", { length: 2 }).notNull(),
    kdDati2Pemohon: char("kd_dati2_pemohon", { length: 2 }).notNull(),
    kdKecamatanPemohon: char("kd_kecamatan_pemohon", { length: 3 }).notNull(),
    kdKelurahanPemohon: char("kd_kelurahan_pemohon", { length: 3 }).notNull(),
    kdBlokPemohon: char("kd_blok_pemohon", { length: 3 }).notNull(),
    noUrutPemohon: char("no_urut_pemohon", { length: 4 }).notNull(),
    kdJnsOpPemohon: char("kd_jns_op_pemohon", { length: 1 }).notNull(),
    // Service details
    kdJnsPelayanan: char("kd_jns_pelayanan", { length: 2 }).notNull(),
    thnPajakPermohonan: char("thn_pajak_permohonan", { length: 4 }).notNull(),
    namaPenerima: varchar("nama_penerima", { length: 30 }).default(
      "WAJIB PAJAK"
    ),
    catatanPenyerahan: varchar("catatan_penyerahan", { length: 75 }),
    statusSelesai: smallint("status_selesai").notNull().default(0),
    tglSelesai: timestamp("tgl_selesai", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    kdSeksiBerkas: char("kd_seksi_berkas", { length: 2 }).notNull(),
    tglPenyerahan: timestamp("tgl_penyerahan", {
      precision: 0,
      withTimezone: false,
    }),
    nipPenyerah: char("nip_penyerah", { length: 18 }),
    // Extra fields from MySQL
    metadata: jsonb("metadata"),
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

// pst_data_op_baru - New tax object data from service request
export const pstDataOpBaru = pgTable(
  "pst_data_op_baru",
  {
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    thnPelayanan: char("thn_pelayanan", { length: 4 }).notNull(),
    bundelPelayanan: char("bundel_pelayanan", { length: 4 }).notNull(),
    noUrutPelayanan: char("no_urut_pelayanan", { length: 3 }).notNull(),
    // NOP of requester
    kdPropinsiPemohon: char("kd_propinsi_pemohon", { length: 2 }).notNull(),
    kdDati2Pemohon: char("kd_dati2_pemohon", { length: 2 }).notNull(),
    kdKecamatanPemohon: char("kd_kecamatan_pemohon", { length: 3 }).notNull(),
    kdKelurahanPemohon: char("kd_kelurahan_pemohon", { length: 3 }).notNull(),
    kdBlokPemohon: char("kd_blok_pemohon", { length: 3 }).notNull(),
    noUrutPemohon: char("no_urut_pemohon", { length: 4 }).notNull(),
    kdJnsOpPemohon: char("kd_jns_op_pemohon", { length: 1 }).notNull(),
    // New OP data
    namaWpBaru: varchar("nama_wp_baru", { length: 30 }).notNull(),
    letakOpBaru: varchar("letak_op_baru", { length: 35 }).notNull(),
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

// pst_lampiran - Service request attachments
export const pstLampiran = pgTable(
  "pst_lampiran",
  {
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    thnPelayanan: char("thn_pelayanan", { length: 4 }).notNull(),
    bundelPelayanan: char("bundel_pelayanan", { length: 4 }).notNull(),
    noUrutPelayanan: char("no_urut_pelayanan", { length: 3 }).notNull(),
    // Attachment flags (0 or 1)
    lPermohonan: smallint("l_permohonan").default(0),
    lSuratKuasa: smallint("l_surat_kuasa").default(0),
    lKtpWp: smallint("l_ktp_wp").default(0),
    lSertifikatTanah: smallint("l_sertifikat_tanah").default(0),
    lSppt: smallint("l_sppt").default(0),
    lImb: smallint("l_imb").default(0),
    lAkteJualBeli: smallint("l_akte_jual_beli").default(0),
    lSkPensiun: smallint("l_sk_pensiun").default(0),
    lSpptStts: smallint("l_sppt_stts").default(0),
    lStts: smallint("l_stts").default(0),
    lSkPengurangan: smallint("l_sk_pengurangan").default(0),
    lSkKeberatan: smallint("l_sk_keberatan").default(0),
    lSkkpPbb: smallint("l_skkp_pbb").default(0),
    lSpmkpPbb: smallint("l_spmkp_pbb").default(0),
    lLainLain: smallint("l_lain_lain").default(0),
    // Extra fields from MySQL pelayanan_dokumen
    metadata: jsonb("metadata"),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdKanwil,
        table.kdKppbb,
        table.thnPelayanan,
        table.bundelPelayanan,
        table.noUrutPelayanan,
      ],
    }),
  ]
);

// pst_permohonan_pengurangan - Reduction request
export const pstPermohonanPengurangan = pgTable(
  "pst_permohonan_pengurangan",
  {
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    thnPelayanan: char("thn_pelayanan", { length: 4 }).notNull(),
    bundelPelayanan: char("bundel_pelayanan", { length: 4 }).notNull(),
    noUrutPelayanan: char("no_urut_pelayanan", { length: 3 }).notNull(),
    // NOP of requester
    kdPropinsiPemohon: char("kd_propinsi_pemohon", { length: 2 }).notNull(),
    kdDati2Pemohon: char("kd_dati2_pemohon", { length: 2 }).notNull(),
    kdKecamatanPemohon: char("kd_kecamatan_pemohon", { length: 3 }).notNull(),
    kdKelurahanPemohon: char("kd_kelurahan_pemohon", { length: 3 }).notNull(),
    kdBlokPemohon: char("kd_blok_pemohon", { length: 3 }).notNull(),
    noUrutPemohon: char("no_urut_pemohon", { length: 4 }).notNull(),
    kdJnsOpPemohon: char("kd_jns_op_pemohon", { length: 1 }).notNull(),
    // Reduction details
    jnsPengurangan: char("jns_pengurangan", { length: 1 }).notNull(),
    pctPermohonanPengurangan: numeric("pct_permohonan_pengurangan", {
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
export type PstPermohonan = typeof pstPermohonan.$inferSelect;
export type NewPstPermohonan = typeof pstPermohonan.$inferInsert;
export type PstDetail = typeof pstDetail.$inferSelect;
export type NewPstDetail = typeof pstDetail.$inferInsert;
export type PstDataOpBaru = typeof pstDataOpBaru.$inferSelect;
export type PstLampiran = typeof pstLampiran.$inferSelect;
export type PstPermohonanPengurangan =
  typeof pstPermohonanPengurangan.$inferSelect;
