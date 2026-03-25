'use client'

/**
 * Payment Receipt (SSPD/Tanda Terima Pembayaran PBB) PDF Generator
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatNop, type NopParts } from '@/lib/utils/nop'

export interface ReceiptData {
  nopParts: NopParts
  thnPajakSppt: number
  nmWp: string
  jlnWp?: string
  kelurahanOp?: string
  kecamatanOp?: string

  tglPembayaran: string
  channelPembayaran?: string
  noReferensi?: string
  namaBayar?: string
  nipPetugas?: string

  pbbPokok: number
  denda: number
  totalBayar: number

  nmInstansi?: string
  nmDati2?: string
}

function formatRp(val: number): string {
  return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(val))}`
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { dateStyle: 'long' })
  } catch {
    return dateStr
  }
}

export async function generateReceiptPdf(data: ReceiptData): Promise<jsPDF> {
  // Half-A4 receipt format (portrait, 210x148mm)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [148, 210] })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 10
  let y = margin

  const nmInstansi = data.nmInstansi ?? 'BADAN PENDAPATAN DAERAH'
  const nmDati2 = data.nmDati2 ?? ''
  const nopStr = formatNop(data.nopParts)

  // QR via API (no extra dependency)
  let qrDataUrl: string | null = null
  try {
    const qrContent = `NOP:${nopStr}|THN:${data.thnPajakSppt}|NO_REF:${data.noReferensi ?? '-'}|BAYAR:${data.totalBayar}`
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(qrContent)}`
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
  } catch { /* optional */ }

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(`PEMERINTAH ${nmDati2.toUpperCase()}`, pageW / 2, y, { align: 'center' })
  y += 4
  doc.text(nmInstansi.toUpperCase(), pageW / 2, y, { align: 'center' })
  y += 4
  doc.setFontSize(11)
  doc.text('TANDA TERIMA PEMBAYARAN PBB-P2', pageW / 2, y, { align: 'center' })
  y += 2

  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 1
  doc.setLineWidth(0.2)
  doc.line(margin, y, pageW - margin, y)
  y += 5

  // QR right
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', pageW - margin - 18, margin, 18, 18)
  }

  // NOP + WP info
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  const lblColor: [number, number, number] = [100, 100, 100]
  const col2X = 90

  function row(label: string, value: string, yPos: number): number {
    doc.setTextColor(...lblColor)
    doc.text(label, margin, yPos)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text(value, margin + 38, yPos)
    doc.setFont('helvetica', 'normal')
    return yPos + 4
  }

  function row2(l1: string, v1: string, l2: string, v2: string, yPos: number): number {
    doc.setTextColor(...lblColor)
    doc.text(l1, margin, yPos)
    doc.text(l2, col2X, yPos)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text(v1, margin + 38, yPos)
    doc.text(v2, col2X + 35, yPos)
    doc.setFont('helvetica', 'normal')
    return yPos + 4
  }

  y = row('NOP', nopStr, y)
  y = row('Nama WP', data.nmWp, y)
  y = row2('Tahun Pajak', String(data.thnPajakSppt), 'Kelurahan/Kel', data.kelurahanOp ?? '-', y)
  y = row2('Tgl Bayar', formatDate(data.tglPembayaran), 'Kecamatan', data.kecamatanOp ?? '-', y)
  if (data.channelPembayaran) {
    y = row('Channel', data.channelPembayaran, y)
  }
  if (data.noReferensi) {
    y = row('No. Referensi', data.noReferensi, y)
  }
  if (data.namaBayar) {
    y = row('Nama Penyetor', data.namaBayar, y)
  }
  y += 2

  // Rincian
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [230, 230, 230], textColor: [30, 30, 30], fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right', fontStyle: 'bold' },
    },
    head: [['Uraian', 'Jumlah (Rp)']],
    body: [
      ['PBB Pokok', formatRp(data.pbbPokok)],
      ...(data.denda > 0 ? [['Denda Keterlambatan', formatRp(data.denda)]] : []),
      [{ content: 'TOTAL DIBAYAR', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: formatRp(data.totalBayar), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
    ],
  })

  const endY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? y + 20
  y = endY + 5

  // Petugas
  if (data.nipPetugas) {
    doc.setFontSize(7.5)
    doc.setTextColor(100, 100, 100)
    doc.text(`Petugas: ${data.nipPetugas}`, margin, y)
    doc.setTextColor(0, 0, 0)
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text('Dokumen ini dicetak secara sistem dan sah tanpa tanda tangan basah.', pageW / 2, pageH - 5, { align: 'center' })

  return doc
}

export async function downloadReceiptPdf(data: ReceiptData): Promise<void> {
  const doc = await generateReceiptPdf(data)
  const nopStr = formatNop(data.nopParts).replace(/\./g, '')
  doc.save(`Kwitansi_PBB_${nopStr}_${data.thnPajakSppt}.pdf`)
}

export async function printReceiptPdf(data: ReceiptData): Promise<void> {
  const doc = await generateReceiptPdf(data)
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
