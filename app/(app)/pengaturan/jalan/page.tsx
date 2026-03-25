"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { SortableHeader } from "@/components/data-table/column-helpers"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Types ───────────────────────────────────────────────────────

type Jalan = {
  id: number
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  nmJalan: string
}

// ─── Columns ─────────────────────────────────────────────────────

const columns: ColumnDef<Jalan>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nmJalan",
    header: ({ column }) => <SortableHeader column={column} label="Nama Jalan" />,
  },
]

// ─── Page ────────────────────────────────────────────────────────

export default function JalanPage() {
  const orpc = useORPC()

  // Cascading wilayah filters
  const [kdPropinsi, setKdPropinsi] = React.useState("")
  const [kdDati2, setKdDati2] = React.useState("")
  const [kdKecamatan, setKdKecamatan] = React.useState("")
  const [kdKelurahan, setKdKelurahan] = React.useState("")

  const propinsiQuery = useQuery(orpc.wilayah.listPropinsi.queryOptions())

  const dati2Query = useQuery(
    orpc.wilayah.listDati2.queryOptions({
      input: { kdPropinsi },
    }),
  )

  const kecamatanQuery = useQuery(
    orpc.wilayah.listKecamatan.queryOptions({
      input: { kdPropinsi, kdDati2 },
    }),
  )

  const kelurahanQuery = useQuery(
    orpc.wilayah.listKelurahan.queryOptions({
      input: { kdPropinsi, kdDati2, kdKecamatan },
    }),
  )

  const allSelected = kdPropinsi && kdDati2 && kdKecamatan && kdKelurahan

  const jalanQuery = useQuery(
    orpc.wilayah.listJalan.queryOptions({
      input: { kdPropinsi, kdDati2, kdKecamatan, kdKelurahan },
    }),
  )

  const handlePropinsiChange = (val: string) => {
    setKdPropinsi(val)
    setKdDati2("")
    setKdKecamatan("")
    setKdKelurahan("")
  }

  const handleDati2Change = (val: string) => {
    setKdDati2(val)
    setKdKecamatan("")
    setKdKelurahan("")
  }

  const handleKecamatanChange = (val: string) => {
    setKdKecamatan(val)
    setKdKelurahan("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Jalan</h1>
        <p className="text-muted-foreground">
          Data referensi jalan per wilayah kelurahan.
        </p>
      </div>

      {/* Wilayah Cascade Filter */}
      <div className="rounded-md border bg-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-56">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Propinsi
            </label>
            <Select value={kdPropinsi} onValueChange={handlePropinsiChange}>
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

          <div className="w-56">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Dati2
            </label>
            <Select
              value={kdDati2}
              onValueChange={handleDati2Change}
              disabled={!kdPropinsi}
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

          <div className="w-56">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Kecamatan
            </label>
            <Select
              value={kdKecamatan}
              onValueChange={handleKecamatanChange}
              disabled={!kdDati2}
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

          <div className="w-56">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Kelurahan
            </label>
            <Select
              value={kdKelurahan}
              onValueChange={setKdKelurahan}
              disabled={!kdKecamatan}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kelurahan" />
              </SelectTrigger>
              <SelectContent>
                {(kelurahanQuery.data ?? []).map((k) => (
                  <SelectItem key={k.kdKelurahan} value={k.kdKelurahan}>
                    {k.kdKelurahan} - {k.nmKelurahan ?? k.nmKelurahanOnly}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {allSelected ? (
        <DataTable
          columns={columns}
          data={jalanQuery.data ?? []}
          isLoading={jalanQuery.isLoading}
          searchColumn="nmJalan"
          searchPlaceholder="Cari nama jalan..."
          emptyMessage="Tidak ada data jalan untuk wilayah ini."
          // TODO: Add/Edit/Delete buttons — need mutation endpoints for jalan CRUD
        />
      ) : (
        <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
          Pilih Propinsi, Dati2, Kecamatan, dan Kelurahan untuk melihat data jalan.
        </div>
      )}
    </div>
  )
}
