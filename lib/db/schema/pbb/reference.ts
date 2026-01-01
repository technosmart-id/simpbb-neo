import {
  char,
  integer,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  varchar,
} from "drizzle-orm/pg-core";

// ref_propinsi - Province reference
export const refPropinsi = pgTable("ref_propinsi", {
  kdPropinsi: char("kd_propinsi", { length: 2 }).primaryKey(),
  nmPropinsi: varchar("nm_propinsi", { length: 30 }).notNull(),
});

// ref_dati2 - City/Regency reference
export const refDati2 = pgTable(
  "ref_dati2",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    nmDati2: varchar("nm_dati2", { length: 30 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.kdPropinsi, table.kdDati2] })]
);

// ref_kecamatan - District reference
export const refKecamatan = pgTable(
  "ref_kecamatan",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    nmKecamatan: varchar("nm_kecamatan", { length: 30 }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan],
    }),
  ]
);

// ref_kelurahan - Village reference
export const refKelurahan = pgTable(
  "ref_kelurahan",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    kdKecamatan: char("kd_kecamatan", { length: 3 }).notNull(),
    kdKelurahan: char("kd_kelurahan", { length: 3 }).notNull(),
    kdSektor: char("kd_sektor", { length: 2 }).notNull().default("10"),
    nmKelurahan: varchar("nm_kelurahan", { length: 30 }).notNull(),
    noKelurahan: smallint("no_kelurahan"),
    kdPosKelurahan: varchar("kd_pos_kelurahan", { length: 5 }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
      ],
    }),
  ]
);

// ref_jpb - Building type reference
export const refJpb = pgTable("ref_jpb", {
  kdJpb: char("kd_jpb", { length: 2 }).primaryKey(),
  nmJpb: varchar("nm_jpb", { length: 50 }).notNull(),
});

// kelas_tanah - Land class
export const kelasTanah = pgTable(
  "kelas_tanah",
  {
    kdKlsTanah: char("kd_kls_tanah", { length: 3 }).notNull(),
    thnAwalKlsTanah: char("thn_awal_kls_tanah", { length: 4 }).notNull(),
    thnAkhirKlsTanah: char("thn_akhir_kls_tanah", { length: 4 }).notNull(),
    nilaiMinTanah: numeric("nilai_min_tanah", {
      precision: 8,
      scale: 2,
    }).notNull(),
    nilaiMaxTanah: numeric("nilai_max_tanah", {
      precision: 8,
      scale: 2,
    }).notNull(),
    nilaiPerM2Tanah: numeric("nilai_per_m2_tanah", {
      precision: 8,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.kdKlsTanah, table.thnAwalKlsTanah] }),
  ]
);

// kelas_bangunan - Building class
export const kelasBangunan = pgTable(
  "kelas_bangunan",
  {
    kdKlsBng: char("kd_kls_bng", { length: 3 }).notNull(),
    thnAwalKlsBng: char("thn_awal_kls_bng", { length: 4 }).notNull(),
    thnAkhirKlsBng: char("thn_akhir_kls_bng", { length: 4 }).notNull(),
    nilaiMinBng: numeric("nilai_min_bng", { precision: 8, scale: 2 }).notNull(),
    nilaiMaxBng: numeric("nilai_max_bng", { precision: 8, scale: 2 }).notNull(),
    nilaiPerM2Bng: numeric("nilai_per_m2_bng", {
      precision: 8,
      scale: 2,
    }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.kdKlsBng, table.thnAwalKlsBng] })]
);

// fasilitas - Facilities reference
export const fasilitas = pgTable("fasilitas", {
  kdFasilitas: char("kd_fasilitas", { length: 2 }).primaryKey(),
  nmFasilitas: varchar("nm_fasilitas", { length: 50 }).notNull(),
  satuanFasilitas: varchar("satuan_fasilitas", { length: 10 }).notNull(),
  statusFasilitas: char("status_fasilitas", { length: 1 }).notNull(),
  ketergantungan: char("ketergantungan", { length: 1 }).notNull(),
});

