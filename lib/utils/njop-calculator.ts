/**
 * NJOP Calculator — Pure calculation functions for PBB tax computation.
 *
 * Implements business rules BR-01 through BR-08 from REQUIREMENTS.md.
 * All functions are pure (no DB access). The caller is responsible for
 * fetching configuration values from the database before invoking these.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Input for the main PBB calculation pipeline (BR-01 → BR-07). */
export interface NjopCalculationInput {
  /** Total land NJOP (luas × NJOP per m²) */
  njopBumi: number
  /** Total building NJOP (sum of all active buildings) */
  njopBng: number
  /** NJOPTKP value from konfigurasi table for the current year */
  njoptkp: number
  /** Whether at least one active bangunan exists on this OP */
  hasBangunan: boolean
  /** Tax rate as a decimal, e.g. 0.001 for 0.1% */
  tarifPersen: number
  /** Reduction percentage (0–100) from status_pbb.PENGURANGAN_DIBERI */
  penguranganPersen: number
  /** Minimum PBB amount from konfigurasi ('PBB_MINIMUM') */
  pbbMinimum: number
}

/** Output of the main PBB calculation pipeline. */
export interface NjopCalculationResult {
  /** NJOP Bumi (pass-through for convenience) */
  njopBumi: number
  /** NJOP Bangunan (pass-through for convenience) */
  njopBng: number
  /** BR-01: NJOP total = NJOP_Bumi + NJOP_Bng */
  njopSppt: number
  /** BR-02: NJOPTKP actually applied (0 when no bangunan) */
  njoptkpApplied: number
  /** BR-03: NJKP = NJOP − NJOPTKP, minimum 0 */
  njkp: number
  /** BR-05: PBB_Terhutang = tarif × NJKP */
  pbbTerhutang: number
  /** BR-06: Reduction amount = PBB × (penguranganPersen / 100) */
  faktorPengurang: number
  /** Final amount payable after reduction and minimum floor */
  pbbYgHarusDibayar: number
}

/** A single row from the tarif table used by `findTarif`. */
export interface TarifRange {
  njopMin: number
  njopMax: number
  /** Tarif as a decimal, e.g. 0.001 */
  nilaiTarif: number
}

/** A single building record used by `calculateNjopBangunan`. */
export interface BuildingInput {
  /** Luas bangunan (m²) */
  luasBng: number
  /** Nilai sistem bangunan per m² (already in rupiah) */
  nilaiSistemBng: number
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Calculate total NJOP Bumi (land).
 *
 * @param luasBumi  - Land area in m²
 * @param njopPerM2 - NJOP per m² in rupiah (already converted from ribuan)
 * @returns Total NJOP Bumi in rupiah
 */
export function calculateNjopBumi(luasBumi: number, njopPerM2: number): number {
  return Math.round(luasBumi * njopPerM2)
}

/**
 * Calculate total NJOP Bangunan from all active buildings.
 *
 * Each building's NJOP = luasBng × nilaiSistemBng.
 * The total is the sum across all buildings.
 *
 * @param buildings - Array of active building records
 * @returns Total NJOP Bangunan in rupiah
 */
export function calculateNjopBangunan(buildings: BuildingInput[]): number {
  return buildings.reduce((sum, b) => sum + Math.round(b.luasBng * b.nilaiSistemBng), 0)
}

/**
 * Find the applicable tarif from a sorted list of tarif ranges based on NJOP.
 *
 * BR-04 (conditional tarif path): looks up the tarif whose NJOP range
 * contains the given value. Returns 0 if no matching range is found.
 *
 * @param njop      - The NJOP value to match against
 * @param tarifList - Tarif ranges (from the tarif table, for the active period)
 * @returns The matching tarif as a decimal, or 0 if none found
 */
export function findTarif(
  njop: number,
  tarifList: TarifRange[],
): number {
  const match = tarifList.find((t) => njop >= t.njopMin && njop <= t.njopMax)
  return match?.nilaiTarif ?? 0
}

// ---------------------------------------------------------------------------
// Main calculation pipeline
// ---------------------------------------------------------------------------

/**
 * Run the full PBB calculation pipeline (BR-01 → BR-07).
 *
 * **BR-01** NJOP = NJOP_Bumi + NJOP_Bng
 * **BR-02** NJOPTKP applied only when bangunan exists (hasBangunan = true)
 * **BR-03** NJKP = NJOP − NJOPTKP (min 0)
 * **BR-04** Tarif is resolved by the caller and passed in as `tarifPersen`
 * **BR-05** PBB_Terhutang = tarif × NJKP
 * **BR-06** Pengurangan = PBB × (penguranganPersen / 100)
 * **BR-07** PBB minimum floor from konfigurasi
 *
 * BR-08 (siklus increment) is handled by the persistence layer, not here.
 *
 * @param input - All pre-fetched values needed for the calculation
 * @returns Detailed calculation breakdown
 */
export function calculatePbb(input: NjopCalculationInput): NjopCalculationResult {
  const {
    njopBumi,
    njopBng,
    njoptkp,
    hasBangunan,
    tarifPersen,
    penguranganPersen,
    pbbMinimum,
  } = input

  // BR-01: NJOP total
  const njopSppt = njopBumi + njopBng

  // BR-02: NJOPTKP only applies when there is at least one active building
  const njoptkpApplied = hasBangunan ? njoptkp : 0

  // BR-03: NJKP (floor at 0)
  const njkp = Math.max(njopSppt - njoptkpApplied, 0)

  // BR-05: PBB Terhutang (tarif already resolved by caller per BR-04)
  const pbbTerhutang = Math.round(tarifPersen * njkp)

  // BR-06: Pengurangan
  const faktorPengurang = Math.round(pbbTerhutang * (penguranganPersen / 100))
  let pbbYgHarusDibayar = pbbTerhutang - faktorPengurang

  // BR-07: Minimum floor — only enforce when there is a taxable amount
  if (pbbYgHarusDibayar > 0 && pbbYgHarusDibayar < pbbMinimum) {
    pbbYgHarusDibayar = pbbMinimum
  }

  return {
    njopBumi,
    njopBng,
    njopSppt,
    njoptkpApplied,
    njkp,
    pbbTerhutang,
    faktorPengurang,
    pbbYgHarusDibayar,
  }
}
