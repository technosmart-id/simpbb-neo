'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, Users } from 'lucide-react'
import { formatTanggal } from '@/components/data-table/column-helpers'

type UserRow = {
  id: number
  username: string
  hakAkses: string
  nip: string | null
  nama: string | null
  jabatan: string | null
  statusAktif: number
  lastLogin: Date | string | null
  userId: string | null
}

const columns: ColumnDef<UserRow>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'nama', header: 'Nama', cell: ({ row }) => row.original.nama ?? '-' },
  { accessorKey: 'nip', header: 'NIP', cell: ({ row }) => row.original.nip ?? '-' },
  {
    accessorKey: 'hakAkses',
    header: 'Hak Akses',
    cell: ({ row }) => <Badge variant="outline">{row.original.hakAkses}</Badge>,
  },
  {
    accessorKey: 'statusAktif',
    header: 'Status',
    cell: ({ row }) =>
      row.original.statusAktif ? (
        <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/10">Aktif</Badge>
      ) : (
        <Badge variant="destructive">Non-aktif</Badge>
      ),
  },
  {
    accessorKey: 'userId',
    header: 'Auth Link',
    cell: ({ row }) =>
      row.original.userId ? (
        <Badge variant="outline" className="border-blue-500/50 text-blue-600 bg-blue-500/10">Linked</Badge>
      ) : (
        <Badge variant="outline">Unlinked</Badge>
      ),
  },
  {
    accessorKey: 'lastLogin',
    header: 'Login Terakhir',
    cell: ({ row }) => formatTanggal(row.original.lastLogin, 'dd MMM yyyy HH:mm'),
  },
]

const PAGE_SIZE = 20

export default function PenggunaPage() {
  const orpc = useORPC()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')

  const listQuery = useQuery(
    orpc.pengguna.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        search: search || undefined,
      },
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Pengguna</h1>
          <p className="text-muted-foreground">Manajemen pengguna SIM-PBB</p>
        </div>
        <Button disabled>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari username, nama..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="pl-8"
        />
      </div>

      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as UserRow[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada pengguna."
        emptyIcon={<Users size={48} className="opacity-10" />}
      />
    </div>
  )
}
