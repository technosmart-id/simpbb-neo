'use client'

import * as React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { NopDisplay } from '@/components/nop/nop-display'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatRupiah, formatTanggal } from '@/components/data-table/column-helpers'
import { CreditCard } from 'lucide-react'
import { ExcelExportButton } from '@/components/export/excel-export-button'
import { formatNop } from '@/lib/utils/nop'

type Row = {
  kdPropinsi: string; kdDati2: string; kdKecamatan: string; kdKelurahan: string
  kdBlok: string; noUrut: string; kdJnsOp: string
  thnPajakSppt: number; tglPembayaranSppt: Date | string
  jmlSpptYgDibayar: string; dendaSppt: string; jmlBayar: string; namaBayar: string | null
}

const columns: ColumnDef<Row>[] = [
  { id: 'nop', header: 'NOP', cell: ({ row }) => <NopDisplay parts={row.original} copyable={false} /> },
  { accessorKey: 'thnPajakSppt', header: 'Tahun' },
  { accessorKey: 'tglPembayaranSppt', header: 'Tanggal', cell: ({ row }) => formatTanggal(row.original.tglPembayaranSppt) },
  { accessorKey: 'jmlSpptYgDibayar', header: 'Pokok', cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.jmlSpptYgDibayar)}</span> },
  { accessorKey: 'dendaSppt', header: 'Denda', cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.dendaSppt)}</span> },
  { accessorKey: 'jmlBayar', header: 'Total', cell: ({ row }) => <span className="font-mono text-sm font-medium">{formatRupiah(row.original.jmlBayar)}</span> },
  { accessorKey: 'namaBayar', header: 'Pembayar', cell: ({ row }) => row.original.namaBayar ?? '-' },
]

const EXCEL_COLUMNS = [
  { header: 'NOP', key: 'nop', width: 24 },
  { header: 'Tahun Pajak', key: 'thnPajakSppt', width: 12 },
  { header: 'Tanggal Bayar', key: 'tglPembayaranSppt', width: 16, style: 'date' as const },
  { header: 'PBB Pokok (Rp)', key: 'jmlSpptYgDibayar', width: 18, style: 'currency' as const },
  { header: 'Denda (Rp)', key: 'dendaSppt', width: 16, style: 'currency' as const },
  { header: 'Total Bayar (Rp)', key: 'jmlBayar', width: 18, style: 'currency' as const },
  { header: 'Nama Pembayar', key: 'namaBayar', width: 24 },
]

const PAGE_SIZE = 50

export default function LaporanPembayaranPage() {
  const orpc = useORPC()
  const qc = useQueryClient()
  const currentYear = new Date().getFullYear()
  const [page, setPage] = React.useState(1)
  const [thnPajak, setThnPajak] = React.useState(currentYear)

  const listQuery = useQuery(
    orpc.pembayaran.list.queryOptions({
      input: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, thnPajak },
    }),
  )

  async function getExportRows() {
    const result = await qc.fetchQuery(
      orpc.pembayaran.list.queryOptions({ input: { limit: 9999, offset: 0, thnPajak } }),
    )
    return (result.rows as Row[]).map((r) => ({
      nop: formatNop(r),
      thnPajakSppt: r.thnPajakSppt,
      tglPembayaranSppt: r.tglPembayaranSppt ? new Date(r.tglPembayaranSppt as string) : null,
      jmlSpptYgDibayar: Number(r.jmlSpptYgDibayar),
      dendaSppt: Number(r.dendaSppt),
      jmlBayar: Number(r.jmlBayar),
      namaBayar: r.namaBayar ?? '',
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Laporan Pembayaran</h1>
          <p className="text-muted-foreground">Rincian pembayaran PBB per periode</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={String(thnPajak)} onValueChange={(v) => { setThnPajak(parseInt(v)); setPage(1) }}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExcelExportButton
            filename={`Laporan_Pembayaran_${thnPajak}`}
            title={`LAPORAN PEMBAYARAN PBB TAHUN ${thnPajak}`}
            columns={EXCEL_COLUMNS}
            getRows={getExportRows}
            label="Export Excel"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as Row[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page} pageSize={PAGE_SIZE} onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada data pembayaran."
        emptyIcon={<CreditCard size={48} className="opacity-10" />}
      />
    </div>
  )
}
