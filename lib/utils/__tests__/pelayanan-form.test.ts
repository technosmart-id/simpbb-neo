import { describe, it, expect } from 'vitest'
import { isPelayananComplete } from '@/lib/utils/pelayanan-form'

const BASE_FIELDS = {
  noPelayanan: 'BRK-2025-001',
  kdJnsPelayanan: '01',
  tanggalPelayanan: '2025-05-17',
}

const NOP = {
  kdPropinsi: '35',
  kdDati2: '17',
  kdKecamatan: '010',
  kdKelurahan: '001',
  kdBlok: '001',
  noUrut: '0001',
  kdJnsOp: '0',
}

// B1 ─────────────────────────────────────────────────────────────────────────
describe('isPelayananComplete', () => {
  it('returns false when non-kolektif and no NOP is selected', () => {
    expect(
      isPelayananComplete({ ...BASE_FIELDS, isKolektif: false, nopParts: undefined }),
    ).toBe(false)
  })

  // B2 ─────────────────────────────────────────────────────────────────────────
  it('returns true when non-kolektif and NOP is provided', () => {
    expect(
      isPelayananComplete({ ...BASE_FIELDS, isKolektif: false, nopParts: NOP }),
    ).toBe(true)
  })

  // B3 ─────────────────────────────────────────────────────────────────────────
  it('returns true when kolektif even without an NOP', () => {
    expect(
      isPelayananComplete({ ...BASE_FIELDS, isKolektif: true, nopParts: undefined }),
    ).toBe(true)
  })

  it('returns false when any base required field is missing', () => {
    expect(
      isPelayananComplete({ ...BASE_FIELDS, noPelayanan: '', isKolektif: true, nopParts: undefined }),
    ).toBe(false)

    expect(
      isPelayananComplete({ ...BASE_FIELDS, kdJnsPelayanan: '', isKolektif: false, nopParts: NOP }),
    ).toBe(false)

    expect(
      isPelayananComplete({ ...BASE_FIELDS, tanggalPelayanan: '', isKolektif: false, nopParts: NOP }),
    ).toBe(false)
  })
})
