import type { NopParts } from '@/lib/utils/nop'

export interface PelayananFormFields {
  noPelayanan: string
  kdJnsPelayanan: string
  tanggalPelayanan: string
  isKolektif: boolean
  nopParts: NopParts | undefined
}

/**
 * Returns true when all required fields are present.
 * Non-kolektif berkas require an NOP; kolektif berkas do not.
 */
export function isPelayananComplete(fields: PelayananFormFields): boolean {
  const baseRequired =
    !!fields.noPelayanan && !!fields.kdJnsPelayanan && !!fields.tanggalPelayanan
  if (!baseRequired) return false
  return fields.isKolektif || !!fields.nopParts
}
