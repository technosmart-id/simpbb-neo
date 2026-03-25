'use client'

/**
 * SPPT PDF Generator
 * Generates Surat Pemberitahuan Pajak Terhutang using jspdf.
 * Designed to match the standard Indonesian PBB SPPT format.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatNop, type NopParts } from '@/lib/utils/nop'

export interface SpptData {
  // NOP
  nopParts: NopParts
  thnPajakSppt: number

  // Wajib Pajak
  nmWp: string
  jlnWp: string
  blokKavNoWp: string
  rtwWp: string
  kelurahanWp: string
  kotaWp: string
  kdPos: string

  // Objek Pajak
  jlnOp: string
  blokKavNoOp: string
  kelurahanOp: string
  kecamatanOp: string

  // NJOP
  luasBumi: number
  njopBumi: number // per m²
  njopTotalBumi: number
  luasBng: number
  njopBng: number // per m²
  njopTotalBng: number
  njopTotal: number
  njoptkp: number
  njkp: number
  pbbTerutang: number
  pengurangan: number
  pbbYgHarusDibayar: number

  // Tanggal
  tglJatuhTempo: string // YYYY-MM-DD
  tglCetak?: string

  // Instansi
  nmInstansi?: string
  nmDati2?: string
  tahunAnggaran?: number
}

function formatRp(val: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(val))
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { dateStyle: 'long' })
  } catch {
    return dateStr
  }
}

export async function generateSpptPdf(data: SpptData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 10
  const col2 = pageW / 2

  // Generate QR Code via Google Charts API (no extra dependency)
  const nopStr = formatNop(data.nopParts)
  const qrContent = `NOP:${nopStr}|THN:${data.thnPajakSppt}|PBB:${data.pbbYgHarusDibayar}`
  let qrDataUrl: string | null = null
  try {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrContent)}`
    const resp = await fetch(qrApiUrl)
    if (resp.ok) {
      const blob = await resp.blob()
      qrDataUrl = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result as string)
        reader.onerror = rej
        reader.readAsDataURL(blob)
      })
    }
  } catch {
    // QR optional — works offline without
  }

  const nmInstansi = data.nmInstansi ?? 'BADAN PENDAPATAN DAERAH'
  const nmDati2 = data.nmDati2 ?? ''
  const tahun = data.thnPajakSppt
  const tglCetak = data.tglCetak ?? new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })

  // ── HEADER ──────────────────────────────────────────────────────────
  let y = margin

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(`PEMERINTAH ${nmDati2.toUpperCase()}`, pageW / 2, y, { align: 'center' })
  y += 4
  doc.setFontSize(10)
  doc.text(nmInstansi.toUpperCase(), pageW / 2, y, { align: 'center' })
  y += 5

  doc.setFontSize(11)
  doc.text('SURAT PEMBERITAHUAN PAJAK TERHUTANG (SPPT)', pageW / 2, y, { align: 'center' })
  y += 4
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`PAJAK BUMI DAN BANGUNAN PERDESAAN DAN PERKOTAAN TAHUN ${tahun}`, pageW / 2, y, { align: 'center' })
  y += 2

  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 1
  doc.setLineWidth(0.2)
  doc.line(margin, y, pageW - margin, y)
  y += 4

  // ── NOP BOX ─────────────────────────────────────────────────────────
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('NOMOR OBJEK PAJAK (NOP)', margin, y)
  y += 4

  // Draw NOP cells — format: PP.DD.KKK.LLL.BBB.UUUU.J
  const nopFormatted = nopStr // "PP.DD.KKK.LLL.BBB.UUUU.J"
  const nopGroups = [
    nopFormatted.slice(0, 2),
    nopFormatted.slice(3, 5),
    nopFormatted.slice(6, 9),
    nopFormatted.slice(10, 13),
    nopFormatted.slice(14, 17),
    nopFormatted.slice(18, 22),
    nopFormatted.slice(23, 24),
  ]
  const cellW = 10
  const cellH = 7
  let cx = margin
  doc.setFont('helvetica', 'normal')
  nopGroups.forEach((grp, i) => {
    for (let ci = 0; ci < grp.length; ci++) {
      doc.rect(cx, y, cellW, cellH)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(grp[ci], cx + cellW / 2, y + cellH * 0.65, { align: 'center' })
      cx += cellW
    }
    if (i < nopGroups.length - 1) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('.', cx + 1, y + cellH * 0.65)
      cx += 4
    }
  })

  // QR Code (top right)
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', pageW - margin - 22, margin, 22, 22)
  }

  y += cellH + 5

  // ── TWO-COLUMN LAYOUT: WP & OP ───────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  const colW = (pageW - margin * 2 - 4) / 2
  const leftX = margin
  const rightX = margin + colW + 4
  const labelColor: [number, number, number] = [100, 100, 100]

  function rowPair(label: string, left: string, labelRight: string, right: string, yPos: number): number {
    doc.setTextColor(...labelColor)
    doc.text(label, leftX, yPos)
    doc.text(labelRight, rightX, yPos)
    doc.setTextColor(0, 0, 0)
    yPos += 3.5
    doc.setFont('helvetica', 'bold')
    doc.text(left, leftX, yPos, { maxWidth: colW })
    doc.text(right, rightX, yPos, { maxWidth: colW })
    doc.setFont('helvetica', 'normal')
    return yPos + 4.5
  }

  // Section labels
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('DATA WAJIB PAJAK', leftX, y)
  doc.text('DATA OBJEK PAJAK', rightX, y)
  y += 4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  y = rowPair('Nama', data.nmWp || '-', 'Jalan / Lokasi', data.jlnOp || '-', y)
  y = rowPair('Alamat', `${data.jlnWp} ${data.blokKavNoWp}`.trim() || '-', 'Blok/Kav', data.blokKavNoOp || '-', y)
  y = rowPair('RT/RW', data.rtwWp || '-', 'Kelurahan', data.kelurahanOp || '-', y)
  y = rowPair('Kel/Kota', `${data.kelurahanWp}, ${data.kotaWp}`.trim() || '-', 'Kecamatan', data.kecamatanOp || '-', y)
  y += 2

  // ── NJOP TABLE ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('RINCIAN NILAI JUAL OBJEK PAJAK (NJOP)', leftX, y)
  y += 2

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 1.5, lineColor: [180, 180, 180], lineWidth: 0.1 },
    headStyles: { fillColor: [230, 230, 230], textColor: [30, 30, 30], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'left', cellWidth: 40 },
      1: { halign: 'right', cellWidth: 28 },
      2: { halign: 'right', cellWidth: 28 },
      3: { halign: 'right', cellWidth: 40 },
    },
    head: [['Uraian', 'Luas (m²)', 'NJOP/m² (Rp)', 'NJOP (Rp)']],
    body: [
      ['Bumi', formatRp(data.luasBumi), formatRp(data.njopBumi), formatRp(data.njopTotalBumi)],
      ['Bangunan', formatRp(data.luasBng), formatRp(data.njopBng), formatRp(data.njopTotalBng)],
      [{ content: 'NJOP sebagai Dasar Pengenaan PBB', colSpan: 3, styles: { fontStyle: 'bold' } }, formatRp(data.njopTotal)],
      [{ content: `NJOPTKP (Nilai Jual Objek Pajak Tidak Kena Pajak)`, colSpan: 3 }, `(${formatRp(data.njoptkp)})`],
      [{ content: 'NJKP (Nilai Jual Kena Pajak)', colSpan: 3, styles: { fontStyle: 'bold' } }, formatRp(data.njkp)],
      [{ content: 'PBB yang Terhutang', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: `Rp ${formatRp(data.pbbTerutang)}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
      ...(data.pengurangan > 0 ? [
        [{ content: 'Pengurangan', colSpan: 3 }, `(${formatRp(data.pengurangan)})`],
      ] : []),
    ],
    didDrawPage: () => {},
  })

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? y + 40
  y = finalY + 4

  // ── TOTAL BAYAR BOX ──────────────────────────────────────────────────
  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.rect(margin, y, pageW - margin * 2, 12)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('PBB YANG HARUS DIBAYAR', margin + 3, y + 4.5)
  doc.setFontSize(13)
  doc.text(`Rp ${formatRp(data.pbbYgHarusDibayar)}`, pageW - margin - 3, y + 8, { align: 'right' })
  y += 14

  // Jatuh tempo
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(180, 0, 0)
  doc.text(`BATAS WAKTU PEMBAYARAN: ${formatDate(data.tglJatuhTempo)}`, margin, y)
  doc.setTextColor(0, 0, 0)
  y += 5

  doc.setFontSize(7.5)
  doc.text('Jika terlambat dari batas waktu, dikenakan denda 2% per bulan (maks. 48 bulan).', margin, y)
  y += 6

  // ── FOOTER LINE ──────────────────────────────────────────────────────
  doc.setLineWidth(0.2)
  doc.line(margin, y, pageW - margin, y)
  y += 4

  const pageH = doc.internal.pageSize.getHeight()

  // Signature area
  doc.setFontSize(8)
  doc.text(`Ditetapkan di: ${nmDati2 || '...'}`, margin, y)
  doc.text(`Tanggal Cetak: ${tglCetak}`, pageW - margin, y, { align: 'right' })
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.text('Kepala ' + nmInstansi, pageW - margin - 40, y, { align: 'center' })
  y += 20
  doc.setFont('helvetica', 'normal')
  doc.text('(................................................)', pageW - margin - 40, y, { align: 'center' })
  y += 4

  // Bottom notice
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  const notice = 'SPPT ini diterbitkan secara resmi oleh ' + nmInstansi + '. Harap simpan sebagai bukti kewajiban pajak.'
  doc.text(notice, pageW / 2, pageH - 6, { align: 'center', maxWidth: pageW - margin * 2 })

  return doc
}

export async function downloadSpptPdf(data: SpptData): Promise<void> {
  const doc = await generateSpptPdf(data)
  const nopStr = formatNop(data.nopParts).replace(/\./g, '')
  doc.save(`SPPT_${nopStr}_${data.thnPajakSppt}.pdf`)
}

export async function printSpptPdf(data: SpptData): Promise<void> {
  const doc = await generateSpptPdf(data)
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.onload = () => {
      win.print()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    }
  }
}
