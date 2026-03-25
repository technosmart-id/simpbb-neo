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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Types ───────────────────────────────────────────────────────

type KelasBumi = {
  kelasBumi: string
  nilaiMinimum: string
  nilaiMaksimum: string
  njopBumi: string
}

type KelasBangunan = {
  kelasBangunan: string
  nilaiMinimum: string
  nilaiMaksimum: string
  njopBangunan: string
}

// ─── Columns ─────────────────────────────────────────────────────

const kelasBumiColumns: ColumnDef<KelasBumi>[] = [
  {
    accessorKey: "kelasBumi",
    header: ({ column }) => <SortableHeader column={column} label="Kelas" />,
  },
  {
    accessorKey: "nilaiMinimum",
    header: ({ column }) => <SortableHeader column={column} label="Nilai Minimum" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatRupiah(row.original.nilaiMinimum)}
      </span>
    ),
  },
  {
    accessorKey: "nilaiMaksimum",
    header: ({ column }) => <SortableHeader column={column} label="Nilai Maksimum" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatRupiah(row.original.nilaiMaksimum)}
      </span>
    ),
  },
  {
    accessorKey: "njopBumi",
    header: ({ column }) => <SortableHeader column={column} label="NJOP Bumi" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {formatRupiah(row.original.njopBumi)}
      </span>
    ),
  },
]

const kelasBangunanColumns: ColumnDef<KelasBangunan>[] = [
  {
    accessorKey: "kelasBangunan",
    header: ({ column }) => <SortableHeader column={column} label="Kelas" />,
  },
  {
    accessorKey: "nilaiMinimum",
    header: ({ column }) => <SortableHeader column={column} label="Nilai Minimum" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatRupiah(row.original.nilaiMinimum)}
      </span>
    ),
  },
  {
    accessorKey: "nilaiMaksimum",
    header: ({ column }) => <SortableHeader column={column} label="Nilai Maksimum" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatRupiah(row.original.nilaiMaksimum)}
      </span>
    ),
  },
  {
    accessorKey: "njopBangunan",
    header: ({ column }) => <SortableHeader column={column} label="NJOP Bangunan" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {formatRupiah(row.original.njopBangunan)}
      </span>
    ),
  },
]

// ─── Page ────────────────────────────────────────────────────────

export default function KlasifikasiPage() {
  const orpc = useORPC()

  const kelasBumiQuery = useQuery(orpc.klasifikasi.listKelasBumi.queryOptions())
  const kelasBangunanQuery = useQuery(orpc.klasifikasi.listKelasBangunan.queryOptions())

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Klasifikasi</h1>
        <p className="text-muted-foreground">
          Data klasifikasi Kelas Bumi dan Kelas Bangunan beserta nilai NJOP.
        </p>
      </div>

      <Tabs defaultValue="bumi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bumi">Kelas Bumi</TabsTrigger>
          <TabsTrigger value="bangunan">Kelas Bangunan</TabsTrigger>
        </TabsList>

        <TabsContent value="bumi">
          <DataTable
            columns={kelasBumiColumns}
            data={kelasBumiQuery.data ?? []}
            isLoading={kelasBumiQuery.isLoading}
            searchColumn="kelasBumi"
            searchPlaceholder="Cari kelas bumi..."
            emptyMessage="Tidak ada data kelas bumi."
            // TODO: Add/Edit/Delete buttons — need mutation endpoints for kelas bumi
          />
        </TabsContent>

        <TabsContent value="bangunan">
          <DataTable
            columns={kelasBangunanColumns}
            data={kelasBangunanQuery.data ?? []}
            isLoading={kelasBangunanQuery.isLoading}
            searchColumn="kelasBangunan"
            searchPlaceholder="Cari kelas bangunan..."
            emptyMessage="Tidak ada data kelas bangunan."
            // TODO: Add/Edit/Delete buttons — need mutation endpoints for kelas bangunan
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
