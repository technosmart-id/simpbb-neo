// NOP (Nomor Objek Pajak) — 18-digit property tax identifier
// Format: PP.DD.KKK.LLL.BBB.UUUU.J
// PP = Provinsi (2), DD = Dati2/Kab (2), KKK = Kecamatan (3), LLL = Kelurahan (3)
// BBB = Blok (3), UUUU = No Urut (4), J = Jenis OP (1)

export interface NopParts {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
}

/**
 * Format NOP parts into a standard display string
 * e.g. "35.17.010.001.001-0001.0"
 */
export function formatNop(parts: NopParts): string {
  return `${parts.kdPropinsi}.${parts.kdDati2}.${parts.kdKecamatan}.${parts.kdKelurahan}.${parts.kdBlok}-${parts.noUrut}.${parts.kdJnsOp}`
}

/**
 * Format NOP parts into a raw 18-digit string (no dots)
 * e.g. "351701000100100010"
 */
export function formatNopRaw(parts: NopParts): string {
  return `${parts.kdPropinsi}${parts.kdDati2}${parts.kdKecamatan}${parts.kdKelurahan}${parts.kdBlok}${parts.noUrut}${parts.kdJnsOp}`
}

/**
 * Parse an 18-digit NOP string (with or without dots) into parts
 */
export function parseNop(nop: string): NopParts | null {
  // Remove dots and whitespace
  const clean = nop.replace(/[\.\s\-]/g, "")
  if (clean.length !== 18) return null
  if (!/^\d{18}$/.test(clean)) return null

  return {
    kdPropinsi: clean.slice(0, 2),
    kdDati2: clean.slice(2, 4),
    kdKecamatan: clean.slice(4, 7),
    kdKelurahan: clean.slice(7, 10),
    kdBlok: clean.slice(10, 13),
    noUrut: clean.slice(13, 17),
    kdJnsOp: clean.slice(17, 18),
  }
}

/**
 * Validate an NOP string (18 digits, all numeric)
 */
export function validateNop(nop: string): { valid: boolean; error?: string } {
  const clean = nop.replace(/[\.\s\-]/g, "")
  if (clean.length !== 18) {
    return { valid: false, error: `NOP harus 18 digit, saat ini ${clean.length} digit` }
  }
  if (!/^\d{18}$/.test(clean)) {
    return { valid: false, error: "NOP hanya boleh berisi angka" }
  }
  return { valid: true }
}

/**
 * Build NOP parts from individual field values (used in forms)
 */
export function buildNopParts(
  kdPropinsi: string,
  kdDati2: string,
  kdKecamatan: string,
  kdKelurahan: string,
  kdBlok: string,
  noUrut: string,
  kdJnsOp: string,
): NopParts {
  return {
    kdPropinsi: kdPropinsi.padStart(2, "0"),
    kdDati2: kdDati2.padStart(2, "0"),
    kdKecamatan: kdKecamatan.padStart(3, "0"),
    kdKelurahan: kdKelurahan.padStart(3, "0"),
    kdBlok: kdBlok.padStart(3, "0"),
    noUrut: noUrut.padStart(4, "0"),
    kdJnsOp: kdJnsOp.padStart(1, "0"),
  }
}

/**
 * Extract wilayah prefix from NOP (first 10 digits: prov + dati2 + kec + kel)
 */
export function nopWilayahPrefix(parts: NopParts): string {
  return `${parts.kdPropinsi}${parts.kdDati2}${parts.kdKecamatan}${parts.kdKelurahan}`
}

/**
 * Compare two NOP parts for equality
 */
export function nopEquals(a: NopParts, b: NopParts): boolean {
  return (
    a.kdPropinsi === b.kdPropinsi &&
    a.kdDati2 === b.kdDati2 &&
    a.kdKecamatan === b.kdKecamatan &&
    a.kdKelurahan === b.kdKelurahan &&
    a.kdBlok === b.kdBlok &&
    a.noUrut === b.noUrut &&
    a.kdJnsOp === b.kdJnsOp
  )
}

/**
 * Drizzle where clause helper — returns conditions for NOP columns matching
 */
export function nopWhereValues(parts: NopParts) {
  return {
    kdPropinsi: parts.kdPropinsi,
    kdDati2: parts.kdDati2,
    kdKecamatan: parts.kdKecamatan,
    kdKelurahan: parts.kdKelurahan,
    kdBlok: parts.kdBlok,
    noUrut: parts.noUrut,
    kdJnsOp: parts.kdJnsOp,
  }
}
