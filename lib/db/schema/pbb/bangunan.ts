import {
  bigint,
  char,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  timestamp,
} from "drizzle-orm/pg-core";

// dat_op_bangunan - Building data
export const datOpBangunan = pgTable(
  "dat_op_bangunan",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    kdJpb: char("kd_jpb", { length: 2 }).notNull(),
    noFormulirLspop: char("no_formulir_lspop", { length: 11 }).notNull(),
    thnDibangunBng: char("thn_dibangun_bng", { length: 4 }).notNull(),
    thnRenovasiBng: char("thn_renovasi_bng", { length: 4 }),
    luasBng: bigint("luas_bng", { mode: "number" }).notNull().default(0),
    jmlLantaiBng: smallint("jml_lantai_bng").notNull().default(1),
    kondisiBng: char("kondisi_bng", { length: 1 }).notNull(),
    jnsKonstruksiBng: char("jns_konstruksi_bng", { length: 1 }),
    jnsAtapBng: char("jns_atap_bng", { length: 1 }),
    kdDinding: char("kd_dinding", { length: 1 }),
    kdLantai: char("kd_lantai", { length: 1 }),
    kdLangitLangit: char("kd_langit_langit", { length: 1 }),
    nilaiSistemBng: bigint("nilai_sistem_bng", { mode: "number" }).notNull(),
    jnsTransaksiBng: char("jns_transaksi_bng", { length: 1 })
      .notNull()
      .default("1"),
    tglPendataanBng: timestamp("tgl_pendataan_bng", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    nipPendataBng: char("nip_pendata_bng", { length: 18 }).notNull(),
    tglPemeriksaanBng: timestamp("tgl_pemeriksaan_bng", {
      precision: 0,
      withTimezone: false,
    }).notNull(),
    nipPemeriksaBng: char("nip_pemeriksa_bng", { length: 18 }).notNull(),
    tglPerekamanBng: timestamp("tgl_perekaman_bng", {
      precision: 0,
      withTimezone: false,
    })
      .notNull()
      .defaultNow(),
    nipPerekamBng: char("nip_perekam_bng", { length: 18 }).notNull(),
    // Extra fields from legacy database stored as JSONB
    metadata: jsonb("metadata"),
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
  ]
);

// dat_fasilitas_bangunan - Building facilities
export const datFasilitasBangunan = pgTable(
  "dat_fasilitas_bangunan",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    kdFasilitas: char("kd_fasilitas", { length: 2 }).notNull(),
    jmlSatuan: bigint("jml_satuan", { mode: "number" }).notNull(),
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
        table.kdFasilitas,
      ],
    }),
  ]
);

