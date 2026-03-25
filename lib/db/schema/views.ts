import { sql } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

/**
 * Typed query helpers for legacy MySQL views.
 * Views are created via custom migration SQL (CREATE OR REPLACE VIEW).
 * These helpers provide typed access to the view data.
 */

// ─── v_nop ────────────────────────────────────────────────────────

export interface VNopRow {
  NOP: string;
  KD_PROPINSI: string;
  KD_DATI2: string;
  KD_KECAMATAN: string;
  KD_KELURAHAN: string;
  KD_BLOK: string;
  NO_URUT: string;
  KD_JNS_OP: string;
  SUBJEK_PAJAK_ID: string;
  JALAN_OP: string;
  LUAS_BUMI: number;
  JNS_BUMI: string;
  NILAI_SISTEM_BUMI: number;
}

export function queryVNop(db: MySql2Database<any>) {
  return db.execute<VNopRow[]>(sql`SELECT * FROM v_nop`);
}

// ─── v_tunggakan ──────────────────────────────────────────────────

export interface VTunggakanRow {
  NOP: string;
  THN_PAJAK_SPPT: number;
  PBB_YG_HARUS_DIBAYAR_SPPT: string;
  SUDAH_DIBAYAR: string;
  SISA_TUNGGAKAN: string;
}

export function queryVTunggakan(db: MySql2Database<any>) {
  return db.execute<VTunggakanRow[]>(sql`SELECT * FROM v_tunggakan`);
}

// ─── v_realisasi_kelurahan ────────────────────────────────────────

export interface VRealisasiKelurahanRow {
  KD_PROPINSI: string;
  KD_DATI2: string;
  KD_KECAMATAN: string;
  KD_KELURAHAN: string;
  THN_PAJAK_SPPT: number;
  JML_OP: number;
  TOTAL_KETETAPAN: string;
  TOTAL_REALISASI: string;
  SISA: string;
}

export function queryVRealisasiKelurahan(db: MySql2Database<any>) {
  return db.execute<VRealisasiKelurahanRow[]>(
    sql`SELECT * FROM v_realisasi_kelurahan`,
  );
}
