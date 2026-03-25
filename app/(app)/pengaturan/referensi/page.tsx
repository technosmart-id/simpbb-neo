"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { SortableHeader } from "@/components/data-table/column-helpers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Types ───────────────────────────────────────────────────────

type Propinsi = {
  kdPropinsi: string
  nmPropinsi: string
}

type Dati2 = {
  kdPropinsi: string
  kdDati2: string
  nmDati2: string
}

type Kecamatan = {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  nmKecamatan: string | null
  nmKecamatanOnly: string
}

type Kelurahan = {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdSektor: string
  nmKelurahan: string | null
  nmKelurahanOnly: string
  noKelurahan: number | null
  kdPosKelurahan: string | null
}

// ─── Columns ─────────────────────────────────────────────────────

const propinsiColumns: ColumnDef<Propinsi>[] = [
  {
    accessorKey: "kdPropinsi",
    header: ({ column }) => <SortableHeader column={column} label="Kode" />,
  },
  {
    accessorKey: "nmPropinsi",
    header: ({ column }) => <SortableHeader column={column} label="Nama Propinsi" />,
  },
]

const dati2Columns: ColumnDef<Dati2>[] = [
  {
    accessorKey: "kdPropinsi",
    header: "Kd Propinsi",
  },
  {
    accessorKey: "kdDati2",
    header: ({ column }) => <SortableHeader column={column} label="Kode" />,
  },
  {
    accessorKey: "nmDati2",
    header: ({ column }) => <SortableHeader column={column} label="Nama Dati2" />,
  },
]

const kecamatanColumns: ColumnDef<Kecamatan>[] = [
  {
    accessorKey: "kdKecamatan",
    header: ({ column }) => <SortableHeader column={column} label="Kode" />,
  },
  {
    accessorKey: "nmKecamatan",
    header: ({ column }) => <SortableHeader column={column} label="Nama Kecamatan" />,
    cell: ({ row }) => row.original.nmKecamatan ?? row.original.nmKecamatanOnly,
  },
]

const kelurahanColumns: ColumnDef<Kelurahan>[] = [
  {
    accessorKey: "kdKelurahan",
    header: ({ column }) => <SortableHeader column={column} label="Kode" />,
  },
  {
    accessorKey: "nmKelurahan",
    header: ({ column }) => <SortableHeader column={column} label="Nama Kelurahan" />,
    cell: ({ row }) => row.original.nmKelurahan ?? row.original.nmKelurahanOnly,
  },
  {
    accessorKey: "kdSektor",
    header: "Kd Sektor",
  },
  {
    accessorKey: "kdPosKelurahan",
    header: "Kode Pos",
    cell: ({ row }) => row.original.kdPosKelurahan ?? "-",
  },
]

// ─── Page ────────────────────────────────────────────────────────