// dat_jpb2 - Private offices (Perkantoran Swasta)
export const datJpb2 = pgTable(
  "dat_jpb2",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    klsJpb2: char("kls_jpb2", { length: 1 }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb3 - Factories (Pabrik)
export const datJpb3 = pgTable(
  "dat_jpb3",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    typeKonstruksi: char("type_konstruksi", { length: 1 }).notNull(),
    tingKolomJpb3: smallint("ting_kolom_jpb3").notNull(),
    lbrBentJpb3: smallint("lbr_bent_jpb3").notNull(),
    luasMezzanineJpb3: smallint("luas_mezzanine_jpb3"),
    kelilingDindingJpb3: smallint("keliling_dinding_jpb3"),
    dayaDukungLantaiJpb3: bigint("daya_dukung_lantai_jpb3", {
      mode: "number",
    }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb4 - Shops/Stores (Toko/Apotik/Pasar/Ruko)
export const datJpb4 = pgTable(
  "dat_jpb4",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    klsJpb4: char("kls_jpb4", { length: 1 }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb5 - Hospitals/Clinics (Rumah Sakit/Klinik)
export const datJpb5 = pgTable(
  "dat_jpb5",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    klsJpb5: char("kls_jpb5", { length: 1 }).notNull(),
    luasKmrJpb5DgnAcSent: bigint("luas_kmr_jpb5_dgn_ac_sent", {
      mode: "number",
    }),
    luasRngLainJpb5DgnAcSent: bigint("luas_rng_lain_jpb5_dgn_ac_sent", {
      mode: "number",
    }),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb6 - Sports facilities (Olahraga/Rekreasi)
export const datJpb6 = pgTable(
  "dat_jpb6",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    klsJpb6: char("kls_jpb6", { length: 1 }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb7 - Hotels/Restaurants (Hotel/Restoran/Wisma)
export const datJpb7 = pgTable(
  "dat_jpb7",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    jnsJpb7: char("jns_jpb7", { length: 1 }).notNull(),
    bintangJpb7: char("bintang_jpb7", { length: 1 }).notNull(),
    jmlKmrJpb7: smallint("jml_kmr_jpb7").notNull(),
    luasKmrJpb7DgnAcSent: bigint("luas_kmr_jpb7_dgn_ac_sent", {
      mode: "number",
    }),
    luasKmrLainJpb7DgnAcSent: bigint("luas_kmr_lain_jpb7_dgn_ac_sent", {
      mode: "number",
    }),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb8 - Warehouses (Gudang)
export const datJpb8 = pgTable(
  "dat_jpb8",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    typeKonstruksi: char("type_konstruksi", { length: 1 }).notNull(),
    tingKolomJpb8: smallint("ting_kolom_jpb8").notNull(),
    lbrBentJpb8: smallint("lbr_bent_jpb8").notNull(),
    luasMezzanineJpb8: smallint("luas_mezzanine_jpb8"),
    kelilingDindingJpb8: smallint("keliling_dinding_jpb8"),
    dayaDukungLantaiJpb8: bigint("daya_dukung_lantai_jpb8", {
      mode: "number",
    }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb9 - Government buildings (Gedung Pemerintahan)
export const datJpb9 = pgTable(
  "dat_jpb9",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    klsJpb9: char("kls_jpb9", { length: 1 }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb12 - Apartments/Flats (Apartemen/Rumah Susun)
export const datJpb12 = pgTable(
  "dat_jpb12",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    typeJpb12: char("type_jpb12", { length: 1 }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb13 - Cinemas/Theaters (Bioskop/Gedung Pertunjukan)
export const datJpb13 = pgTable(
  "dat_jpb13",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    klsJpb13: char("kls_jpb13", { length: 1 }).notNull(),
    jmlJpb13: smallint("jml_jpb13"),
    luasJpb13DgnAcSent: bigint("luas_jpb13_dgn_ac_sent", { mode: "number" }),
    luasJpb13LainDgnAcSent: bigint("luas_jpb13_lain_dgn_ac_sent", {
      mode: "number",
    }),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb14 - Gas stations (SPBU/SPBG)
export const datJpb14 = pgTable(
  "dat_jpb14",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    luasKanopiJpb14: bigint("luas_kanopi_jpb14", { mode: "number" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb15 - Storage tanks (Tangki)
export const datJpb15 = pgTable(
  "dat_jpb15",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    letakTangkiJpb15: char("letak_tangki_jpb15", { length: 1 }).notNull(),
    kapasitasTangkiJpb15: bigint("kapasitas_tangki_jpb15", {
      mode: "number",
    }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// dat_jpb16 - Other buildings (Bangunan Lain)
export const datJpb16 = pgTable(
  "dat_jpb16",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdBlok: char("kd_blok", { length: 3 }).notNull(),
    noUrut: char("no_urut", { length: 4 }).notNull(),
    kdJnsOp: char("kd_jns_op", { length: 1 }).notNull(),
    noBng: smallint("no_bng").notNull(),
    klsJpb16: char("kls_jpb16", { length: 1 }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [
        t.kdPropinsi,
        t.kdDati2,
        t.kdKecamatan,
        t.kdKelurahan,
        t.kdBlok,
        t.noUrut,
        t.kdJnsOp,
        t.noBng,
      ],
    }),
  ]
);

// Export types
export type DatOpBangunan = typeof datOpBangunan.$inferSelect;
export type NewDatOpBangunan = typeof datOpBangunan.$inferInsert;
export type DatFasilitasBangunan = typeof datFasilitasBangunan.$inferSelect;
