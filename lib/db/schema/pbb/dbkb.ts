import {
  bigint,
  char,
  numeric,
  pgTable,
  primaryKey,
  smallint,
} from "drizzle-orm/pg-core";

// dbkb_standard - Standard building cost components
export const dbkbStandard = pgTable(
  "dbkb_standard",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    thnDbkbStandard: char("thn_dbkb_standard", { length: 4 }).notNull(),
    kdJpb: char("kd_jpb", { length: 2 }).notNull(),
    tipeBng: char("tipe_bng", { length: 5 }).notNull(),
    kdBngLantai: char("kd_bng_lantai", { length: 8 }).notNull(),
    nilaiDbkbStandard: numeric("nilai_dbkb_standard", {
      precision: 11,
      scale: 4,
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.thnDbkbStandard,
        table.kdJpb,
        table.tipeBng,
        table.kdBngLantai,
      ],
    }),
  ]
);

// dbkb_material - Material cost components
export const dbkbMaterial = pgTable(
  "dbkb_material",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    thnDbkbMaterial: char("thn_dbkb_material", { length: 4 }).notNull(),
    kdPekerjaan: char("kd_pekerjaan", { length: 2 }).notNull(),
    kdKegiatan: char("kd_kegiatan", { length: 2 }).notNull(),
    nilaiDbkbMaterial: numeric("nilai_dbkb_material", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.thnDbkbMaterial,
        table.kdPekerjaan,
        table.kdKegiatan,
      ],
    }),
  ]
);

// dbkb_mezanin - Mezzanine cost components
export const dbkbMezanin = pgTable(
  "dbkb_mezanin",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    thnDbkbMezanin: char("thn_dbkb_mezanin", { length: 4 }).notNull(),
    nilaiDbkbMezanin: bigint("nilai_dbkb_mezanin", {
      mode: "number",
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.kdPropinsi, table.kdDati2, table.thnDbkbMezanin],
    }),
  ]
);

// dbkb_daya_dukung - Support capacity cost components
export const dbkbDayaDukung = pgTable(
  "dbkb_daya_dukung",
  {
    kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
    kdDati2: char("kd_dati2", { length: 2 }).notNull(),
    thnDbkbDayaDukung: char("thn_dbkb_daya_dukung", { length: 4 }).notNull(),
    typeKonstruksi: char("type_konstruksi", { length: 1 }).notNull(),
    nilaiDbkbDayaDukung: bigint("nilai_dbkb_daya_dukung", {
      mode: "number",
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.kdPropinsi,
        table.kdDati2,
        table.thnDbkbDayaDukung,
        table.typeKonstruksi,
      ],
    }),
  ]
);

// Helper to create dbkb_jpb table schema
const createDbkbJpbTable = (jpbNumber: number) => {
  const tableName = `dbkb_jpb${jpbNumber}`;
  const thnColumn = `thn_dbkb_jpb${jpbNumber}`;
  const klsColumn = `kls_dbkb_jpb${jpbNumber}`;
  const lantaiMinColumn = `lantai_min_jpb${jpbNumber}`;
  const lantaiMaxColumn = `lantai_max_jpb${jpbNumber}`;
  const nilaiColumn = `nilai_dbkb_jpb${jpbNumber}`;

  return pgTable(
    tableName,
    {
      kdPropinsi: char("kd_propinsi", { length: 2 }).notNull(),
      kdDati2: char("kd_dati2", { length: 2 }).notNull(),
      thnDbkbJpb: char(thnColumn, { length: 4 }).notNull(),
      klsDbkbJpb: char(klsColumn, { length: 1 }).notNull(),
      lantaiMinJpb: smallint(lantaiMinColumn).notNull(),
      lantaiMaxJpb: smallint(lantaiMaxColumn).notNull(),
      nilaiDbkbJpb: bigint(nilaiColumn, { mode: "number" }).notNull(),
    },
    (table) => [
      primaryKey({
        columns: [
          table.kdPropinsi,
          table.kdDati2,
          table.thnDbkbJpb,
          table.klsDbkbJpb,
          table.lantaiMinJpb,
          table.lantaiMaxJpb,
        ],
      }),
    ]
  );
};

// dbkb_jpb2 through dbkb_jpb16 - JPB-specific DBKB tables
export const dbkbJpb2 = createDbkbJpbTable(2);
export const dbkbJpb3 = createDbkbJpbTable(3);
export const dbkbJpb4 = createDbkbJpbTable(4);
export const dbkbJpb5 = createDbkbJpbTable(5);
export const dbkbJpb6 = createDbkbJpbTable(6);
export const dbkbJpb7 = createDbkbJpbTable(7);
export const dbkbJpb8 = createDbkbJpbTable(8);
export const dbkbJpb9 = createDbkbJpbTable(9);
export const dbkbJpb12 = createDbkbJpbTable(12);
export const dbkbJpb13 = createDbkbJpbTable(13);
export const dbkbJpb14 = createDbkbJpbTable(14);
export const dbkbJpb15 = createDbkbJpbTable(15);
export const dbkbJpb16 = createDbkbJpbTable(16);

// Export types
export type DbkbStandard = typeof dbkbStandard.$inferSelect;
export type DbkbMaterial = typeof dbkbMaterial.$inferSelect;
export type DbkbMezanin = typeof dbkbMezanin.$inferSelect;
export type DbkbDayaDukung = typeof dbkbDayaDukung.$inferSelect;
