import { char, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

// dat_subjek_pajak - Taxpayer data
export const datSubjekPajak = pgTable("dat_subjek_pajak", {
  subjekPajakId: char("subjek_pajak_id", { length: 30 }).primaryKey(),
  nmWp: varchar("nm_wp", { length: 30 }).notNull().default("PEMILIK"),
  jalanWp: varchar("jalan_wp", { length: 30 }).notNull(),
  blokKavNoWp: varchar("blok_kav_no_wp", { length: 15 }),
  rwWp: char("rw_wp", { length: 2 }),
  rtWp: char("rt_wp", { length: 3 }),
  kelurahanWp: varchar("kelurahan_wp", { length: 30 }),
  kotaWp: varchar("kota_wp", { length: 30 }),
  kdPosWp: varchar("kd_pos_wp", { length: 5 }),
  telpWp: varchar("telp_wp", { length: 20 }),
  npwp: varchar("npwp", { length: 16 }),
  statusPekerjaanWp: char("status_pekerjaan_wp", { length: 1 })
    .notNull()
    .default("0"),
  // Extra fields from legacy database stored as JSONB
  metadata: jsonb("metadata"),
});

// Export types
export type DatSubjekPajak = typeof datSubjekPajak.$inferSelect;
export type NewDatSubjekPajak = typeof datSubjekPajak.$inferInsert;
