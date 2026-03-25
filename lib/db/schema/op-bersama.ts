import {
  mysqlTable,
  char,
  varchar,
  bigint,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { nopColumns, nopPrimaryKey, nopForeignKey } from "./_columns";
import { spop } from "./objek-pajak";

// ─── dat_op_induk ─────────────────────────────────────────────────

export const datOpInduk = mysqlTable(
  "dat_op_induk",
  {
    ...nopColumns(),
  },
  (table) => [
    nopPrimaryKey(table),
    nopForeignKey("fk_op_induk_spop", table, spop),
  ],
);

// ─── dat_op_anggota ───────────────────────────────────────────────
// Dual NOP sets: member NOP + parent NOP with _INDUK suffix

export const datOpAnggota = mysqlTable(
  "dat_op_anggota",
  {
    // Member NOP
    ...nopColumns(),

    // Parent NOP
    kdPropinsiInduk: char("KD_PROPINSI_INDUK", { length: 2 }).notNull(),
    kdDati2Induk: char("KD_DATI2_INDUK", { length: 2 }).notNull(),
    kdKecamatanInduk: char("KD_KECAMATAN_INDUK", { length: 3 }).notNull(),
    kdKelurahanInduk: char("KD_KELURAHAN_INDUK", { length: 3 }).notNull(),
    kdBlokInduk: char("KD_BLOK_INDUK", { length: 3 }).notNull(),
    noUrutInduk: char("NO_URUT_INDUK", { length: 4 }).notNull(),
    kdJnsOpInduk: char("KD_JNS_OP_INDUK", { length: 1 }).notNull(),

    // Porsi beban anggota
    luasBumiBeban: bigint("LUAS_BUMI_BEBAN", { mode: "number" }),
    luasBngBeban: bigint("LUAS_BNG_BEBAN", { mode: "number" }),
    nilaiSistemBumiBeban: bigint("NILAI_SISTEM_BUMI_BEBAN", { mode: "number" }),
    nilaiSistemBngBeban: bigint("NILAI_SISTEM_BNG_BEBAN", { mode: "number" }),
    njopBumiBeban: bigint("NJOP_BUMI_BEBAN", { mode: "number" }),
    njopBngBeban: bigint("NJOP_BNG_BEBAN", { mode: "number" }),
  },
  (table) => [
    nopPrimaryKey(table),
    nopForeignKey("fk_anggota_spop", table, spop),
  ],
);

// ─── dat_legalitas_bumi ───────────────────────────────────────────

export const datLegalitasBumi = mysqlTable(
  "dat_legalitas_bumi",
  {
    ...nopColumns(),
    noLegalitasTanah: varchar("NO_LEGALITAS_TANAH", { length: 100 }),
    jnsLegalitas: varchar("JNS_LEGALITAS", { length: 50 }),
  },
  (table) => [
    nopPrimaryKey(table),
    nopForeignKey("fk_legalitas_spop", table, spop),
  ],
);
