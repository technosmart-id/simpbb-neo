"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface WilayahValue {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
}

interface WilayahCascadeProps {
  value?: Partial<WilayahValue>
  onChange?: (value: WilayahValue) => void
  /** Show only up to a specific level */
  maxLevel?: "propinsi" | "dati2" | "kecamatan" | "kelurahan"
  disabled?: boolean
  className?: string
  /** Layout direction */
  orientation?: "horizontal" | "vertical"
}

/**
 * Cascading dropdown: Provinsi -> Kab/Kota -> Kecamatan -> Kelurahan
 * Each level auto-fetches options based on parent selection
 */
export function WilayahCascade({
  value,
  onChange,
  maxLevel = "kelurahan",
  disabled,
  className,
  orientation = "horizontal",
}: WilayahCascadeProps) {
  const orpc = useORPC()

  const [propinsi, setPropinsi] = React.useState(value?.kdPropinsi ?? "")
  const [dati2, setDati2] = React.useState(value?.kdDati2 ?? "")
  const [kecamatan, setKecamatan] = React.useState(value?.kdKecamatan ?? "")
  const [kelurahan, setKelurahan] = React.useState(value?.kdKelurahan ?? "")

  // Sync from external value
  React.useEffect(() => {
    if (value?.kdPropinsi !== undefined) setPropinsi(value.kdPropinsi)
    if (value?.kdDati2 !== undefined) setDati2(value.kdDati2)
    if (value?.kdKecamatan !== undefined) setKecamatan(value.kdKecamatan)
    if (value?.kdKelurahan !== undefined) setKelurahan(value.kdKelurahan)
  }, [value?.kdPropinsi, value?.kdDati2, value?.kdKecamatan, value?.kdKelurahan])

  // Data queries
  const propinsiQuery = useQuery(orpc.wilayah.listPropinsi.queryOptions())

  const dati2Query = useQuery({
    ...orpc.wilayah.listDati2.queryOptions({
      input: { kdPropinsi: propinsi },
    }),
    enabled: !!propinsi,
  })

  const kecamatanQuery = useQuery({
    ...orpc.wilayah.listKecamatan.queryOptions({
      input: { kdPropinsi: propinsi, kdDati2: dati2 },
    }),
    enabled: !!propinsi && !!dati2,
  })

  const kelurahanQuery = useQuery({
    ...orpc.wilayah.listKelurahan.queryOptions({
      input: { kdPropinsi: propinsi, kdDati2: dati2, kdKecamatan: kecamatan },
    }),
    enabled: !!propinsi && !!dati2 && !!kecamatan,
  })

  const levels = ["propinsi", "dati2", "kecamatan", "kelurahan"] as const
  const maxIdx = levels.indexOf(maxLevel)

  const notifyChange = (p: string, d: string, k: string, l: string) => {
    if (p && d && k && l) {
      onChange?.({ kdPropinsi: p, kdDati2: d, kdKecamatan: k, kdKelurahan: l })
    }
  }

  const handlePropinsiChange = (v: string) => {
    setPropinsi(v)
    setDati2("")
    setKecamatan("")
    setKelurahan("")
  }

  const handleDati2Change = (v: string) => {
    setDati2(v)
    setKecamatan("")
    setKelurahan("")
  }

  const handleKecamatanChange = (v: string) => {
    setKecamatan(v)
    setKelurahan("")
  }

  const handleKelurahanChange = (v: string) => {
    setKelurahan(v)
    notifyChange(propinsi, dati2, kecamatan, v)
  }

  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? "flex flex-wrap items-end gap-2"
          : "flex flex-col gap-2",
        className,
      )}
    >
      {/* Provinsi */}
      <div className="space-y-1 min-w-[160px]">
        <label className="text-xs text-muted-foreground">Provinsi</label>
        <Select value={propinsi} onValueChange={handlePropinsiChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Provinsi" />
          </SelectTrigger>
          <SelectContent>
            {propinsiQuery.data?.map((p) => (
              <SelectItem key={p.kdPropinsi} value={p.kdPropinsi}>
                {p.kdPropinsi} - {p.nmPropinsi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kab/Kota */}
      {maxIdx >= 1 && (
        <div className="space-y-1 min-w-[160px]">
          <label className="text-xs text-muted-foreground">Kab/Kota</label>
          <Select
            value={dati2}
            onValueChange={handleDati2Change}
            disabled={disabled || !propinsi}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kab/Kota" />
            </SelectTrigger>
            <SelectContent>
              {dati2Query.data?.map((d) => (
                <SelectItem key={d.kdDati2} value={d.kdDati2}>
                  {d.kdDati2} - {d.nmDati2}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Kecamatan */}
      {maxIdx >= 2 && (
        <div className="space-y-1 min-w-[160px]">
          <label className="text-xs text-muted-foreground">Kecamatan</label>
          <Select
            value={kecamatan}
            onValueChange={handleKecamatanChange}
            disabled={disabled || !dati2}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              {kecamatanQuery.data?.map((k) => (
                <SelectItem key={k.kdKecamatan} value={k.kdKecamatan}>
                  {k.kdKecamatan} - {k.nmKecamatanOnly}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Kelurahan */}
      {maxIdx >= 3 && (
        <div className="space-y-1 min-w-[160px]">
          <label className="text-xs text-muted-foreground">Kelurahan</label>
          <Select
            value={kelurahan}
            onValueChange={handleKelurahanChange}
            disabled={disabled || !kecamatan}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kelurahan" />
            </SelectTrigger>
            <SelectContent>
              {kelurahanQuery.data?.map((k) => (
                <SelectItem key={k.kdKelurahan} value={k.kdKelurahan}>
                  {k.kdKelurahan} - {k.nmKelurahanOnly}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
