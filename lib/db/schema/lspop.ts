import {
  mysqlTable,
  char,
  varchar,
  int,
  smallint,
  bigint,
  decimal,
  tinyint,
  datetime,
  primaryKey,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { nopColumns, nopForeignKey } from "./_columns";
import { spop } from "./objek-pajak";
import { fasilitas } from "./klasifikasi";

// ─── dat_op_bangunan ──────────────────────────────────────────────

export const datOpBangunan = mysqlTable(
  "dat_op_bangunan",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),

    // Data Formulir
    noFormulirLspop: varchar("NO_FORMULIR_LSPOP", { length: 11 }),
    jnsTransaksiBng: char("JNS_TRANSAKSI_BNG", { length: 1 }),

    // Jenis Penggunaan Bangunan
    kdJpb: char("KD_JPB", { length: 2 }),

    // Dimensi & Fisik
    luasBng: bigint("LUAS_BNG", { mode: "number" }).notNull().default(0),
    jmlLantaiBng: int("JML_LANTAI_BNG").notNull().default(1),
    thnDibangunBng: char("THN_DIBANGUN_BNG", { length: 4 }),
    thnRenovasiBng: char("THN_RENOVASI_BNG", { length: 4 }),
    kondisiBng: char("KONDISI_BNG", { length: 1 }),
    jnsKonstruksiBng: char("JNS_KONSTRUKSI_BNG", { length: 1 }),

    // Komponen Material
    jnsAtapBng: char("JNS_ATAP_BNG", { length: 1 }),
    kdDinding: char("KD_DINDING", { length: 1 }),
    kdLantai: char("KD_LANTAI", { length: 1 }),
    kdLangitLangit: char("KD_LANGIT_LANGIT", { length: 1 }),

    // Nilai Bangunan
    nilaiSistemBng: bigint("NILAI_SISTEM_BNG", { mode: "number" }).notNull().default(0),
    nilaiIndividu: bigint("NILAI_INDIVIDU", { mode: "number" }).notNull().default(0),

    // Petugas Pendataan
    tglPendataanBng: datetime("TGL_PENDATAAN_BNG"),
    nmPendataanOp: varchar("NM_PENDATAAN_OP", { length: 200 }),
    nipPendataBng: varchar("NIP_PENDATA_BNG", { length: 30 }),

    // Petugas Pemeriksaan
    tglPemeriksaanBng: datetime("TGL_PEMERIKSAAN_BNG"),
    nmPemeriksaanOpBng: varchar("NM_PEMERIKSAAN_OP_BNG", { length: 200 }),
    nipPemeriksaBng: varchar("NIP_PEMERIKSA_BNG", { length: 30 }),

    tglKunjunganKembali: datetime("TGL_KUNJUNGAN_KEMBALI"),
    aktif: tinyint("AKTIF").notNull().default(1),
  },
  (table) => [
    primaryKey({
      name: "pk_op_bangunan",
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
    nopForeignKey("fk_bangunan_spop", table, spop),
  ],
);

// ─── dat_fasilitas_bangunan ───────────────────────────────────────

export const datFasilitasBangunan = mysqlTable(
  "dat_fasilitas_bangunan",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    kdFasilitas: char("KD_FASILITAS", { length: 2 }).notNull(),
    jmlSatuan: bigint("JML_SATUAN", { mode: "number" }).notNull().default(0),
  },
  (table) => [
    primaryKey({
      name: "pk_fasilitas_bangunan",
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
    foreignKey({
      name: "fk_fas_bangunan",
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
      foreignColumns: [
        datOpBangunan.kdPropinsi,
        datOpBangunan.kdDati2,
        datOpBangunan.kdKecamatan,
        datOpBangunan.kdKelurahan,
        datOpBangunan.kdBlok,
        datOpBangunan.noUrut,
        datOpBangunan.kdJnsOp,
        datOpBangunan.noBng,
      ],
    }),
    foreignKey({
      name: "fk_fas_master",
      columns: [table.kdFasilitas],
      foreignColumns: [fasilitas.kdFasilitas],
    }),
  ],
);
// ─── dat_jpb* tables ─────────────────────────────────────────────

export const datJpb3 = mysqlTable(
  "dat_jpb3",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    typeKonstruksi: char("TYPE_KONSTRUKSI", { length: 1 }).notNull().default("1"),
    tingKolomJpb3: decimal("TING_KOLOM_JPB3", { precision: 4, scale: 0 }).notNull(),
    lbrBentJpb3: decimal("LBR_BENT_JPB3", { precision: 4, scale: 0 }).notNull(),
    luasMezzanineJpb3: decimal("LUAS_MEZZANINE_JPB3", { precision: 4, scale: 0 }).notNull(),
    kelilingDindingJpb3: decimal("KELILING_DINDING_JPB3", { precision: 4, scale: 0 }).notNull(),
    dayaDukungLantaiJpb3: decimal("DAYA_DUKUNG_LANTAI_JPB3", { precision: 8, scale: 0 }).notNull(),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb3",
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
  ],
);

export const datJpb7 = mysqlTable(
  "dat_jpb7",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    jnsJpb7: char("JNS_JPB7", { length: 1 }).notNull(),
    bintangJpb7: char("BINTANG_JPB7", { length: 1 }).notNull(),
    jmlKmrJpb7: int("JML_KMR_JPB7").notNull(),
    luasKmrJpb7DgnAcSent: decimal("LUAS_KMR_JPB7_DGN_AC_SENT", { precision: 12, scale: 0 }).notNull(),
    luasKmrLainJpb7DgnAcSent: decimal("LUAS_KMR_LAIN_JPB7_DGN_AC_SENT", { precision: 12, scale: 0 }).notNull(),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb7",
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
  ],
);

