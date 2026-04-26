import {
  char,
  customType,
  primaryKey,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { and, eq } from "drizzle-orm";
import type { AnyMySqlColumn } from "drizzle-orm/mysql-core";

// ─── NOP Column Factory ───────────────────────────────────────────
// The 7-column NOP pattern repeats across 15+ tables.
// MUST be a function (not a const) — Drizzle mutates column objects.

export function nopColumns() {
  return {
    kdPropinsi: char("KD_PROPINSI", { length: 2 }).notNull(),
    kdDati2: char("KD_DATI2", { length: 2 }).notNull(),
    kdKecamatan: char("KD_KECAMATAN", { length: 3 }).notNull(),
    kdKelurahan: char("KD_KELURAHAN", { length: 3 }).notNull(),
    kdBlok: char("KD_BLOK", { length: 3 }).notNull(),
    noUrut: char("NO_URUT", { length: 4 }).notNull(),
    kdJnsOp: char("KD_JNS_OP", { length: 1 }).notNull(),
  };
}

export function nopColumnsNullable() {
  return {
    kdPropinsi: char("KD_PROPINSI", { length: 2 }),
    kdDati2: char("KD_DATI2", { length: 2 }),
    kdKecamatan: char("KD_KECAMATAN", { length: 3 }),
    kdKelurahan: char("KD_KELURAHAN", { length: 3 }),
    kdBlok: char("KD_BLOK", { length: 3 }),
    noUrut: char("NO_URUT", { length: 4 }),
    kdJnsOp: char("KD_JNS_OP", { length: 1 }),
  };
}

export function nopColumnsSuffixed(suffix: string) {
  return {
    [`kdPropinsi${suffix}`]: char(`KD_PROPINSI_${suffix.toUpperCase()}`, { length: 2 }),
    [`kdDati2${suffix}`]: char(`KD_DATI2_${suffix.toUpperCase()}`, { length: 2 }),
    [`kdKecamatan${suffix}`]: char(`KD_KECAMATAN_${suffix.toUpperCase()}`, { length: 3 }),
    [`kdKelurahan${suffix}`]: char(`KD_KELURAHAN_${suffix.toUpperCase()}`, { length: 3 }),
    [`kdBlok${suffix}`]: char(`KD_BLOK_${suffix.toUpperCase()}`, { length: 3 }),
    [`noUrut${suffix}`]: char(`NO_URUT_${suffix.toUpperCase()}`, { length: 4 }),
    [`kdJnsOp${suffix}`]: char(`KD_JNS_OP_${suffix.toUpperCase()}`, { length: 1 }),
  };
}

// Type for objects that have NOP columns (table refs or callback column objects)
type NopColumnsRecord = Record<string, any> & {
  kdPropinsi: AnyMySqlColumn;
  kdDati2: AnyMySqlColumn;
  kdKecamatan: AnyMySqlColumn;
  kdKelurahan: AnyMySqlColumn;
  kdBlok: AnyMySqlColumn;
  noUrut: AnyMySqlColumn;
  kdJnsOp: AnyMySqlColumn;
};

// ─── NOP Primary Key Helper ───────────────────────────────────────

export function nopPrimaryKey(name: string, table: NopColumnsRecord) {
  return primaryKey({
    name,
    columns: [
      table.kdPropinsi,
      table.kdDati2,
      table.kdKecamatan,
      table.kdKelurahan,
      table.kdBlok,
      table.noUrut,
      table.kdJnsOp,
    ],
  });
}

// ─── NOP Foreign Key Helper ───────────────────────────────────────

export function nopForeignKey(
  name: string,
  table: NopColumnsRecord,
  targetTable: NopColumnsRecord,
) {
  return foreignKey({
    name,
    columns: [
      table.kdPropinsi,
      table.kdDati2,
      table.kdKecamatan,
      table.kdKelurahan,
      table.kdBlok,
      table.noUrut,
      table.kdJnsOp,
    ],
    foreignColumns: [
      targetTable.kdPropinsi,
      targetTable.kdDati2,
      targetTable.kdKecamatan,
      targetTable.kdKelurahan,
      targetTable.kdBlok,
      targetTable.noUrut,
      targetTable.kdJnsOp,
    ],
  });
}

// ─── LONGBLOB Custom Type ─────────────────────────────────────────

export const longblob = customType<{ data: Buffer }>({
  dataType() {
    return "LONGBLOB";
  },
});

// ─── LONGTEXT Custom Type ─────────────────────────────────────────

export const longtext = customType<{ data: string }>({
  dataType() {
    return "LONGTEXT";
  },
});

// ─── NOP Where Condition Helper ───────────────────────────────────

export function nopWhere(table: any, parts: any) {
  return and(
    eq(table.kdPropinsi, parts.kdPropinsi),
    eq(table.kdDati2, parts.kdDati2),
    eq(table.kdKecamatan, parts.kdKecamatan),
    eq(table.kdKelurahan, parts.kdKelurahan),
    eq(table.kdBlok, parts.kdBlok),
    eq(table.noUrut, parts.noUrut),
    eq(table.kdJnsOp, parts.kdJnsOp)
  );
}
