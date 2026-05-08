import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatNop, type NopParts } from '@/lib/utils/nop'

export interface TunggakanItem {
  thnPajakSppt: string | number
  tglJatuhTempo: string | Date | null
  pbbHarusDibayar: number
}

export interface TunggakanReportData {
  nopParts: NopParts
  nmWp: string
  items: TunggakanItem[]
}

function formatRp(val: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(val))
}

export async function generateTunggakanPdf(data: TunggakanReportData): Promise<jsPDF> {
  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  
  // Header
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN TUNGGAKAN PAJAK BUMI DAN BANGUNAN', pageW / 2, 15, { align: 'center' })
  
  doc.setFontSize(10)
  doc.text(`NOP: ${formatNop(data.nopParts)}`, margin, 25)
  doc.text(`Nama Wajib Pajak: ${data.nmWp}`, margin, 30)
  
  const tableData = data.items.map(item => {
    const denda = Math.round(item.pbbHarusDibayar * 0.02) // Simplified 2%
    return [
      item.thnPajakSppt,
      item.tglJatuhTempo ? new Date(item.tglJatuhTempo).toLocaleDateString('id-ID') : '-',
      formatRp(item.pbbHarusDibayar),
      formatRp(denda),
      formatRp(item.pbbHarusDibayar + denda)
    ]
  })
  
  const totalPokok = data.items.reduce((acc, curr) => acc + curr.pbbHarusDibayar, 0)
  const totalDenda = data.items.reduce((acc, curr) => acc + Math.round(curr.pbbHarusDibayar * 0.02), 0)

  autoTable(doc, {
    startY: 35,
    head: [['Tahun', 'Jatuh Tempo', 'Pokok (Rp)', 'Estimasi Denda (Rp)', 'Total (Rp)']],
    body: [
      ...tableData,
      [
        { content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatRp(totalPokok), styles: { fontStyle: 'bold' } },
        { content: formatRp(totalDenda), styles: { fontStyle: 'bold' } },
        { content: formatRp(totalPokok + totalDenda), styles: { fontStyle: 'bold' } }
      ]
    ],
    theme: 'striped',
    headStyles: { fillColor: [220, 53, 69] },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  })
  
  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('* Data ini adalah estimasi per tanggal cetak.', margin, finalY)
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, margin, finalY + 5)

  return doc
}

export async function downloadTunggakanPdf(data: TunggakanReportData) {
  const doc = await generateTunggakanPdf(data)
  doc.save(`Tunggakan_${formatNop(data.nopParts).replace(/\./g, '')}.pdf`)
}