// tipe_bangunan - Building type
export const tipeBangunan = pgTable("tipe_bangunan", {
  tipeBng: char("tipe_bng", { length: 5 }).primaryKey(),
  nmTipeBng: varchar("nm_tipe_bng", { length: 30 }).notNull(),
  luasMinTipeBng: integer("luas_min_tipe_bng").notNull(),
  luasMaxTipeBng: integer("luas_max_tipe_bng").notNull(),
  faktorPembagiTipeBng: numeric("faktor_pembagi_tipe_bng", {
    precision: 8,
    scale: 4,
  }).notNull(),
});

// bank_tunggal - Single bank reference
export const bankTunggal = pgTable(
  "bank_tunggal",
  {
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    kdBankTunggal: char("kd_bank_tunggal", { length: 2 }).notNull(),
    nmBankTunggal: varchar("nm_bank_tunggal", { length: 30 }).notNull(),
    alBankTunggal: varchar("al_bank_tunggal", { length: 50 }).notNull(),
    noRekBankTunggal: varchar("no_rek_bank_tunggal", { length: 15 }),
  },
  (table) => [
    primaryKey({
      columns: [table.kdKanwil, table.kdKppbb, table.kdBankTunggal],
    }),
  ]
);

// bank_persepsi - Perception bank reference
export const bankPersepsi = pgTable(
  "bank_persepsi",
  {
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    kdBankTunggal: char("kd_bank_tunggal", { length: 2 }).notNull(),
    kdBankPersepsi: char("kd_bank_persepsi", { length: 2 }).notNull(),
    nmBankPersepsi: varchar("nm_bank_persepsi", { length: 30 }).notNull(),
    alBankPersepsi: varchar("al_bank_persepsi", { length: 50 }).notNull(),
    noRekBankPersepsi: varchar("no_rek_bank_persepsi", { length: 15 }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdKanwil,
        table.kdKppbb,
        table.kdBankTunggal,
        table.kdBankPersepsi,
      ],
    }),
  ]
);

// tempat_pembayaran - Payment location reference
export const tempatPembayaran = pgTable(
  "tempat_pembayaran",
  {
    kdKanwil: char("kd_kanwil", { length: 2 }).notNull(),
    kdKppbb: char("kd_kppbb", { length: 2 }).notNull(),
    kdBankTunggal: char("kd_bank_tunggal", { length: 2 }).notNull(),
    kdBankPersepsi: char("kd_bank_persepsi", { length: 2 }).notNull(),
    kdTp: char("kd_tp", { length: 2 }).notNull(),
    nmTp: varchar("nm_tp", { length: 30 }).notNull(),
    alamatTp: varchar("alamat_tp", { length: 50 }).notNull(),
    noRekTp: varchar("no_rek_tp", { length: 15 }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdKanwil,
        table.kdKppbb,
        table.kdBankTunggal,
        table.kdBankPersepsi,
        table.kdTp,
      ],
    }),
  ]
);

// Export types
export type RefPropinsi = typeof refPropinsi.$inferSelect;
export type RefDati2 = typeof refDati2.$inferSelect;
export type RefKecamatan = typeof refKecamatan.$inferSelect;
export type RefKelurahan = typeof refKelurahan.$inferSelect;
export type RefJpb = typeof refJpb.$inferSelect;
export type KelasTanah = typeof kelasTanah.$inferSelect;
export type KelasBangunan = typeof kelasBangunan.$inferSelect;
export type Fasilitas = typeof fasilitas.$inferSelect;
export type TipeBangunan = typeof tipeBangunan.$inferSelect;
export type BankTunggal = typeof bankTunggal.$inferSelect;
export type BankPersepsi = typeof bankPersepsi.$inferSelect;
export type TempatPembayaran = typeof tempatPembayaran.$inferSelect;
