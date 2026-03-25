import {
  mysqlTable,
  char,
  varchar,
  int,
  tinyint,
  decimal,
  date,
  datetime,
  year,
  text,
  double,
  primaryKey,
  foreignKey,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { nopColumns, nopPrimaryKey, nopForeignKey, longtext } from "./_columns";
import { spop } from "./objek-pajak";
import { jenisSppt } from "./klasifikasi";

// ─── sppt ─────────────────────────────────────────────────────────

export const sppt = mysqlTable(
  "sppt",
  {
    ...nopColumns(),
    thnPajakSppt: year("THN_PAJAK_SPPT").notNull(),

    // Metadata
    siklusSppt: tinyint("SIKLUS_SPPT").notNull().default(1),
    kdJnsSppt: int("KD_JNS_SPPT"),

    // Kelas
    kdKlsTanah: varchar("KD_KLS_TANAH", { length: 5 }),
    kdKlsBng: varchar("KD_KLS_BNG", { length: 5 }),

    // Tanggal
    tglJatuhTempo: date("TGL_JATUH_TEMPO"),
    tglTerbit: date("TGL_TERBIT"),
    tglCetak: date("TGL_CETAK"),

    // Data Fisik (snapshot)
    luasBumi: decimal("LUAS_BUMI", { precision: 12, scale: 2 }).notNull().default("0"),
    luasBng: decimal("LUAS_BNG", { precision: 12, scale: 2 }).notNull().default("0"),

    // Nilai NJOP
    njopBumi: decimal("NJOP_BUMI", { precision: 15, scale: 2 }).notNull().default("0"),
    njopBng: decimal("NJOP_BNG", { precision: 15, scale: 2 }).notNull().default("0"),
    njopSppt: decimal("NJOP_SPPT", { precision: 15, scale: 2 }).notNull().default("0"),

    // Kalkulasi Pajak
    njoptkpSppt: decimal("NJOPTKP_SPPT", { precision: 15, scale: 2 }).notNull().default("0"),
    njkpSppt: decimal("NJKP_SPPT", { precision: 15, scale: 2 }).notNull().default("0"),
    pbbTerhutangSppt: decimal("PBB_TERHUTANG_SPPT", { precision: 15, scale: 2 }).notNull().default("0"),
    faktorPengurangSppt: decimal("FAKTOR_PENGURANG_SPPT", { precision: 15, scale: 2 }).notNull().default("0"),
    pbbYgHarusDibayarSppt: decimal("PBB_YG_HARUS_DIBAYAR_SPPT", { precision: 15, scale: 2 }).notNull().default("0"),

    // Status
    statusPembayaranSppt: char("STATUS_PEMBAYARAN_SPPT", { length: 1 }).notNull().default("0"),
    statusTagihanSppt: char("STATUS_TAGIHAN_SPPT", { length: 1 }).notNull().default("0"),
    statusCetakSppt: char("STATUS_CETAK_SPPT", { length: 1 }).notNull().default("0"),
    statusPembatalan: char("STATUS_PEMBATALAN", { length: 1 }).notNull().default("0"),

    // Data WP (snapshot)
    nmWp: varchar("NM_WP", { length: 30 }),
    jalanWp: varchar("JALAN_WP", { length: 100 }),
  },
  (table) => [
    primaryKey({
      name: "pk_sppt",
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdBlok,
        table.noUrut,
        table.kdJnsOp,
        table.thnPajakSppt,
      ],
    }),
    index("idx_sppt_status_bayar").on(table.statusPembayaranSppt),
    index("idx_sppt_thn").on(table.thnPajakSppt),
    nopForeignKey("fk_sppt_spop", table, spop),
  ],
);

// ─── histori_sppt ─────────────────────────────────────────────────

export const historiSppt = mysqlTable(
  "histori_sppt",
  {
    id: int("ID").autoincrement().primaryKey(),
    ...nopColumns(),
    thnPajakSppt: year("THN_PAJAK_SPPT").notNull(),
    siklusSppt: tinyint("SIKLUS_SPPT").notNull(),

    // Snapshot values
    njopBumi: decimal("NJOP_BUMI", { precision: 15, scale: 2 }),
    njopBng: decimal("NJOP_BNG", { precision: 15, scale: 2 }),
    njopSppt: decimal("NJOP_SPPT", { precision: 15, scale: 2 }),
    njoptkpSppt: decimal("NJOPTKP_SPPT", { precision: 15, scale: 2 }),
    njkpSppt: decimal("NJKP_SPPT", { precision: 15, scale: 2 }),
    pbbTerhutangSppt: decimal("PBB_TERHUTANG_SPPT", { precision: 15, scale: 2 }),
    faktorPengurangSppt: decimal("FAKTOR_PENGURANG_SPPT", { precision: 15, scale: 2 }),
    pbbYgHarusDibayarSppt: decimal("PBB_YG_HARUS_DIBAYAR_SPPT", { precision: 15, scale: 2 }),
    tglPerubahan: datetime("TGL_PERUBAHAN").notNull().default(sql`CURRENT_TIMESTAMP`),
    nipPetugas: varchar("NIP_PETUGAS", { length: 40 }),
    keterangan: text("KETERANGAN"),
  },
  (table) => [
    index("idx_histori_nop").on(
      table.kdPropinsi,
      table.kdDati2,
      table.kdKecamatan,
      table.kdKelurahan,
      table.kdBlok,
      table.noUrut,
      table.kdJnsOp,
      table.thnPajakSppt,
    ),
  ],
);

// ─── sppt_khusus ──────────────────────────────────────────────────

export const spptKhusus = mysqlTable(
  "sppt_khusus",
  {
    ...nopColumns(),
    jenisSppt: int("JENIS_SPPT").notNull(),
    keterangan: varchar("KETERANGAN", { length: 200 }),
  },
  (table) => [
    nopPrimaryKey("pk_sppt_khusus", table),
    foreignKey({
      name: "fk_sppt_khusus_jenis",
      columns: [table.jenisSppt],
      foreignColumns: [jenisSppt.id],
    }),
  ],
);

// ─── status_pbb ───────────────────────────────────────────────────

export const statusPbb = mysqlTable(
  "status_pbb",
  {
    ...nopColumns(),
    tahunPbb: char("TAHUN_PBB", { length: 4 }).notNull(),
    tanggalBayar: datetime("TANGGAL_BAYAR"),
    permohonanPengurangan: double("PERMOHONAN_PENGURANGAN"),
    penguranganDiberi: double("PENGURANGAN_DIBERI"),
    alasanPengurangan: longtext("ALASAN_PENGURANGAN"),
    alasanKeberatan: longtext("ALASAN_KEBERATAN"),
    noSkPengurangan: varchar("NO_SK_PENGURANGAN", { length: 100 }),
    tglSk: date("TGL_SK"),
  },
  (table) => [
    primaryKey({
      name: "pk_status_pbb",
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdBlok,
        table.noUrut,
        table.kdJnsOp,
        table.tahunPbb,
      ],
    }),
    nopForeignKey("fk_status_pbb_spop", table, spop),
  ],
);