export default function ReferensiWilayahPage() {
  const orpc = useORPC()

  // Cascading filters
  const [selectedPropinsi, setSelectedPropinsi] = React.useState<string>("")
  const [selectedDati2, setSelectedDati2] = React.useState<string>("")
  const [selectedKecamatan, setSelectedKecamatan] = React.useState<string>("")

  // Queries
  const propinsiQuery = useQuery(orpc.wilayah.listPropinsi.queryOptions())

  const dati2Query = useQuery(
    orpc.wilayah.listDati2.queryOptions({
      input: { kdPropinsi: selectedPropinsi },
    }),
  )

  const kecamatanQuery = useQuery(
    orpc.wilayah.listKecamatan.queryOptions({
      input: { kdPropinsi: selectedPropinsi, kdDati2: selectedDati2 },
    }),
  )

  const kelurahanQuery = useQuery(
    orpc.wilayah.listKelurahan.queryOptions({
      input: {
        kdPropinsi: selectedPropinsi,
        kdDati2: selectedDati2,
        kdKecamatan: selectedKecamatan,
      },
    }),
  )

  // Reset child selections on parent change
  const handlePropinsiChange = (val: string) => {
    setSelectedPropinsi(val)
    setSelectedDati2("")
    setSelectedKecamatan("")
  }

  const handleDati2Change = (val: string) => {
    setSelectedDati2(val)
    setSelectedKecamatan("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Referensi Wilayah</h1>
        <p className="text-muted-foreground">
          Data master wilayah: Propinsi, Dati2 (Kabupaten/Kota), Kecamatan, dan Kelurahan.
        </p>
      </div>

      <Tabs defaultValue="propinsi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="propinsi">Propinsi</TabsTrigger>
          <TabsTrigger value="dati2">Dati2</TabsTrigger>
          <TabsTrigger value="kecamatan">Kecamatan</TabsTrigger>
          <TabsTrigger value="kelurahan">Kelurahan</TabsTrigger>
        </TabsList>

        {/* ── Propinsi Tab ─────────────────────────── */}
        <TabsContent value="propinsi">
          <DataTable
            columns={propinsiColumns}
            data={propinsiQuery.data ?? []}
            isLoading={propinsiQuery.isLoading}
            searchColumn="nmPropinsi"
            searchPlaceholder="Cari propinsi..."
            emptyMessage="Tidak ada data propinsi."
            // TODO: Add/Edit/Delete buttons — need mutation endpoints
          />
        </TabsContent>

        {/* ── Dati2 Tab ────────────────────────────── */}
        <TabsContent value="dati2">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Select value={selectedPropinsi} onValueChange={handlePropinsiChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Propinsi" />
                  </SelectTrigger>
                  <SelectContent>
                    {(propinsiQuery.data ?? []).map((p) => (
                      <SelectItem key={p.kdPropinsi} value={p.kdPropinsi}>
                        {p.kdPropinsi} - {p.nmPropinsi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPropinsi ? (
              <DataTable
                columns={dati2Columns}
                data={dati2Query.data ?? []}
                isLoading={dati2Query.isLoading}
                searchColumn="nmDati2"
                searchPlaceholder="Cari dati2..."
                emptyMessage="Tidak ada data dati2."
                // TODO: Add/Edit/Delete buttons — need mutation endpoints
              />
            ) : (
              <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
                Pilih Propinsi terlebih dahulu untuk melihat data Dati2.
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Kecamatan Tab ────────────────────────── */}
        <TabsContent value="kecamatan">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Select value={selectedPropinsi} onValueChange={handlePropinsiChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Propinsi" />
                  </SelectTrigger>
                  <SelectContent>
                    {(propinsiQuery.data ?? []).map((p) => (
                      <SelectItem key={p.kdPropinsi} value={p.kdPropinsi}>
                        {p.kdPropinsi} - {p.nmPropinsi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-64">
                <Select
                  value={selectedDati2}
                  onValueChange={handleDati2Change}
                  disabled={!selectedPropinsi}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Dati2" />
                  </SelectTrigger>
                  <SelectContent>
                    {(dati2Query.data ?? []).map((d) => (
                      <SelectItem key={d.kdDati2} value={d.kdDati2}>
                        {d.kdDati2} - {d.nmDati2}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPropinsi && selectedDati2 ? (
              <DataTable
                columns={kecamatanColumns}
                data={kecamatanQuery.data ?? []}
                isLoading={kecamatanQuery.isLoading}
                searchColumn="nmKecamatan"
                searchPlaceholder="Cari kecamatan..."
                emptyMessage="Tidak ada data kecamatan."
                // TODO: Add/Edit/Delete buttons — need mutation endpoints
              />
            ) : (
              <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
                Pilih Propinsi dan Dati2 terlebih dahulu untuk melihat data Kecamatan.
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Kelurahan Tab ────────────────────────── */}
        <TabsContent value="kelurahan">
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-64">
                <Select value={selectedPropinsi} onValueChange={handlePropinsiChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Propinsi" />
                  </SelectTrigger>
                  <SelectContent>
                    {(propinsiQuery.data ?? []).map((p) => (
                      <SelectItem key={p.kdPropinsi} value={p.kdPropinsi}>
                        {p.kdPropinsi} - {p.nmPropinsi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-64">
                <Select
                  value={selectedDati2}
                  onValueChange={handleDati2Change}
                  disabled={!selectedPropinsi}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Dati2" />
                  </SelectTrigger>
                  <SelectContent>
                    {(dati2Query.data ?? []).map((d) => (
                      <SelectItem key={d.kdDati2} value={d.kdDati2}>
                        {d.kdDati2} - {d.nmDati2}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-64">
                <Select
                  value={selectedKecamatan}
                  onValueChange={setSelectedKecamatan}
                  disabled={!selectedDati2}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {(kecamatanQuery.data ?? []).map((k) => (
                      <SelectItem key={k.kdKecamatan} value={k.kdKecamatan}>
                        {k.kdKecamatan} - {k.nmKecamatan ?? k.nmKecamatanOnly}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPropinsi && selectedDati2 && selectedKecamatan ? (
              <DataTable
                columns={kelurahanColumns}
                data={kelurahanQuery.data ?? []}
                isLoading={kelurahanQuery.isLoading}
                searchColumn="nmKelurahan"
                searchPlaceholder="Cari kelurahan..."
                emptyMessage="Tidak ada data kelurahan."
                // TODO: Add/Edit/Delete buttons — need mutation endpoints
              />
            ) : (
              <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
                Pilih Propinsi, Dati2, dan Kecamatan terlebih dahulu untuk melihat data Kelurahan.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
