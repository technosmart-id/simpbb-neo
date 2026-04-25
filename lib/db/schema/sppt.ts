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
  bigint,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { nopColumns, nopPrimaryKey, nopForeignKey, longtext } from "./_columns";
import { spop } from "./objek-pajak";
import { jenisSppt } from "./klasifikasi";

// ─── sppt ─────────────────────────────────────────────────────────

export const sppt = mysqlTable(
  "sppt",
  {
    kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
    kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
    kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
    kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
    kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
    noUrut: char("NO_URUT", { length: 4 }).notNull(),
    kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
    thnPajakSppt: varchar("THN_PAJAK_SPPT", { length: 4 }).notNull().$type<number>(),

    // Metadata
    siklusSppt: tinyint("SIKLUS_SPPT").default(1),
    kdKanwilBank: varchar("KD_KANWIL_BANK", { length: 2 }),
    kdKppbbBank: varchar("KD_KPPBB_BANK", { length: 2 }),
    kdBankTunggal: varchar("KD_BANK_TUNGGAL", { length: 2 }),
    kdBankPersepsi: varchar("KD_BANK_PERSEPSI", { length: 2 }),
    kdTp: varchar("KD_TP", { length: 2 }),

    // Data WP (snapshot)
    nmWp: varchar("NM_WP_SPPT", { length: 30 }),
    jalanWp: varchar("JLN_WP_SPPT", { length: 30 }),
    blokKavNoWpSppt: varchar("BLOK_KAV_NO_WP_SPPT", { length: 15 }),
    rwWpSppt: varchar("RW_WP_SPPT", { length: 2 }),
    rtWpSppt: varchar("RT_WP_SPPT", { length: 3 }),
    kelurahanWpSppt: varchar("KELURAHAN_WP_SPPT", { length: 30 }),
    kotaWpSppt: varchar("KOTA_WP_SPPT", { length: 30 }),
    kdPosWpSppt: varchar("KD_POS_WP_SPPT", { length: 5 }),
    npwpSppt: varchar("NPWP_SPPT", { length: 15 }),
    noPersilSppt: varchar("NO_PERSIL_SPPT", { length: 5 }),

    // Kelas
    kdKlsTanah: varchar("KD_KLS_TANAH", { length: 3 }),
    thnAwalKlsTanah: year("THN_AWAL_KLS_TANAH").default(2000),
    kdKlsBng: varchar("KD_KLS_BNG", { length: 3 }),
    thnAwalKlsBng: year("THN_AWAL_KLS_BNG").default(2000),

    // Tanggal
    tglJatuhTempo: date("TGL_JATUH_TEMPO_SPPT"),
    tglTerbitSppt: datetime("TGL_TERBIT_SPPT"),
    tglCetakSppt: datetime("TGL_CETAK_SPPT"),

    // Data Fisik (snapshot)
    luasBumi: bigint("LUAS_BUMI_SPPT", { mode: "number" }).notNull().default(0),
    luasBng: bigint("LUAS_BNG_SPPT", { mode: "number" }).notNull().default(0),

    // Nilai NJOP
    njopBumi: bigint("NJOP_BUMI_SPPT", { mode: "number" }).notNull().default(0),
    njopBng: bigint("NJOP_BNG_SPPT", { mode: "number" }).notNull().default(0),
    njopSppt: bigint("NJOP_SPPT", { mode: "number" }).notNull().default(0),

    // Kalkulasi Pajak
    njoptkpSppt: int("NJOPTKP_SPPT").notNull().default(0),
    njkpSppt: bigint("NJKP_SPPT", { mode: "number" }).notNull().default(0),
    pbbTerhutangSppt: bigint("PBB_TERHUTANG_SPPT", { mode: "number" }).notNull().default(0),
    faktorPengurangSppt: bigint("FAKTOR_PENGURANG_SPPT", { mode: "number" }).notNull().default(0),
    pbbYgHarusDibayarSppt: bigint("PBB_YG_HARUS_DIBAYAR_SPPT", { mode: "number" }).notNull().default(0),

    // Status
    statusPembayaranSppt: tinyint("STATUS_PEMBAYARAN_SPPT").default(0),
    statusTagihanSppt: tinyint("STATUS_TAGIHAN_SPPT").default(0),
    statusCetakSppt: tinyint("STATUS_CETAK_SPPT").default(0),
    
    nipPencetakSppt: varchar("NIP_PENCETAK_SPPT", { length: 20 }),
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
    index("idx_sppt_thn").on(table.thnPajakSppt),
    index("idx_sppt_status_bayar").on(table.statusPembayaranSppt),
  ],
);

// ─── histori_sppt ─────────────────────────────────────────────────

export const historiSppt = mysqlTable(
  "histori_sppt",
  {
    id: int("ID").autoincrement().primaryKey(),
    ...nopColumns(),
    thnPajakSppt: varchar("THN_PAJAK_SPPT", { length: 4 }).notNull().$type<number>(),
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