export const datJpb8 = mysqlTable(
  "dat_jpb8",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    typeKonstruksi: char("TYPE_KONSTRUKSI", { length: 1 }).notNull().default("1"),
    tingKolomJpb8: decimal("TING_KOLOM_JPB8", { precision: 4, scale: 0 }).notNull(),
    lbrBentJpb8: decimal("LBR_BENT_JPB8", { precision: 4, scale: 0 }).notNull(),
    luasMezzanineJpb8: decimal("LUAS_MEZZANINE_JPB8", { precision: 4, scale: 0 }).notNull(),
    kelilingDindingJpb8: decimal("KELILING_DINDING_JPB8", { precision: 4, scale: 0 }).notNull(),
    dayaDukungLantaiJpb8: decimal("DAYA_DUKUNG_LANTAI_JPB8", { precision: 8, scale: 0 }),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb8",
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
  ],
);

export const datJpb2 = mysqlTable(
  "dat_jpb2",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    klsJpb2: char("KLS_JPB2", { length: 1 }).notNull().default("1"),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb2",
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
  ],
);

export const datJpb4 = mysqlTable(
  "dat_jpb4",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    klsJpb4: char("KLS_JPB4", { length: 1 }).notNull().default("1"),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb4",
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
  ],
);

export const datJpb5 = mysqlTable(
  "dat_jpb5",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    klsJpb5: char("KLS_JPB5", { length: 1 }).notNull().default("1"),
    luasJpb5DgnAcSent: decimal("LUAS_JPB5_DGN_AC_SENT", { precision: 12, scale: 0 }),
    luasJpb5LainDgnAcSent: decimal("LUAS_JPB5_LAIN_DGN_AC_SENT", { precision: 12, scale: 0 }),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb5",
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
  ],
);

export const datJpb6 = mysqlTable(
  "dat_jpb6",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    klsJpb6: char("KLS_JPB6", { length: 1 }).notNull().default("1"),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb6",
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
  ],
);

export const datJpb9 = mysqlTable(
  "dat_jpb9",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    klsJpb9: char("KLS_JPB9", { length: 1 }).notNull().default("1"),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb9",
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
  ],
);

export const datJpb12 = mysqlTable(
  "dat_jpb12",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    typeKonstruksiJpb12: char("TYPE_KONSTRUKSI_JPB12", { length: 1 }).notNull().default("1"),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb12",
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
  ],
);

export const datJpb13 = mysqlTable(
  "dat_jpb13",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    klsJpb13: char("KLS_JPB13", { length: 1 }).notNull().default("1"),
    jmlJpb13: decimal("JML_JPB13", { precision: 4, scale: 0 }),
    luasJpb13DgnAcSent: decimal("LUAS_JPB13_DGN_AC_SENT", { precision: 12, scale: 0 }),
    luasJpb13Lain_DGN_AC_SENT: decimal("LUAS_JPB13_LAIN_DGN_AC_SENT", { precision: 12, scale: 0 }),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb13",
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
  ],
);

export const datJpb14 = mysqlTable(
  "dat_jpb14",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    luasKanopiJpb14: decimal("LUAS_KANOPI_JPB14", { precision: 12, scale: 0 }),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb14",
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
  ],
);

export const datJpb15 = mysqlTable(
  "dat_jpb15",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    letakTangkiJpb15: char("LETAK_TANGKI_JPB15", { length: 1 }).notNull().default("1"),
    kapasitasTangkiJpb15: decimal("KAPASITAS_TANGKI_JPB15", { precision: 6, scale: 0 }),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb15",
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
  ],
);

export const datJpb16 = mysqlTable(
  "dat_jpb16",
  {
    ...nopColumns(),
    noBng: int("NO_BNG").notNull(),
    klsJpb16: char("KLS_JPB16", { length: 1 }).notNull().default("1"),
  },
  (table) => [
    primaryKey({
      name: "pk_jpb16",
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
  ],
);
