'use client'

import * as React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { NopDisplay } from '@/components/nop/nop-display'
import { WilayahCascade, type WilayahValue } from '@/components/wilayah/wilayah-cascade'
import { PembayaranBadge } from '@/components/status/pembayaran-badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Download, Loader2, FileSpreadsheet } from 'lucide-react'
import { formatRupiah } from '@/components/data-table/column-helpers'
import { ExcelExportButton } from '@/components/export/excel-export-button'
import { formatNop } from '@/lib/utils/nop'
import type { DhkpRow } from '@/lib/utils/pdf/dhkp-generator'

type SpptRow = {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
  thnPajakSppt: number
  nmWp: string | null
  luasBumi: string | null
  luasBng: string | null
  njopSppt: string | null
  njoptkpSppt: string | null
  njkpSppt: string | null
  pbbTerhutangSppt: string | null
  faktorPengurangSppt: string | null
  pbbYgHarusDibayarSppt: string
  statusPembayaranSppt: string
}

const EXCEL_COLUMNS = [
  { header: 'NOP', key: 'nop', width: 24 },
  { header: 'Nama WP', key: 'nmWp', width: 26 },
  { header: 'Luas Bumi (m²)', key: 'luasBumi', width: 14, style: 'number' as const },
  { header: 'Luas Bng (m²)', key: 'luasBng', width: 14, style: 'number' as const },
  { header: 'NJOP (Rp)', key: 'njopSppt', width: 18, style: 'currency' as const },
  { header: 'NJOPTKP (Rp)', key: 'njoptkpSppt', width: 16, style: 'currency' as const },
  { header: 'NJKP (Rp)', key: 'njkpSppt', width: 18, style: 'currency' as const },
  { header: 'PBB Terhutang (Rp)', key: 'pbbYgHarusDibayarSppt', width: 20, style: 'currency' as const },
  { header: 'Status Bayar', key: 'statusLabel', width: 14 },
]

const columns: ColumnDef<SpptRow>[] = [
  {
    id: 'nop',
    header: 'NOP',
    cell: ({ row }) => <NopDisplay parts={row.original} copyable={false} />,
  },
  { accessorKey: 'nmWp', header: 'Nama WP', cell: ({ row }) => row.original.nmWp ?? '-' },
  {
    accessorKey: 'luasBumi',
    header: 'L.Bumi',
    cell: ({ row }) => <span className="font-mono text-sm">{Number(row.original.luasBumi ?? 0).toLocaleString('id-ID')} m²</span>,
  },
  {
    accessorKey: 'luasBng',
    header: 'L.Bng',
    cell: ({ row }) => <span className="font-mono text-sm">{Number(row.original.luasBng ?? 0).toLocaleString('id-ID')} m²</span>,
  },
  {
    accessorKey: 'njopSppt',
    header: 'NJOP',
    cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.njopSppt)}</span>,
  },
  {
    accessorKey: 'pbbYgHarusDibayarSppt',
    header: 'PBB',
    cell: ({ row }) => <span className="font-mono text-sm font-medium">{formatRupiah(row.original.pbbYgHarusDibayarSppt)}</span>,
  },
  {
    accessorKey: 'statusPembayaranSppt',
    header: 'Status',
    cell: ({ row }) => <PembayaranBadge status={row.original.statusPembayaranSppt} />,
  },
]

const PAGE_SIZE = 50

