import jsPDF from 'jspdf'
import { formatNop, type NopParts } from '@/lib/utils/nop'

export interface InfoReportData {
  nopParts: NopParts
  spop: any
  buildings: any[]
}

export async function generateInfoPdf(data: InfoReportData): Promise<jsPDF> {
  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMASI OBJEK PAJAK (SNAPSHOT)', pageW / 2, 15, { align: 'center' })
  
  doc.setFontSize(10)
  doc.text(`NOP: ${formatNop(data.nopParts)}`, margin, 25)
  
  doc.setFont('helvetica', 'bold')
  doc.text('DATA BUMI', margin, 35)
  doc.setFont('helvetica', 'normal')
  doc.text(`Luas Bumi: ${data.spop.luasBumi} m2`, margin, 40)
  doc.text(`Kode ZNT: ${data.spop.kdZnt}`, margin, 45)
  doc.text(`Jenis Bumi: ${data.spop.jnsBumi}`, margin, 50)
  doc.text(`Alamat: ${data.spop.jalanOp}`, margin, 55)

  let y = 65
  doc.setFont('helvetica', 'bold')
  doc.text('DATA BANGUNAN', margin, y)
  y += 5
  
  if (data.buildings && data.buildings.length > 0) {
    data.buildings.forEach((b, i) => {
      doc.setFont('helvetica', 'bold')
      doc.text(`Bangunan ke-${b.noBng}`, margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.text(`Jenis: ${b.kdJpb} | Luas: ${b.luasBng} m2 | Lantai: ${b.jmlLantaiBng}`, margin, y)
      y += 5
      doc.text(`Tahun: ${b.thnDibangunBng} | Kondisi: ${b.kondisiBng}`, margin, y)
      y += 8
      
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })
  } else {
    doc.text('Tidak ada data bangunan.', margin, y)
  }

  return doc
}

export async function downloadInfoPdf(data: InfoReportData) {
  const doc = await generateInfoPdf(data)
  doc.save(`InfoOP_${formatNop(data.nopParts).replace(/\./g, '')}.pdf`)
}
