"use client"

import * as React from "react"
import {
  Search,
  ChevronRight,
  MapPin,
  User,
  Loader2,
  ArrowLeft
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useORPC } from "@/lib/orpc/react"
import { useQuery } from "@tanstack/react-query"
import { formatNop, type NopParts } from "@/lib/utils/nop"
import { cn } from "@/lib/utils"

interface NopSearchDialogProps {
  onSelect: (nop: NopParts, details?: any) => void
  trigger?: React.ReactNode
}

export function NopSearchDialog({ onSelect, trigger }: NopSearchDialogProps) {
  const [open, setOpen] = React.useState(false)
  const orpc = useORPC()
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [kdPropinsi, setKdPropinsi] = React.useState<string | undefined>()
  const [kdDati2, setKdDati2] = React.useState<string | undefined>()
  const [kdKecamatan, setKdKecamatan] = React.useState<string | undefined>("ALL")
  const [kdKelurahan, setKdKelurahan] = React.useState<string | undefined>("ALL")
  const limit = 10

  const deferredSearch = React.useDeferredValue(search)

  // ── Filters Data ──
  const { data: propinsiList } = useQuery(orpc.wilayah.listPropinsi.queryOptions())
  const { data: dati2List } = useQuery({
    ...orpc.wilayah.listDati2.queryOptions({
      input: { kdPropinsi: kdPropinsi || "" },
    }),
    enabled: !!kdPropinsi,
  })
  const { data: kecamatanList } = useQuery({
    ...orpc.wilayah.listKecamatan.queryOptions({
      input: { kdPropinsi: kdPropinsi || "", kdDati2: kdDati2 || "" },
    }),
    enabled: !!kdPropinsi && !!kdDati2,
  })
  const { data: kelurahanList } = useQuery({
    ...orpc.wilayah.listKelurahan.queryOptions({
      input: {
        kdPropinsi: kdPropinsi || "",
        kdDati2: kdDati2 || "",
        kdKecamatan: kdKecamatan !== "ALL" ? kdKecamatan || "" : "",
      },
    }),
    enabled: !!kdPropinsi && !!kdDati2 && kdKecamatan !== "ALL",
  })

  // ── Set Initial Defaults ──
  React.useEffect(() => {
    if (propinsiList?.[0] && !kdPropinsi) {
      setKdPropinsi(propinsiList[0].kdPropinsi)
    }
  }, [propinsiList, kdPropinsi])

  React.useEffect(() => {
    if (dati2List?.[0] && !kdDati2) {
      setKdDati2(dati2List[0].kdDati2)
    }
  }, [dati2List, kdDati2])

  const { data, isLoading } = useQuery({
    ...orpc.objekPajak.listDetails.queryOptions({
      input: {
        search: deferredSearch,
        kdPropinsi: kdPropinsi,
        kdDati2: kdDati2,
        kdKecamatan: kdKecamatan === "ALL" ? undefined : kdKecamatan,
        kdKelurahan: kdKelurahan === "ALL" ? undefined : kdKelurahan,
        limit,
        offset: (page - 1) * limit,
      },
    }),
    enabled: open && !!kdPropinsi && !!kdDati2,
  })

  const totalPages = Math.ceil((data?.total || 0) / limit)

  const handleSelect = (row: any) => {
    const parts: NopParts = {
      kdPropinsi: row.kdPropinsi,
      kdDati2: row.kdDati2,
      kdKecamatan: row.kdKecamatan,
      kdKelurahan: row.kdKelurahan,
      kdBlok: row.kdBlok,
      noUrut: row.noUrut,
      kdJnsOp: row.kdJnsOp,
    }
    onSelect(parts, row)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" type="button">
            <Search className="h-4 w-4 mr-2" />
            Cari Objek Pajak
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Cari Objek Pajak (NOP)</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
            {/* Propinsi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Propinsi</label>
              <Select value={kdPropinsi} onValueChange={(v) => { setKdPropinsi(v); setKdDati2(undefined); setKdKecamatan("ALL"); setKdKelurahan("ALL"); setPage(1); }}>
                <SelectTrigger className="h-9 bg-background border-muted shadow-sm">
                  <SelectValue placeholder="Pilih Propinsi" />
                </SelectTrigger>
                <SelectContent>
                  {propinsiList?.map((p) => (
                    <SelectItem key={p.kdPropinsi} value={p.kdPropinsi}>{p.nmPropinsi}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dati2 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kota/Kabupaten</label>
              <Select value={kdDati2} onValueChange={(v) => { setKdDati2(v); setKdKecamatan("ALL"); setKdKelurahan("ALL"); setPage(1); }}>
                <SelectTrigger className="h-9 bg-background border-muted shadow-sm">
                  <SelectValue placeholder="Pilih Kota/Kab" />
                </SelectTrigger>
                <SelectContent>
                  {dati2List?.map((d) => (
                    <SelectItem key={d.kdDati2} value={d.kdDati2}>{d.nmDati2}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kecamatan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kecamatan</label>
              <Select value={kdKecamatan} onValueChange={(v) => { setKdKecamatan(v); setKdKelurahan("ALL"); setPage(1); }}>
                <SelectTrigger className="h-9 bg-background border-muted shadow-sm">
                  <SelectValue placeholder="Semua Kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">SEMUA KECAMATAN</SelectItem>
                  {kecamatanList?.map((k) => (
                    <SelectItem key={k.kdKecamatan} value={k.kdKecamatan}>{k.nmKecamatan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kelurahan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kelurahan</label>
              <Select value={kdKelurahan} onValueChange={(v) => { setKdKelurahan(v); setPage(1); }}>
                <SelectTrigger className="h-9 bg-background border-muted shadow-sm">
                  <SelectValue placeholder="Semua Kelurahan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">SEMUA KELURAHAN</SelectItem>
                  {kelurahanList?.map((k) => (
                    <SelectItem key={k.kdKelurahan} value={k.kdKelurahan}>{k.nmKelurahan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari NOP/Nama..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9 h-9 bg-background border-muted shadow-sm focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-muted/50 overflow-hidden bg-background min-h-[400px]">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-muted/50">
                  <TableHead className="w-[200px] font-bold text-foreground">NOP</TableHead>
                  <TableHead className="font-bold text-foreground">Wajib Pajak & Alamat</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-6 w-full bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-full bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-full bg-muted animate-pulse rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.rows.map((row) => (
                  <TableRow
                    key={formatNop(row)}
                    className="group cursor-pointer hover:bg-primary/5 transition-colors border-muted/50"
                    onClick={() => handleSelect(row)}
                  >
                    <TableCell className="py-3">
                      <span className="font-mono font-bold text-primary tracking-tighter text-sm">
                        {formatNop(row)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-bold text-xs truncate uppercase">{row.nmWpSppt || "—"}</span>
                        </div>
                        <div className="flex items-start gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-[10px] text-muted-foreground line-clamp-1 uppercase">{row.jalanOp}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4 text-primary" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && data?.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                      Data tidak ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-muted-foreground font-medium">
              Menampilkan <span className="text-foreground">{(page - 1) * limit + 1}</span> - <span className="text-foreground">{Math.min(page * limit, data?.total || 0)}</span> dari <span className="text-foreground">{data?.total || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-7 w-7 p-0"
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                  const p = i + 1
                  return (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={cn("h-7 w-7 p-0 text-[10px] font-bold", page === p && "shadow-lg shadow-primary/20")}
                    >
                      {p}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
