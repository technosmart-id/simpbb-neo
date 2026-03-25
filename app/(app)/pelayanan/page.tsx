'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { PelayananBadge, getPelayananStatuses } from '@/components/status/pelayanan-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, ClipboardList } from 'lucide-react'
import { formatTanggal } from '@/components/data-table/column-helpers'
import Link from 'next/link'

type PelayananRow = {
  noPelayanan: string
  kdJnsPelayanan: string
  tanggalPelayanan: Date | string
  namaPemohon: string | null
  letakOp: string | null
  statusPelayanan: number
}

const columns: ColumnDef<PelayananRow>[] = [
  {
    accessorKey: 'noPelayanan',
    header: 'No Pelayanan',
    cell: ({ row }) => (
      <Link href={`/pelayanan/${row.original.noPelayanan}`} className="font-medium hover:underline">
        {row.original.noPelayanan}
      </Link>
    ),
  },
  {
    accessorKey: 'kdJnsPelayanan',
    header: 'Jenis',
  },
  {
    accessorKey: 'tanggalPelayanan',
    header: 'Tanggal',
    cell: ({ row }) => formatTanggal(row.original.tanggalPelayanan),
  },
  {
    accessorKey: 'namaPemohon',
    header: 'Pemohon',
    cell: ({ row }) => row.original.namaPemohon ?? '-',
  },
  {
    accessorKey: 'letakOp',
    header: 'Letak OP',
    cell: ({ row }) => row.original.letakOp ?? '-',
  },
  {
    accessorKey: 'statusPelayanan',
    header: 'Status',
    cell: ({ row }) => <PelayananBadge status={row.original.statusPelayanan} />,
  },
]

const PAGE_SIZE = 20

export default function PelayananPage() {
  const orpc = useORPC()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const listQuery = useQuery(
    orpc.pelayanan.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        search: search || undefined,
        statusPelayanan: statusFilter !== 'all' ? parseInt(statusFilter) : undefined,
      },
    }),
  )

  const summaryQuery = useQuery(orpc.pelayanan.statusSummary.queryOptions())

  const statuses = getPelayananStatuses()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Pelayanan</h1>
          <p className="text-muted-foreground">Berkas pelayanan PBB</p>
        </div>
        <Button asChild>
          <Link href="/pelayanan/baru">
            <Plus className="w-4 h-4 mr-2" />
            Registrasi Berkas
          </Link>
        </Button>
      </div>

      {/* Status summary */}
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {statuses.map((s) => {
          const count = summaryQuery.data?.find((r) => r.status === s.value)?.count ?? 0
          return (
            <Card
              key={s.value}
              className={`cursor-pointer transition-colors ${statusFilter === String(s.value) ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                setStatusFilter(statusFilter === String(s.value) ? 'all' : String(s.value))
                setPage(1)
              }}
            >
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold">{count}</div>
                <PelayananBadge status={s.value} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari no pelayanan, nama pemohon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as PelayananRow[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada berkas pelayanan."
        emptyIcon={<ClipboardList size={48} className="opacity-10" />}
      />
    </div>
  )
}
