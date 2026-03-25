import {
  mysqlTable,
  char,
  varchar,
  smallint,
  int,
  primaryKey,
  foreignKey,
  index,
} from "drizzle-orm/mysql-core";

// ─── ref_propinsi ─────────────────────────────────────────────────

export const refPropinsi = mysqlTable("ref_propinsi", {
  kdPropinsi: char("KD_PROPINSI", { length: 2 }).primaryKey(),
  nmPropinsi: varchar("NM_PROPINSI", { length: 30 }).notNull(),
});

// ─── ref_dati2 ────────────────────────────────────────────────────

export const refDati2 = mysqlTable(
  "ref_dati2",
  {
    kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
    kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
    nmDati2: varchar("NM_DATI2", { length: 30 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.kdPropinsi, table.kdDati2] }),
    foreignKey({
      name: "fk_dati2_propinsi",
      columns: [table.kdPropinsi],
      foreignColumns: [refPropinsi.kdPropinsi],
    }),
  ],
);

// ─── ref_kecamatan ────────────────────────────────────────────────

export const refKecamatan = mysqlTable(
  "ref_kecamatan",
  {
    kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
    kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
    kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
    nmKecamatan: varchar("NM_KECAMATAN", { length: 30 }),
    nmKecamatanOnly: varchar("NM_KECAMATAN_ONLY", { length: 30 }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan],
    }),
    foreignKey({
      name: "fk_kecamatan_dati2",
      columns: [table.kdPropinsi, table.kdDati2],
      foreignColumns: [refDati2.kdPropinsi, refDati2.kdDati2],
    }),
  ],
);

// ─── ref_kelurahan ────────────────────────────────────────────────
// NOTE: 5-column PK (includes KD_SEKTOR) — does NOT match nopColumns

export const refKelurahan = mysqlTable(
  "ref_kelurahan",
  {
    kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
    kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
    kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
    kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
    kdSektor: char("KD_SEKTOR", { length: 2 }).notNull().default("00"),
    nmKelurahan: varchar("NM_KELURAHAN", { length: 30 }),
    nmKelurahanOnly: varchar("NM_KELURAHAN_ONLY", { length: 30 }).notNull(),
    noKelurahan: smallint("NO_KELURAHAN"),
    kdPosKelurahan: varchar("KD_POS_KELURAHAN", { length: 5 }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.kdKecamatan,
        table.kdKelurahan,
        table.kdSektor,
      ],
    }),
    foreignKey({
      name: "fk_kelurahan_kecamatan",
      columns: [table.kdPropinsi, table.kdDati2, table.kdKecamatan],
      foreignColumns: [
        refKecamatan.kdPropinsi,
        refKecamatan.kdDati2,
        refKecamatan.kdKecamatan,
      ],
    }),
  ],
);

// ─── jalan ────────────────────────────────────────────────────────

export const jalan = mysqlTable(
  "jalan",
  {
    id: int("ID").autoincrement().primaryKey(),
    kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
    kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
    kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
    kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
    nmJalan: varchar("NM_JALAN", { length: 100 }).notNull(),
  },
  (table) => [
    index("idx_jalan_wilayah").on(
      table.kdPropinsi,
      table.kdDati2,
      table.kdKecamatan,
      table.kdKelurahan,
    ),
  ],
);
