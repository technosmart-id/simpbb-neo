'use client'

/**
 * DHKP (Daftar Himpunan Ketetapan Pajak) PDF Generator
 * Generates the official DHKP book for a given area and year.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatNop, type NopParts } from '@/lib/utils/nop'

export interface DhkpRow {
  // NOP parts
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
  // WP
  nmWp: string | null
  // Fisik
  luasBumi: string | null
  luasBng: string | null
  // Nilai
  njopBumi: string | null
  njopBng: string | null
  njopSppt: string | null
  njoptkpSppt: string | null
  njkpSppt: string | null
  pbbTerhutangSppt: string | null
  pbbYgHarusDibayarSppt: string
  faktorPengurangSppt: string | null
  // Status
  statusPembayaranSppt: string
}

export interface DhkpOptions {
  rows: DhkpRow[]
  thnPajak: number
  namaWilayah?: string
  nmInstansi?: string
  nmDati2?: string
}

function fmtRp(val: string | number | null | undefined): string {
  return new Intl.NumberFormat('id-ID').format(Number(val ?? 0))
}

export async function generateDhkpPdf(opts: DhkpOptions): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 8

  const nmInstansi = opts.nmInstansi ?? 'BADAN PENDAPATAN DAERAH'
  const nmDati2 = opts.nmDati2 ?? ''
  const tahun = opts.thnPajak
  const namaWilayah = opts.namaWilayah ?? 'SELURUH WILAYAH'
  const tglCetak = new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })

  let y = margin

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(`PEMERINTAH ${nmDati2.toUpperCase()}`, pageW / 2, y, { align: 'center' })
  y += 4.5
  doc.text(nmInstansi.toUpperCase(), pageW / 2, y, { align: 'center' })
  y += 5
  doc.setFontSize(12)
  doc.text('DAFTAR HIMPUNAN KETETAPAN PAJAK (DHKP)', pageW / 2, y, { align: 'center' })
  y += 4.5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`PAJAK BUMI DAN BANGUNAN PERDESAAN DAN PERKOTAAN TAHUN ${tahun}`, pageW / 2, y, { align: 'center' })
  y += 3.5
  doc.text(`Wilayah: ${namaWilayah}  |  Dicetak: ${tglCetak}  |  Jumlah OP: ${opts.rows.length}`, pageW / 2, y, { align: 'center' })
  y += 2

  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 1
  doc.setLineWidth(0.2)
  doc.line(margin, y, pageW - margin, y)
  y += 3

  // Totals
  const totalNjop = opts.rows.reduce((s, r) => s + Number(r.njopSppt ?? 0), 0)
  const totalPbb = opts.rows.reduce((s, r) => s + Number(r.pbbYgHarusDibayarSppt), 0)
  const totalLunas = opts.rows.filter((r) => r.statusPembayaranSppt === 'L' || r.statusPembayaranSppt === '1').length

  // Table
  const tableRows = opts.rows.map((r, idx) => {
    const nopParts: NopParts = {
      kdPropinsi: r.kdPropinsi, kdDati2: r.kdDati2, kdKecamatan: r.kdKecamatan,
      kdKelurahan: r.kdKelurahan, kdBlok: r.kdBlok, noUrut: r.noUrut, kdJnsOp: r.kdJnsOp,
    }
    const status = r.statusPembayaranSppt === 'L' || r.statusPembayaranSppt === '1' ? 'L' : 'B'
    return [
      String(idx + 1),
      formatNop(nopParts),
      r.nmWp ?? '-',
      fmtRp(r.luasBumi),
      fmtRp(r.luasBng),
      fmtRp(r.njopSppt),
      fmtRp(r.njoptkpSppt),
      fmtRp(r.njkpSppt),
      fmtRp(r.pbbYgHarusDibayarSppt),
      status,
    ]
  })

  // Summary row - use unknown[] to satisfy jspdf-autotable's loose typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(tableRows as any[]).push([
    { content: `JUMLAH (${opts.rows.length} OP)`, colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: fmtRp(totalNjop), styles: { fontStyle: 'bold' } },
    '',
    '',
    { content: fmtRp(totalPbb), styles: { fontStyle: 'bold', fillColor: [220, 252, 231] } },
    { content: `L: ${totalLunas} / B: ${opts.rows.length - totalLunas}`, styles: { fontStyle: 'bold', halign: 'center' } },
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7,
      cellPadding: 1.2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      overflow: 'ellipsize',
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left', cellWidth: 38, font: 'courier' },
      2: { halign: 'left', cellWidth: 36 },
      3: { halign: 'right', cellWidth: 16 },
      4: { halign: 'right', cellWidth: 16 },
      5: { halign: 'right', cellWidth: 28 },
      6: { halign: 'right', cellWidth: 20 },
      7: { halign: 'right', cellWidth: 22 },
      8: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
      9: { halign: 'center', cellWidth: 8 },
    },
    head: [[
      'No',
      'NOP',
      'Nama WP',
      'L.Bumi\n(m²)',
      'L.Bng\n(m²)',
      'NJOP (Rp)',
      'NJOPTKP\n(Rp)',
      'NJKP (Rp)',
      'PBB (Rp)',
      'Sts',
    ]],
    body: tableRows,
    didDrawPage: (data) => {
      // Page number footer
      const pageCount = doc.getNumberOfPages()
      const curPage = data.pageNumber
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Halaman ${curPage} dari ${pageCount}`,
        pageW - margin,
        doc.internal.pageSize.getHeight() - 4,
        { align: 'right' },
      )
      doc.setTextColor(0, 0, 0)
    },
  })

  return doc
}

export async function downloadDhkpPdf(opts: DhkpOptions): Promise<void> {
  const doc = await generateDhkpPdf(opts)
  doc.save(`DHKP_${opts.thnPajak}_${(opts.namaWilayah ?? 'semua').replace(/\s+/g, '_')}.pdf`)
}
