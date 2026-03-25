"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { SortableHeader } from "@/components/data-table/column-helpers"
import { Badge } from "@/components/ui/badge"

// ─── Types ───────────────────────────────────────────────────────

type JenisSppt = {
  id: number
  kode: string
  nama: string
  tarifKhusus: string | null
  aktif: number
}

// ─── Columns ─────────────────────────────────────────────────────

const columns: ColumnDef<JenisSppt>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "kode",
    header: ({ column }) => <SortableHeader column={column} label="Kode" />,
  },
  {
    accessorKey: "nama",
    header: ({ column }) => <SortableHeader column={column} label="Nama" />,
  },
  {
    accessorKey: "tarifKhusus",
    header: "Tarif Khusus (%)",
    cell: ({ row }) => {
      const val = row.original.tarifKhusus
        ? parseFloat(row.original.tarifKhusus)
        : null
      if (val == null) return <span className="text-muted-foreground">-</span>
      return (
        <span className="font-mono text-sm">{(val * 100).toFixed(2)}%</span>
      )
    },
  },
  {
    accessorKey: "aktif",
    header: "Status",
    cell: ({ row }) => {
      const aktif = row.original.aktif === 1
      return (
        <Badge variant={aktif ? "default" : "secondary"}>
          {aktif ? "Aktif" : "Nonaktif"}
        </Badge>
      )
    },
  },
]

// ─── Page ────────────────────────────────────────────────────────

export default function JenisSpptPage() {
  const orpc = useORPC()

  const jenisSpptQuery = useQuery(orpc.klasifikasi.listJenisSppt.queryOptions())

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Jenis SPPT</h1>
        <p className="text-muted-foreground">
          Data master jenis Surat Pemberitahuan Pajak Terutang (SPPT).
        </p>
      </div>

      <DataTable
        columns={columns}
        data={jenisSpptQuery.data ?? []}
        isLoading={jenisSpptQuery.isLoading}
        searchColumn="nama"
        searchPlaceholder="Cari jenis SPPT..."
        emptyMessage="Tidak ada data jenis SPPT."
        // TODO: Add/Edit/Delete buttons — need mutation endpoints for jenis SPPT CRUD
      />
    </div>
  )
}
