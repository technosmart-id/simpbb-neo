'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { NopDisplay } from '@/components/nop/nop-display'
import { WilayahCascade, type WilayahValue } from '@/components/wilayah/wilayah-cascade'
import { PembayaranBadge } from '@/components/status/pembayaran-badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Search } from 'lucide-react'
import { formatRupiah, formatTanggal } from '@/components/data-table/column-helpers'

type TunggakanRow = {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
  thnPajakSppt: number
  nmWp: string | null
  pbbYgHarusDibayarSppt: string
  statusPembayaranSppt: string
  tglJatuhTempo: Date | string | null
}

const columns: ColumnDef<TunggakanRow>[] = [
  {
    id: 'nop',
    header: 'NOP',
    cell: ({ row }) => <NopDisplay parts={row.original} copyable={false} />,
  },
  { accessorKey: 'thnPajakSppt', header: 'Tahun' },
  { accessorKey: 'nmWp', header: 'Nama WP', cell: ({ row }) => row.original.nmWp ?? '-' },
  {
    accessorKey: 'pbbYgHarusDibayarSppt',
    header: 'PBB Terhutang',
    cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.pbbYgHarusDibayarSppt)}</span>,
  },
  {
    accessorKey: 'statusPembayaranSppt',
    header: 'Status',
    cell: ({ row }) => <PembayaranBadge status={row.original.statusPembayaranSppt} />,
  },
  {
    accessorKey: 'tglJatuhTempo',
    header: 'Jatuh Tempo',
    cell: ({ row }) => formatTanggal(row.original.tglJatuhTempo),
  },
]

const PAGE_SIZE = 20

export default function TunggakanPage() {
  const orpc = useORPC()
  const currentYear = new Date().getFullYear()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [wilayah, setWilayah] = React.useState<Partial<WilayahValue>>({})

  const listQuery = useQuery(
    orpc.tunggakan.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        thnPajakMax: currentYear,
        search: search || undefined,
        kdPropinsi: wilayah.kdPropinsi || undefined,
        kdDati2: wilayah.kdDati2 || undefined,
        kdKecamatan: wilayah.kdKecamatan || undefined,
        kdKelurahan: wilayah.kdKelurahan || undefined,
      },
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Tunggakan</h1>
        <p className="text-muted-foreground">SPPT yang belum dilunasi</p>
      </div>

      {/* Total tunggakan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Tunggakan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            {formatRupiah(listQuery.data?.totalTunggakan)}
          </div>
          <p className="text-sm text-muted-foreground">
            {listQuery.data?.total ?? 0} SPPT belum lunas
          </p>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card p-4 space-y-3">
        <WilayahCascade value={wilayah} onChange={(v) => { setWilayah(v); setPage(1) }} />
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama WP, no urut..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as TunggakanRow[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada tunggakan."
        emptyIcon={<AlertTriangle size={48} className="opacity-10" />}
      />
    </div>
  )
}
