'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { formatNop, type NopParts } from '@/lib/utils/nop'
import { NopDisplay } from '@/components/nop/nop-display'
import { WilayahCascade, type WilayahValue } from '@/components/wilayah/wilayah-cascade'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, FileText } from 'lucide-react'
import { formatRupiah } from '@/components/data-table/column-helpers'
import Link from 'next/link'

type SpopRow = {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
  subjekPajakId: string
  jalanOp: string
  luasBumi: number
  nilaiSistemBumi: number
}

const columns: ColumnDef<SpopRow>[] = [
  {
    id: 'nop',
    header: 'NOP',
    cell: ({ row }) => (
      <Link
        href={`/spop/${formatNop(row.original).replace(/\./g, '')}`}
        className="hover:underline"
      >
        <NopDisplay parts={row.original} copyable={false} />
      </Link>
    ),
  },
  {
    accessorKey: 'subjekPajakId',
    header: 'ID Subjek Pajak',
  },
  {
    accessorKey: 'jalanOp',
    header: 'Alamat OP',
  },
  {
    accessorKey: 'luasBumi',
    header: 'Luas Bumi (m²)',
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {Number(row.original.luasBumi).toLocaleString('id-ID')}
      </span>
    ),
  },
  {
    accessorKey: 'nilaiSistemBumi',
    header: 'NJOP Bumi',
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatRupiah(row.original.nilaiSistemBumi)}
      </span>
    ),
  },
]

const PAGE_SIZE = 20

export default function SpopPage() {
  const orpc = useORPC()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [wilayah, setWilayah] = React.useState<Partial<WilayahValue>>({
    kdPropinsi: '51',
    kdDati2: '71',
  })

  const listQuery = useQuery(
    orpc.objekPajak.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        search: search || undefined,
        kdPropinsi: wilayah.kdPropinsi || undefined,
        kdDati2: wilayah.kdDati2 || undefined,
        kdKecamatan: wilayah.kdKecamatan || undefined,
        kdKelurahan: wilayah.kdKelurahan || undefined,
        kdBlok: wilayah.kdBlok || undefined,
        kdZnt: wilayah.kdZnt || undefined,
      },
    }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">SPOP</h1>
          <p className="text-muted-foreground">
            Surat Pemberitahuan Objek Pajak — Data objek pajak PBB
          </p>
        </div>
        <Button asChild>
          <Link href="/spop/baru">
            <Plus className="w-4 h-4 mr-2" />
            Tambah SPOP
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-md border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <WilayahCascade
            value={wilayah}
            onChange={(v) => {
              setWilayah(v)
              setPage(1)
            }}
            maxLevel="znt"
          />
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari alamat, no urut..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as SpopRow[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada data SPOP."
        emptyIcon={<FileText size={48} className="opacity-10" />}
      />
    </div>
  )
}
