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

// ─── Types ───────────────────────────────────────────────────────

type Tarif = {
  id: number
  thnAwal: number
  thnAkhir: number | null
  njopMin: string
  njopMax: string
  nilaiTarif: string
}

// ─── Columns ─────────────────────────────────────────────────────

const columns: ColumnDef<Tarif>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "thnAwal",
    header: ({ column }) => <SortableHeader column={column} label="Tahun Awal" />,
  },
  {
    accessorKey: "thnAkhir",
    header: ({ column }) => <SortableHeader column={column} label="Tahun Akhir" />,
    cell: ({ row }) => row.original.thnAkhir ?? "-",
  },
  {
    accessorKey: "njopMin",
    header: ({ column }) => <SortableHeader column={column} label="NJOP Min" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{formatRupiah(row.original.njopMin)}</span>
    ),
  },
  {
    accessorKey: "njopMax",
    header: ({ column }) => <SortableHeader column={column} label="NJOP Max" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{formatRupiah(row.original.njopMax)}</span>
    ),
  },
  {
    accessorKey: "nilaiTarif",
    header: ({ column }) => <SortableHeader column={column} label="Nilai Tarif (%)" />,
    cell: ({ row }) => {
      const val = parseFloat(row.original.nilaiTarif)
      return (
        <span className="font-mono text-sm font-semibold">
          {isNaN(val) ? "-" : `${(val * 100).toFixed(2)}%`}
        </span>
      )
    },
  },
]

// ─── Page ────────────────────────────────────────────────────────

export default function TarifPage() {
  const orpc = useORPC()

  const tarifQuery = useQuery(orpc.klasifikasi.listTarif.queryOptions())

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Tarif PBB</h1>
        <p className="text-muted-foreground">
          Pengaturan tarif Pajak Bumi dan Bangunan berdasarkan rentang tahun dan NJOP.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={tarifQuery.data ?? []}
        isLoading={tarifQuery.isLoading}
        emptyMessage="Tidak ada data tarif."
        // TODO: Add/Edit/Delete buttons — need mutation endpoints for tarif CRUD
      />
    </div>
  )
}
