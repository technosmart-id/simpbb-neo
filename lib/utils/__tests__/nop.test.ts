import { describe, it, expect } from 'vitest'
import { formatNop, parseNop, validateNop } from '@/lib/utils/nop'

const SAMPLE_PARTS = {
  kdPropinsi: '35',
  kdDati2: '17',
  kdKecamatan: '010',
  kdKelurahan: '001',
  kdBlok: '001',
  noUrut: '0001',
  kdJnsOp: '0',
}

// C1 — formatNop ─────────────────────────────────────────────────────────────
describe('formatNop', () => {
  it('formats parts into PP.DD.KKK.LLL.BBB-UUUU.J', () => {
    expect(formatNop(SAMPLE_PARTS)).toBe('35.17.010.001.001-0001.0')
  })
})

// C2 — parseNop ──────────────────────────────────────────────────────────────
describe('parseNop', () => {
  it('extracts all 7 parts from a formatted NOP string', () => {
    const formatted = formatNop(SAMPLE_PARTS)   // already tested in C1
    expect(parseNop(formatted)).toEqual(SAMPLE_PARTS)
  })

  it('returns null for a string shorter than 18 digits', () => {
    expect(parseNop('3517010')).toBeNull()
  })

  it('returns null for a string with non-digit characters (after stripping separators)', () => {
    expect(parseNop('35.17.010.001.00X-0001.0')).toBeNull()
  })
})

// C3 — validateNop ───────────────────────────────────────────────────────────
describe('validateNop', () => {
  it('accepts an 18-digit numeric string', () => {
    const { valid } = validateNop('351701000100100010')
    expect(valid).toBe(true)
  })

  it('rejects a string with fewer than 18 digits', () => {
    const { valid, error } = validateNop('12345')
    expect(valid).toBe(false)
    expect(error).toMatch(/18 digit/)
  })

  it('rejects a string containing non-digit characters', () => {
    const { valid } = validateNop('ABCDEFGHIJKLMNOPQR')
    expect(valid).toBe(false)
  })
})
