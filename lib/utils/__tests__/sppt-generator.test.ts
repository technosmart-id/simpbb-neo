import { describe, it, expect } from 'vitest'
import {
  NOP_CELL_W,
  NOP_CELL_COUNT,
  NOP_SEP_W,
  NOP_SEP_COUNT,
  buildSpptQrContent,
} from '@/lib/utils/pdf/sppt-generator'

const A4_WIDTH_MM = 210
const MARGIN_MM = 10
const QR_CODE_W_MM = 22
// Usable space for NOP row = page width - left margin - right QR area - gap
const NOP_AVAILABLE_MM = A4_WIDTH_MM - MARGIN_MM - QR_CODE_W_MM - MARGIN_MM - 5

// A1 — NOP geometry ──────────────────────────────────────────────────────────
describe('NOP cell geometry', () => {
  it('total NOP row width fits within the space available left of the QR code', () => {
    const totalWidth = NOP_CELL_COUNT * NOP_CELL_W + NOP_SEP_COUNT * NOP_SEP_W
    expect(totalWidth).toBeLessThanOrEqual(NOP_AVAILABLE_MM)
  })

  it('uses the correct digit count (18) and separator count (6)', () => {
    expect(NOP_CELL_COUNT).toBe(18)
    expect(NOP_SEP_COUNT).toBe(6)
  })
})

// A2 — QR content: verification URL ─────────────────────────────────────────
describe('buildSpptQrContent', () => {
  const NOP = '35.17.010.001.001-0001.0'
  const THN = 2025
  const PBB = 500000

  it('returns a verification URL when verifikasiBaseUrl is provided', () => {
    const result = buildSpptQrContent(NOP, THN, PBB, 'https://pbb.example.go.id')
    expect(result).toBe(
      `https://pbb.example.go.id/verifikasi-sppt?nop=${encodeURIComponent(NOP)}&thn=2025`,
    )
  })

  // A3 — QR content: plain-text fallback ──────────────────────────────────────
  it('falls back to plain-text payload when no base URL is given', () => {
    const result = buildSpptQrContent(NOP, THN, PBB)
    expect(result).toBe(`NOP:${NOP}|THN:${THN}|PBB:${PBB}`)
  })

  it('plain-text fallback contains all three key fields', () => {
    const result = buildSpptQrContent(NOP, THN, PBB)
    expect(result).toContain(`NOP:${NOP}`)
    expect(result).toContain(`THN:${THN}`)
    expect(result).toContain(`PBB:${PBB}`)
  })
})
