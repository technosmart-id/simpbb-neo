"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import {
  SortableHeader,
  formatRupiah,
} from "@/components/data-table/column-helpers"
import { Badge } from "@/components/ui/badge"

// ─── Types ───────────────────────────────────────────────────────

type Fasilitas = {
  kdFasilitas: string
  nmFasilitas: string
  satuanFasilitas: string
  nilaiFasilitas: string
  statusFasilitas: string
  ketergantungan: string
}

// ─── Columns ─────────────────────────────────────────────────────

const columns: ColumnDef<Fasilitas>[] = [
  {
    accessorKey: "kdFasilitas",
    header: ({ column }) => <SortableHeader column={column} label="Kode" />,
  },
  {
    accessorKey: "nmFasilitas",
    header: ({ column }) => <SortableHeader column={column} label="Nama" />,
  },
  {
    accessorKey: "satuanFasilitas",
    header: "Satuan",
  },
  {
    accessorKey: "nilaiFasilitas",
    header: ({ column }) => <SortableHeader column={column} label="Nilai" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatRupiah(row.original.nilaiFasilitas)}
      </span>
    ),
  },
  {
    accessorKey: "statusFasilitas",
    header: "Status",
    cell: ({ row }) => {
      const aktif = row.original.statusFasilitas === "1"
      return (
        <Badge variant={aktif ? "default" : "secondary"}>
          {aktif ? "Aktif" : "Nonaktif"}
        </Badge>
      )
    },
  },
]

// ─── Page ────────────────────────────────────────────────────────

export default function FasilitasPage() {
  const orpc = useORPC()

  const fasilitasQuery = useQuery(orpc.klasifikasi.listFasilitas.queryOptions())

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Fasilitas</h1>
        <p className="text-muted-foreground">
          Data master fasilitas bangunan beserta satuan dan nilai.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={fasilitasQuery.data ?? []}
        isLoading={fasilitasQuery.isLoading}
        searchColumn="nmFasilitas"
        searchPlaceholder="Cari fasilitas..."
        emptyMessage="Tidak ada data fasilitas."
        // TODO: Add/Edit/Delete buttons — need mutation endpoints for fasilitas CRUD
      />
    </div>
  )
}
