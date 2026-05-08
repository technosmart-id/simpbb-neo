'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { NopDisplay } from '@/components/nop/nop-display'
import { PembayaranBadge } from '@/components/status/pembayaran-badge'
import { WilayahCascade, type WilayahValue } from '@/components/wilayah/wilayah-cascade'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Printer, Download, Loader2 } from 'lucide-react'
import { formatRupiah } from '@/components/data-table/column-helpers'
import { type SpptData } from '@/lib/utils/pdf/sppt-generator'
import { parseNop } from '@/lib/utils/nop'

type SpptRow = {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
  thnPajakSppt: number
  nmWp: string | null
  jalanWp: string | null
  luasBumi: string | number | null
  njopBumi: string | number | null
  luasBng: string | number | null
  njopBng: string | number | null
  njopSppt: string | number | null
  njoptkpSppt: string | number | null
  njkpSppt: string | number | null
  pbbTerhutangSppt: string | number | null
  faktorPengurangSppt: string | number | null
  pbbYgHarusDibayarSppt: string | number
  tglJatuhTempo: Date | string | null
  statusPembayaranSppt: string | number
  statusCetakSppt: string | number
}

const PAGE_SIZE = 20

function buildSpptData(row: SpptRow): SpptData {
  const nopRaw = `${row.kdPropinsi}${row.kdDati2}${row.kdKecamatan}${row.kdKelurahan}${row.kdBlok}${row.noUrut}${row.kdJnsOp}`
  const nopParts = parseNop(nopRaw) ?? {
    kdPropinsi: row.kdPropinsi,
    kdDati2: row.kdDati2,
    kdKecamatan: row.kdKecamatan,
    kdKelurahan: row.kdKelurahan,
    kdBlok: row.kdBlok,
    noUrut: row.noUrut,
    kdJnsOp: row.kdJnsOp,
  }
  const njopTotalBumi = Number(row.luasBumi ?? 0) * Number(row.njopBumi ?? 0)
  const njopTotalBng = Number(row.luasBng ?? 0) * Number(row.njopBng ?? 0)
  const njopTotal = Number(row.njopSppt ?? njopTotalBumi + njopTotalBng)
  const njoptkp = Number(row.njoptkpSppt ?? 0)
  const njkp = Number(row.njkpSppt ?? Math.max(0, njopTotal - njoptkp))
  const pbb = Number(row.pbbYgHarusDibayarSppt)
  const pengurangan = Number(row.faktorPengurangSppt ?? 0)
  const tglJatuhTempo = row.tglJatuhTempo
    ? (row.tglJatuhTempo instanceof Date ? row.tglJatuhTempo.toISOString().slice(0, 10) : String(row.tglJatuhTempo))
    : new Date().toISOString().slice(0, 10)

  return {
    nopParts,
    thnPajakSppt: row.thnPajakSppt,
    nmWp: row.nmWp ?? '-',
    jlnWp: row.jalanWp ?? '',
    blokKavNoWp: '',
    rtwWp: '',
    kelurahanWp: '',
    kotaWp: '',
    kdPos: '',
    jlnOp: '',
    blokKavNoOp: '',
    kelurahanOp: '',
    kecamatanOp: '',
    luasBumi: Number(row.luasBumi ?? 0),
    njopBumi: Number(row.njopBumi ?? 0),
    njopTotalBumi,
    luasBng: Number(row.luasBng ?? 0),
    njopBng: Number(row.njopBng ?? 0),
    njopTotalBng,
    njopTotal,
    njoptkp,
    njkp,
    pbbTerutang: pbb + pengurangan,
    pengurangan,
    pbbYgHarusDibayar: pbb,
    tglJatuhTempo,
  }
}

