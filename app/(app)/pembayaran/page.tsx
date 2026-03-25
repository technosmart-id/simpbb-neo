'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { NopDisplay } from '@/components/nop/nop-display'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, CreditCard } from 'lucide-react'
import { formatRupiah, formatTanggal } from '@/components/data-table/column-helpers'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type PembayaranRow = {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
  thnPajakSppt: number
  pembayaranKe: number
  tglPembayaranSppt: Date | string
  jmlSpptYgDibayar: string
  dendaSppt: string
  jmlBayar: string
  namaBayar: string | null
  dibatalkan: number
}

const columns: ColumnDef<PembayaranRow>[] = [
  {
    id: 'nop',
    header: 'NOP',
    cell: ({ row }) => <NopDisplay parts={row.original} copyable={false} />,
  },
  {
    accessorKey: 'thnPajakSppt',
    header: 'Tahun',
  },
  {
    accessorKey: 'pembayaranKe',
    header: 'Ke',
  },
  {
    accessorKey: 'tglPembayaranSppt',
    header: 'Tanggal',
    cell: ({ row }) => formatTanggal(row.original.tglPembayaranSppt),
  },
  {
    accessorKey: 'jmlSpptYgDibayar',
    header: 'Pokok',
    cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.jmlSpptYgDibayar)}</span>,
  },
  {
    accessorKey: 'dendaSppt',
    header: 'Denda',
    cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.dendaSppt)}</span>,
  },
  {
    accessorKey: 'jmlBayar',
    header: 'Total Bayar',
    cell: ({ row }) => <span className="font-mono text-sm font-medium">{formatRupiah(row.original.jmlBayar)}</span>,
  },
  {
    accessorKey: 'namaBayar',
    header: 'Nama',
    cell: ({ row }) => row.original.namaBayar ?? '-',
  },
  {
    accessorKey: 'dibatalkan',
    header: 'Status',
    cell: ({ row }) =>
      row.original.dibatalkan ? (
        <Badge variant="destructive">Batal</Badge>
      ) : (
        <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/10">
          Aktif
        </Badge>
      ),
  },
]

const PAGE_SIZE = 20

export default function PembayaranPage() {
  const orpc = useORPC()
  const currentYear = new Date().getFullYear()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [thnPajak, setThnPajak] = React.useState(String(currentYear))

  const listQuery = useQuery(
    orpc.pembayaran.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        search: search || undefined,
        thnPajak: thnPajak !== 'all' ? parseInt(thnPajak) : undefined,
      },
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Pembayaran</h1>
          <p className="text-muted-foreground">Catatan pembayaran PBB</p>
        </div>
        <Button asChild>
          <Link href="/pembayaran/baru">
            <Plus className="w-4 h-4 mr-2" />
            Catat Pembayaran
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama pembayar..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-8"
          />
        </div>
        <Select value={thnPajak} onValueChange={(v) => { setThnPajak(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tahun</SelectItem>
            {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as PembayaranRow[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada data pembayaran."
        emptyIcon={<CreditCard size={48} className="opacity-10" />}
      />
    </div>
  )
}
