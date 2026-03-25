'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Search, ScrollText } from 'lucide-react'
import { formatTanggal } from '@/components/data-table/column-helpers'
import { Badge } from '@/components/ui/badge'

type LogRow = {
  id: number
  username: string
  aksi: string
  modul: string | null
  keterangan: string | null
  ipAddress: string | null
  createdAt: Date | string
}

const columns: ColumnDef<LogRow>[] = [
  { accessorKey: 'id', header: 'ID' },
  {
    accessorKey: 'createdAt',
    header: 'Waktu',
    cell: ({ row }) => formatTanggal(row.original.createdAt, 'dd MMM yyyy HH:mm'),
  },
  { accessorKey: 'username', header: 'User' },
  {
    accessorKey: 'aksi',
    header: 'Aksi',
    cell: ({ row }) => <Badge variant="outline">{row.original.aksi}</Badge>,
  },
  {
    accessorKey: 'modul',
    header: 'Modul',
    cell: ({ row }) => row.original.modul ?? '-',
  },
  {
    accessorKey: 'keterangan',
    header: 'Keterangan',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground max-w-[300px] truncate block">
        {row.original.keterangan ?? '-'}
      </span>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.ipAddress ?? '-'}</span>,
  },
]

const PAGE_SIZE = 50

export default function LogPage() {
  const orpc = useORPC()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')

  const listQuery = useQuery(
    orpc.log.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        username: search || undefined,
      },
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Log Aktivitas</h1>
        <p className="text-muted-foreground">Riwayat aktivitas pengguna</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari username..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="pl-8"
        />
      </div>

      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as LogRow[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada log aktivitas."
        emptyIcon={<ScrollText size={48} className="opacity-10" />}
      />
    </div>
  )
}
