import {
  mysqlTable,
  varchar,
  char,
  bigint,
  date,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { nopColumns, nopPrimaryKey } from "./_columns";

// ─── dat_subjek_pajak ─────────────────────────────────────────────

export const datSubjekPajak = mysqlTable("dat_subjek_pajak", {
  subjekPajakId: varchar("SUBJEK_PAJAK_ID", { length: 30 }).primaryKey(),
  nmWp: varchar("NM_WP", { length: 30 }).notNull(),
  jalanWp: varchar("JALAN_WP", { length: 100 }).notNull(),
  blokKavNoWp: varchar("BLOK_KAV_NO_WP", { length: 15 }),
  rwWp: varchar("RW_WP", { length: 2 }),
  rtWp: varchar("RT_WP", { length: 3 }),
  kelurahanWp: varchar("KELURAHAN_WP", { length: 30 }),
  kotaWp: varchar("KOTA_WP", { length: 30 }),
  kdPosWp: varchar("KD_POS_WP", { length: 5 }),
  telpWp: varchar("TELP_WP", { length: 20 }),
  npwp: varchar("NPWP", { length: 16 }),
  emailWp: varchar("EMAIL_WP", { length: 100 }),
  statusPekerjaanWp: char("STATUS_PEKERJAAN_WP", { length: 1 }).notNull(),
});

// ─── spop ─────────────────────────────────────────────────────────

export const spop = mysqlTable(
  "spop",
  {
    ...nopColumns(),

    // Subjek Pajak
    subjekPajakId: varchar("SUBJEK_PAJAK_ID", { length: 30 }).notNull(),

    // Data Formulir
    noFormulirSpop: varchar("NO_FORMULIR_SPOP", { length: 11 }),
    jnsTransaksiOp: varchar("JNS_TRANSAKSI_OP", { length: 1 }).notNull(),

    // OP Bersama NOP (nullable)
    kdPropinsiBersama: varchar("KD_PROPINSI_BERSAMA", { length: 2 }),
    kdDati2Bersama: varchar("KD_DATI2_BERSAMA", { length: 2 }),
    kdKecamatanBersama: varchar("KD_KECAMATAN_BERSAMA", { length: 3 }),
    kdKelurahanBersama: varchar("KD_KELURAHAN_BERSAMA", { length: 3 }),
    kdBlokBersama: varchar("KD_BLOK_BERSAMA", { length: 3 }),
    noUrutBersama: varchar("NO_URUT_BERSAMA", { length: 4 }),
    kdJnsOpBersama: varchar("KD_JNS_OP_BERSAMA", { length: 1 }),

    // OP Asal NOP (nullable)
    kdPropinsiAsal: varchar("KD_PROPINSI_ASAL", { length: 2 }),
    kdDati2Asal: varchar("KD_DATI2_ASAL", { length: 2 }),
    kdKecamatanAsal: varchar("KD_KECAMATAN_ASAL", { length: 3 }),
    kdKelurahanAsal: varchar("KD_KELURAHAN_ASAL", { length: 3 }),
    kdBlokAsal: varchar("KD_BLOK_ASAL", { length: 3 }),
    noUrutAsal: varchar("NO_URUT_ASAL", { length: 4 }),
    kdJnsOpAsal: varchar("KD_JNS_OP_ASAL", { length: 1 }),

    noSpptLama: varchar("NO_SPPT_LAMA", { length: 4 }),

    // Alamat Lokasi OP
    jalanOp: varchar("JALAN_OP", { length: 30 }).notNull(),
    blokKavNoOp: varchar("BLOK_KAV_NO_OP", { length: 15 }),
    rtOp: varchar("RT_OP", { length: 3 }),
    rwOp: varchar("RW_OP", { length: 2 }),
    kelurahanOp: varchar("KELURAHAN_OP", { length: 30 }),

    // Status & Data Tanah
    kdStatusWp: varchar("KD_STATUS_WP", { length: 1 }).notNull(),
    luasBumi: bigint("LUAS_BUMI", { mode: "number" }).notNull(),
    kdZnt: varchar("KD_ZNT", { length: 2 }),
    jnsBumi: varchar("JNS_BUMI", { length: 1 }).notNull(),
    nilaiSistemBumi: bigint("NILAI_SISTEM_BUMI", { mode: "number" }).notNull(),

    // Petugas Pendataan
    tglPendataanOp: date("TGL_PENDATAAN_OP").notNull(),
    nmPendataanOp: varchar("NM_PENDATAAN_OP", { length: 30 }),
    nipPendata: varchar("NIP_PENDATA", { length: 20 }),

    // Petugas Pemeriksaan
    tglPemeriksaanOp: date("TGL_PEMERIKSAAN_OP").notNull(),
    nmPemeriksaanOp: varchar("NM_PEMERIKSAAN_OP", { length: 30 }),
    nipPemeriksaOp: varchar("NIP_PEMERIKSA_OP", { length: 20 }),

    noPersil: varchar("NO_PERSIL", { length: 5 }),
  },
  (table) => [
    nopPrimaryKey("pk_spop", table),
    foreignKey({
      name: "fk_spop_subjek",
      columns: [table.subjekPajakId],
      foreignColumns: [datSubjekPajak.subjekPajakId],
    }),
  ],
);
