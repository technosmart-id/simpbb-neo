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

    // JPB 03 (Industri/Gudang)
    tingKolomJpb3: bigint("TING_KOLOM_JPB3", { mode: "number" }),
    lbrBentJpb3: bigint("LBR_BENT_JPB3", { mode: "number" }),
    dayaDukungLantaiJpb3: bigint("DAYA_DUKUNG_LANTAI_JPB3", { mode: "number" }),
    kelilingDindingJpb3: bigint("KELILING_DINDING_JPB3", { mode: "number" }),
    luasMezzanineJpb3: bigint("LUAS_MEZZANINE_JPB3", { mode: "number" }),

    // JPB 02, 09 (Komersial/Kantor)
    klsJpb2: bigint("KLS_JPB2", { mode: "number" }),

    // JPB 04 (Apartemen)
    klsJpb4: bigint("KLS_JPB4", { mode: "number" }),

    // JPB 05 (Hotel)
    klsJpb5: bigint("KLS_JPB5", { mode: "number" }),

    // JPB 06 (Parkir)
    klsJpb6: bigint("KLS_JPB6", { mode: "number" }),

    // JPB 07 (Hotel Berbintang)
    jnsJpb7: char("JNS_JPB7", { length: 1 }),
    bintangJpb7: tinyint("BINTANG_JPB7"),
    jmlKmrJpb7: int("JML_KMR_JPB7"),
    luasKmrJpb7DgnAcSent: decimal("LUAS_KMR_JPB7_DGN_AC_SENT", { precision: 12, scale: 2 }),
    luasKmrLainJpb7DgnAcSent: decimal("LUAS_KMR_LAIN_JPB7_DGN_AC_SENT", { precision: 12, scale: 2 }),

    // JPB 13 & 16 (Olahraga)
    klsJpb13: bigint("KLS_JPB13", { mode: "number" }),
    klsJpb16: bigint("KLS_JPB16", { mode: "number" }),

    // Nilai Bangunan
    nilaiSistemBng: bigint("NILAI_SISTEM_BNG", { mode: "number" }).notNull().default(0),
    nilaiFormula: bigint("NILAI_FORMULA", { mode: "number" }),
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