export default function DhkpPage() {
  const orpc = useORPC()
  const qc = useQueryClient()
  const currentYear = new Date().getFullYear()
  const [page, setPage] = React.useState(1)
  const [thnPajak, setThnPajak] = React.useState(currentYear)
  const [wilayah, setWilayah] = React.useState<Partial<WilayahValue>>({})
  const [generating, setGenerating] = React.useState(false)

  const listQuery = useQuery(
    orpc.sppt.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        thnPajak,
        kdPropinsi: wilayah.kdPropinsi || undefined,
        kdDati2: wilayah.kdDati2 || undefined,
        kdKecamatan: wilayah.kdKecamatan || undefined,
        kdKelurahan: wilayah.kdKelurahan || undefined,
      },
    }),
  )

  async function fetchAllRows(): Promise<SpptRow[]> {
    const result = await qc.fetchQuery(
      orpc.sppt.list.queryOptions({
        input: {
          limit: 99999,
          offset: 0,
          thnPajak,
          kdPropinsi: wilayah.kdPropinsi || undefined,
          kdDati2: wilayah.kdDati2 || undefined,
          kdKecamatan: wilayah.kdKecamatan || undefined,
          kdKelurahan: wilayah.kdKelurahan || undefined,
        },
      }),
    )
    return result.rows as SpptRow[]
  }

  function namaWilayah(): string {
    const parts: string[] = []
    if (wilayah.kdKelurahan) parts.push(`Kel. ${wilayah.kdKelurahan}`)
    else if (wilayah.kdKecamatan) parts.push(`Kec. ${wilayah.kdKecamatan}`)
    else if (wilayah.kdDati2) parts.push(`Kab/Kota ${wilayah.kdDati2}`)
    else if (wilayah.kdPropinsi) parts.push(`Prov. ${wilayah.kdPropinsi}`)
    return parts.length > 0 ? parts.join(' / ') : 'SELURUH WILAYAH'
  }

  async function handleGeneratePdf() {
    setGenerating(true)
    try {
      const rows = await fetchAllRows()
      const { downloadDhkpPdf } = await import('@/lib/utils/pdf/dhkp-generator')
      await downloadDhkpPdf({
        rows: rows as unknown as DhkpRow[],
        thnPajak,
        namaWilayah: namaWilayah(),
      })
    } finally {
      setGenerating(false)
    }
  }

  async function getExportRows() {
    const rows = await fetchAllRows()
    return rows.map((r) => ({
      nop: formatNop(r),
      nmWp: r.nmWp ?? '',
      luasBumi: Number(r.luasBumi ?? 0),
      luasBng: Number(r.luasBng ?? 0),
      njopSppt: Number(r.njopSppt ?? 0),
      njoptkpSppt: Number(r.njoptkpSppt ?? 0),
      njkpSppt: Number(r.njkpSppt ?? 0),
      pbbYgHarusDibayarSppt: Number(r.pbbYgHarusDibayarSppt),
      statusLabel: r.statusPembayaranSppt === 'L' || r.statusPembayaranSppt === '1' ? 'LUNAS' : 'BELUM',
    }))
  }

  const totalPbb = (listQuery.data?.rows as SpptRow[] | undefined)?.reduce(
    (s, r) => s + Number(r.pbbYgHarusDibayarSppt),
    0,
  ) ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">DHKP</h1>
          <p className="text-muted-foreground">Daftar Himpunan Ketetapan Pajak — Generator &amp; Cetak</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={String(thnPajak)} onValueChange={(v) => { setThnPajak(parseInt(v)); setPage(1) }}>
            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExcelExportButton
            filename={`DHKP_${thnPajak}`}
            title={`DAFTAR HIMPUNAN KETETAPAN PAJAK (DHKP) TAHUN ${thnPajak}`}
            subtitle={`Wilayah: ${namaWilayah()}`}
            columns={EXCEL_COLUMNS}
            getRows={getExportRows}
            label="Export Excel"
            variant="outline"
          />
          <Button onClick={handleGeneratePdf} disabled={generating}>
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Cetak DHKP PDF
          </Button>
        </div>
      </div>

      {/* Filter wilayah */}
      <Card>
        <CardContent className="p-4">
          <WilayahCascade value={wilayah} onChange={(v) => { setWilayah(v); setPage(1) }} />
        </CardContent>
      </Card>

      {/* Summary */}
      {listQuery.data && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total OP (halaman ini)</p>
              <p className="text-2xl font-bold">{(listQuery.data.rows as SpptRow[]).length}</p>
              <p className="text-xs text-muted-foreground">dari {listQuery.data.total} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total PBB (halaman ini)</p>
              <p className="text-lg font-bold font-mono">{formatRupiah(totalPbb)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Tahun Pajak</p>
              <p className="text-2xl font-bold">{thnPajak}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as SpptRow[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada data SPPT untuk wilayah dan tahun ini."
        emptyIcon={<BookOpen size={48} className="opacity-10" />}
      />
    </div>
  )
}