export default function CetakSpptPage() {
  const orpc = useORPC()
  const currentYear = new Date().getFullYear()
  const [page, setPage] = React.useState(1)
  const [thnPajak, setThnPajak] = React.useState(currentYear)
  const [statusCetak, setStatusCetak] = React.useState<string>('all')
  const [wilayah, setWilayah] = React.useState<Partial<WilayahValue>>({})
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [printing, setPrinting] = React.useState<string | null>(null)
  const [bulkPrinting, setBulkPrinting] = React.useState(false)

  const listQuery = useQuery(
    orpc.sppt.list.queryOptions({
      input: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        thnPajak: thnPajak,
        statusCetak: statusCetak !== 'all' ? statusCetak : undefined,
        kdPropinsi: wilayah.kdPropinsi || undefined,
        kdDati2: wilayah.kdDati2 || undefined,
        kdKecamatan: wilayah.kdKecamatan || undefined,
        kdKelurahan: wilayah.kdKelurahan || undefined,
      },
    }),
  )

  const rows: SpptRow[] = (listQuery.data?.rows ?? []) as SpptRow[]

  function rowKey(row: SpptRow) {
    return `${row.kdPropinsi}${row.kdDati2}${row.kdKecamatan}${row.kdKelurahan}${row.kdBlok}${row.noUrut}${row.kdJnsOp}|${row.thnPajakSppt}`
  }

  function toggleSelect(row: SpptRow) {
    const k = rowKey(row)
    setSelectedIds((prev) => {
      const n = new Set(prev)
      if (n.has(k)) n.delete(k)
      else n.add(k)
      return n
    })
  }

  function toggleAll() {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(rows.map(rowKey)))
    }
  }

  async function handlePrintOne(row: SpptRow) {
    const k = rowKey(row)
    setPrinting(k)
    try {
      const { printSpptPdf } = await import('@/lib/utils/pdf/sppt-generator')
      await printSpptPdf(buildSpptData(row))
    } finally {
      setPrinting(null)
    }
  }

  async function handleDownloadOne(row: SpptRow) {
    const k = rowKey(row)
    setPrinting(k)
    try {
      const { downloadSpptPdf } = await import('@/lib/utils/pdf/sppt-generator')
      await downloadSpptPdf(buildSpptData(row))
    } finally {
      setPrinting(null)
    }
  }

  async function handleBulkPrint() {
    const selected = rows.filter((r) => selectedIds.has(rowKey(r)))
    if (selected.length === 0) return
    setBulkPrinting(true)
    try {
      const { printSpptPdf } = await import('@/lib/utils/pdf/sppt-generator')
      for (const row of selected) {
        await printSpptPdf(buildSpptData(row))
        await new Promise((r) => setTimeout(r, 800))
      }
    } finally {
      setBulkPrinting(false)
    }
  }

  const columns: ColumnDef<SpptRow>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={rows.length > 0 && selectedIds.size === rows.length}
          onCheckedChange={toggleAll}
          aria-label="Pilih semua"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(rowKey(row.original))}
          onCheckedChange={() => toggleSelect(row.original)}
          aria-label="Pilih baris"
        />
      ),
      enableSorting: false,
    },
    {
      id: 'nop',
      header: 'NOP',
      cell: ({ row }) => <NopDisplay parts={row.original} copyable={false} />,
    },
    { accessorKey: 'thnPajakSppt', header: 'Tahun' },
    { accessorKey: 'nmWp', header: 'Nama WP', cell: ({ row }) => row.original.nmWp ?? '-' },
    {
      accessorKey: 'pbbYgHarusDibayarSppt',
      header: 'PBB',
      cell: ({ row }) => <span className="font-mono text-sm">{formatRupiah(row.original.pbbYgHarusDibayarSppt)}</span>,
    },
    {
      accessorKey: 'statusPembayaranSppt',
      header: 'Bayar',
      cell: ({ row }) => <PembayaranBadge status={row.original.statusPembayaranSppt} />,
    },
    {
      accessorKey: 'statusCetakSppt',
      header: 'Cetak',
      cell: ({ row }) =>
        row.original.statusCetakSppt === '1' ? (
          <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/10">Sudah Cetak</Badge>
        ) : (
          <Badge variant="outline">Belum Cetak</Badge>
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const k = rowKey(row.original)
        const isLoading = printing === k
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePrintOne(row.original)}
              disabled={isLoading}
              title="Cetak SPPT"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDownloadOne(row.original)}
              disabled={isLoading}
              title="Download PDF"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Cetak SPPT</h1>
          <p className="text-muted-foreground">Cetak Surat Pemberitahuan Pajak Terhutang</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleBulkPrint}
            disabled={selectedIds.size === 0 || bulkPrinting}
          >
            {bulkPrinting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
            Cetak Terpilih {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Tahun Pajak</label>
            <Select value={String(thnPajak)} onValueChange={(v) => { setThnPajak(parseInt(v)); setPage(1) }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Status Cetak</label>
            <Select value={statusCetak} onValueChange={(v) => { setStatusCetak(v); setPage(1) }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="0">Belum Cetak</SelectItem>
                <SelectItem value="1">Sudah Cetak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <WilayahCascade value={wilayah} onChange={(v) => { setWilayah(v); setPage(1) }} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Tidak ada data SPPT."
        emptyIcon={<Printer size={48} className="opacity-10" />}
      />
    </div>
  )
}
