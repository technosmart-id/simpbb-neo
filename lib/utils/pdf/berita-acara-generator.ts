'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export interface BeritaAcaraData {
  pelayanan: {
    noPelayanan: string
    namaJenisPelayanan: string
    tanggalPelayanan: string       // YYYY-MM-DD
    namaPemohon: string
    alamatPemohon: string
    letakOp: string
    nop?: string
    keterangan: string
    namaPetugasPenerima: string
    nipPetugasPenerima: string
    ttdKiriJabatan: string
    ttdKiriNama: string
    ttdKiriNip: string
    ttdKananJabatan: string
    ttdKananNama: string
    ttdKananNip: string
  }
  dokumen: { dokumenId: number; namaDokumen: string; ada: boolean }[]
  instansi: { nmInstansi: string; alamatInstansi: string }
  mutasi?: {
    ltSebelum: number; lbSebelum: number; pbbSebelum: number
    ltSesudah: number; lbSesudah: number; pbbSesudah: number
  }
}

function fmtRp(v: number) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(v))
}

function buildBase(data: BeritaAcaraData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const { pelayanan, dokumen, instansi } = data
  let y = 15

  // Kop surat
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(instansi.nmInstansi, 105, y, { align: 'center' })
  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(instansi.alamatInstansi, 105, y, { align: 'center' })
  y += 4
  doc.setLineWidth(0.5)
  doc.line(15, y, 195, y)
  y += 6

  // Title
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BERITA ACARA PELAYANAN', 105, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nomor: BA-${pelayanan.noPelayanan}`, 105, y, { align: 'center' })
  y += 8

  // Opening text
  const tglPanjang = format(new Date(pelayanan.tanggalPelayanan), "EEEE, dd MMMM yyyy", { locale: localeId })
  doc.setFontSize(10)
  const opening = `Pada hari ini, ${tglPanjang}, kami yang bertanda tangan di bawah ini telah melakukan pelayanan sebagai berikut:`
  const lines = doc.splitTextToSize(opening, 175)
  doc.text(lines, 15, y)
  y += lines.length * 5 + 4

  // Data pelayanan table
  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ['No. Berkas', ':', pelayanan.noPelayanan],
      ['Jenis Pelayanan', ':', pelayanan.namaJenisPelayanan],
      ['NOP', ':', pelayanan.nop ?? '-'],
      ['Nama Pemohon', ':', pelayanan.namaPemohon],
      ['Alamat Pemohon', ':', pelayanan.alamatPemohon],
      ['Letak Objek Pajak', ':', pelayanan.letakOp],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1 },
    columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 6 }, 2: { cellWidth: 120 } },
    margin: { left: 15, right: 15 },
  })
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6

  // Dokumen checklist
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Dokumen yang Diterima:', 15, y)
  y += 4
  autoTable(doc, {
    startY: y,
    head: [['No', 'Dokumen', 'Keterangan']],
    body: dokumen.map((d, i) => [i + 1, d.namaDokumen, d.ada ? '✓ Ada' : '— Tidak Ada']),
    theme: 'striped',
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 9 },
    styles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 30 } },
    margin: { left: 15, right: 15 },
  })
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6

  // Hasil penelitian
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Hasil Penelitian:', 15, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  const hasilLines = doc.splitTextToSize(pelayanan.keterangan || '-', 175)
  doc.text(hasilLines, 15, y)
  y += hasilLines.length * 5 + 8

  // Signature block
  const sigY = Math.max(y, 230)
  doc.setFontSize(9)
  doc.text('Pemohon,', 25, sigY, { align: 'center' })
  doc.text(pelayanan.namaPemohon, 25, sigY + 25, { align: 'center' })

  doc.text(pelayanan.ttdKiriJabatan || 'Petugas Penerima,', 105, sigY, { align: 'center' })
  doc.text(pelayanan.ttdKiriNama || pelayanan.namaPetugasPenerima, 105, sigY + 25, { align: 'center' })
  if (pelayanan.ttdKiriNip || pelayanan.nipPetugasPenerima) {
    doc.text(`NIP. ${pelayanan.ttdKiriNip || pelayanan.nipPetugasPenerima}`, 105, sigY + 30, { align: 'center' })
  }

  doc.text(pelayanan.ttdKananJabatan || 'Mengetahui,', 180, sigY, { align: 'center' })
  doc.text(pelayanan.ttdKananNama, 180, sigY + 25, { align: 'center' })
  if (pelayanan.ttdKananNip) {
    doc.text(`NIP. ${pelayanan.ttdKananNip}`, 180, sigY + 30, { align: 'center' })
  }

  return doc
}

export function generateBeritaAcara(data: BeritaAcaraData): void {
  const doc = buildBase(data)
  doc.save(`BA-${data.pelayanan.noPelayanan}.pdf`)
}

export function generateBeritaAcaraDetail(data: BeritaAcaraData): void {
  if (!data.mutasi) return
  const doc = buildBase(data)

  doc.addPage()
  let y = 20

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BERITA ACARA DETAIL — Data Sebelum dan Sesudah', 105, y, { align: 'center' })
  y += 10

  const { mutasi } = data
  autoTable(doc, {
    startY: y,
    head: [['Uraian', 'Sebelum', 'Sesudah']],
    body: [
      ['Luas Tanah (m²)', mutasi.ltSebelum.toLocaleString('id-ID'), mutasi.ltSesudah.toLocaleString('id-ID')],
      ['Luas Bangunan (m²)', mutasi.lbSebelum.toLocaleString('id-ID'), mutasi.lbSesudah.toLocaleString('id-ID')],
      ['PBB Terhutang', fmtRp(mutasi.pbbSebelum), fmtRp(mutasi.pbbSesudah)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 10 },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    margin: { left: 15, right: 15 },
  })

  doc.save(`BA-Detail-${data.pelayanan.noPelayanan}.pdf`)
}
