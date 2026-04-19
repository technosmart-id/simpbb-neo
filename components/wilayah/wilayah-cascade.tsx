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
  kdBlok?: string
  kdZnt?: string
}

interface WilayahCascadeProps {
  value?: Partial<WilayahValue>
  onChange?: (value: WilayahValue) => void
  /** Show only up to a specific level */
  maxLevel?: "propinsi" | "dati2" | "kecamatan" | "kelurahan" | "blok" | "znt"
  disabled?: boolean
  className?: string
  /** Layout direction */
  orientation?: "horizontal" | "vertical"
}

/**
 * Cascading dropdown: Provinsi -> Kab/Kota -> Kecamatan -> Kelurahan -> Blok -> ZNT
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
  const [blok, setBlok] = React.useState(value?.kdBlok ?? "")
  const [znt, setZnt] = React.useState(value?.kdZnt ?? "")

  // Sync from external value
  React.useEffect(() => {
    if (value?.kdPropinsi !== undefined) setPropinsi(value.kdPropinsi)
    if (value?.kdDati2 !== undefined) setDati2(value.kdDati2)
    if (value?.kdKecamatan !== undefined) setKecamatan(value.kdKecamatan)
    if (value?.kdKelurahan !== undefined) setKelurahan(value.kdKelurahan)
    if (value?.kdBlok !== undefined) setBlok(value.kdBlok)
    if (value?.kdZnt !== undefined) setZnt(value.kdZnt)
  }, [value?.kdPropinsi, value?.kdDati2, value?.kdKecamatan, value?.kdKelurahan, value?.kdBlok, value?.kdZnt])

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

  const blokQuery = useQuery({
    ...orpc.wilayah.listBlok.queryOptions({
      input: { kdPropinsi: propinsi, kdDati2: dati2, kdKecamatan: kecamatan, kdKelurahan: kelurahan },
    }),
    enabled: !!propinsi && !!dati2 && !!kecamatan && !!kelurahan && (maxLevel === "blok" || maxLevel === "znt"),
  })

  const zntQuery = useQuery({
    ...orpc.wilayah.listZnt.queryOptions({
      input: { kdPropinsi: propinsi, kdDati2: dati2, kdKecamatan: kecamatan, kdKelurahan: kelurahan },
    }),
    enabled: !!propinsi && !!dati2 && !!kecamatan && !!kelurahan && maxLevel === "znt",
  })

  const levels = ["propinsi", "dati2", "kecamatan", "kelurahan", "blok", "znt"] as const
  const maxIdx = levels.indexOf(maxLevel)

  const notifyChange = (p: string, d: string, k: string, l: string, b?: string, z?: string) => {
    if (p && d && k && l) {
      onChange?.({ kdPropinsi: p, kdDati2: d, kdKecamatan: k, kdKelurahan: l, kdBlok: b, kdZnt: z })
    }
  }

  const handlePropinsiChange = (v: string) => {
    setPropinsi(v)
    setDati2("")
    setKecamatan("")
    setKelurahan("")
    setBlok("")
    setZnt("")
  }

  const handleDati2Change = (v: string) => {
    setDati2(v)
    setKecamatan("")
    setKelurahan("")
    setBlok("")
    setZnt("")
  }

  const handleKecamatanChange = (v: string) => {
    setKecamatan(v)
    setKelurahan("")
    setBlok("")
    setZnt("")
  }

  const handleKelurahanChange = (v: string) => {
    setKelurahan(v)
    setBlok("")
    setZnt("")
    notifyChange(propinsi, dati2, kecamatan, v, "", "")
  }

  const handleBlokChange = (v: string) => {
    setBlok(v)
    setZnt("")
    notifyChange(propinsi, dati2, kecamatan, kelurahan, v, "")
  }

  const handleZntChange = (v: string) => {
    setZnt(v)
    notifyChange(propinsi, dati2, kecamatan, kelurahan, blok, v)
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

      {/* Blok */}
      {maxIdx >= 4 && (
        <div className="space-y-1 min-w-[120px]">
          <label className="text-xs text-muted-foreground">Blok</label>
          <Select
            value={blok}
            onValueChange={handleBlokChange}
            disabled={disabled || !kelurahan}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Blok" />
            </SelectTrigger>
            <SelectContent>
              {blokQuery.data?.map((b) => (
                <SelectItem key={b.kdBlok} value={b.kdBlok}>
                  {b.kdBlok}
                </SelectItem>
              ))}
              {blokQuery.data?.length === 0 && !blokQuery.isLoading && (
                <SelectItem value="_empty" disabled>Tidak ada blok</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ZNT */}
      {maxIdx >= 5 && (
        <div className="space-y-1 min-w-[100px]">
          <label className="text-xs text-muted-foreground">ZNT</label>
          <Select
            value={znt}
            onValueChange={handleZntChange}
            disabled={disabled || !kelurahan}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih ZNT" />
            </SelectTrigger>
            <SelectContent>
              {zntQuery.data?.map((z) => (
                <SelectItem key={z.kdZnt} value={z.kdZnt!}>
                  {z.kdZnt}
                </SelectItem>
              ))}
              {zntQuery.data?.length === 0 && !zntQuery.isLoading && (
                <SelectItem value="_empty" disabled>Tidak ada ZNT</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
