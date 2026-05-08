'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { DataTable } from '@/components/data-table/data-table'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NopInput } from '@/components/nop/nop-input'
import { NopDisplay } from '@/components/nop/nop-display'
import { type NopParts } from '@/lib/utils/nop'
import { Plus, GitBranch, ArrowRight, Loader2, Trash2 } from 'lucide-react'
import { formatTanggal } from '@/components/data-table/column-helpers'

type PemekaranRow = {
  id: number
  namaPemekaran: string
  tglBerlaku: Date | string
  keterangan: string | null
  jumlahDetail: number
}

const PAGE_SIZE = 20

function CreatePemekaranDialog({ onSuccess }: { onSuccess: () => void }) {
  const orpc = useORPC()
  const [open, setOpen] = React.useState(false)
  const [nama, setNama] = React.useState('')
  const [tgl, setTgl] = React.useState(new Date().toISOString().slice(0, 10))
  const [ket, setKet] = React.useState('')

  const mutation = useMutation(
    orpc.pemekaran.create.mutationOptions({
      onSuccess: () => {
        onSuccess()
        setOpen(false)
        setNama('')
        setKet('')
      },
    }),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pemekaran
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Event Pemekaran</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <Label>Nama Pemekaran *</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Pemekaran Kelurahan X Tahun 2024" />
          </div>
          <div className="space-y-1">
            <Label>Tanggal Berlaku *</Label>
            <Input type="date" value={tgl} onChange={(e) => setTgl(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Keterangan</Label>
            <Textarea value={ket} onChange={(e) => setKet(e.target.value)} rows={3} />
          </div>
          <Button
            onClick={() => mutation.mutate({ namaPemekaran: nama, tglBerlaku: tgl, keterangan: ket || undefined })}
            disabled={!nama || mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Simpan
          </Button>
          {mutation.isError && <p className="text-sm text-destructive">{String(mutation.error)}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PemekaranDetailPanel({ id }: { id: number }) {
  const orpc = useORPC()
  const qc = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [nopLama, setNopLama] = React.useState<NopParts | undefined>()
  const [nopBaru, setNopBaru] = React.useState<NopParts | undefined>()

  const detailQuery = useQuery({
    ...orpc.pemekaran.get.queryOptions({ input: { id } }),
    enabled: open,
  })

  const addMutation = useMutation(
    orpc.pemekaran.addDetail.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['pemekaran', id] })
        setNopLama(undefined)
        setNopBaru(undefined)
      },
    }),
  )

  const deleteMutation = useMutation(
    orpc.pemekaran.deleteDetail.mutationOptions({
      onSuccess: () => qc.invalidateQueries({ queryKey: ['pemekaran', id] }),
    }),
  )

  function handleAdd() {
    if (!nopLama || !nopBaru) return
    addMutation.mutate({
      pemekaranId: id,
      kdPropinsiLama: nopLama.kdPropinsi, kdDati2Lama: nopLama.kdDati2, kdKecamatanLama: nopLama.kdKecamatan,
      kdKelurahanLama: nopLama.kdKelurahan, kdBlokLama: nopLama.kdBlok, noUrutLama: nopLama.noUrut, kdJnsOpLama: nopLama.kdJnsOp,
      kdPropinsiBaru: nopBaru.kdPropinsi, kdDati2Baru: nopBaru.kdDati2, kdKecamatanBaru: nopBaru.kdKecamatan,
      kdKelurahanBaru: nopBaru.kdKelurahan, kdBlokBaru: nopBaru.kdBlok, noUrutBaru: nopBaru.noUrut, kdJnsOpBaru: nopBaru.kdJnsOp,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Lihat Detail</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Pemekaran</DialogTitle>
        </DialogHeader>
        {detailQuery.isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Daftar NOP Lama → Baru */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(detailQuery.data?.details ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada detail NOP terdaftar.</p>
              ) : (
                (detailQuery.data?.details ?? []).map((d) => {
                  const lama: NopParts = {
                    kdPropinsi: d.kdPropinsiLama, kdDati2: d.kdDati2Lama, kdKecamatan: d.kdKecamatanLama,
                    kdKelurahan: d.kdKelurahanLama, kdBlok: d.kdBlokLama, noUrut: d.noUrutLama, kdJnsOp: d.kdJnsOpLama,
                  }
                  const baru: NopParts = {
                    kdPropinsi: d.kdPropinsiBaru, kdDati2: d.kdDati2Baru, kdKecamatan: d.kdKecamatanBaru,
                    kdKelurahan: d.kdKelurahanBaru, kdBlok: d.kdBlokBaru, noUrut: d.noUrutBaru, kdJnsOp: d.kdJnsOpBaru,
                  }
                  return (
                    <div key={d.id} className="flex items-center gap-2 text-sm bg-muted/40 rounded px-3 py-1.5">
                      <NopDisplay parts={lama} copyable={false} />
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <NopDisplay parts={baru} copyable={false} />
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6 ml-auto text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate({ id: d.id })}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Tambah mapping baru */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tambah NOP Mapping</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">NOP Lama</Label>
                    <NopInput value={nopLama} onChange={(_, parts) => setNopLama(parts ?? undefined)} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground mb-2" />
                  <div className="space-y-1">
                    <Label className="text-xs">NOP Baru</Label>
                    <NopInput value={nopBaru} onChange={(_, parts) => setNopBaru(parts ?? undefined)} />
                  </div>
                </div>
                <Button size="sm" onClick={handleAdd} disabled={!nopLama || !nopBaru || addMutation.isPending}>
                  {addMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                  Tambah Mapping
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function PemekaranPage() {
  const orpc = useORPC()
  const qc = useQueryClient()
  const [page, setPage] = React.useState(1)

  const listQuery = useQuery(
    orpc.pemekaran.list.queryOptions({
      input: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    }),
  )

  const columns: ColumnDef<PemekaranRow>[] = [
    {
      accessorKey: 'namaPemekaran',
      header: 'Nama Pemekaran',
    },
    {
      accessorKey: 'tglBerlaku',
      header: 'Tanggal Berlaku',
      cell: ({ row }) => formatTanggal(row.original.tglBerlaku),
    },
    {
      accessorKey: 'jumlahDetail',
      header: 'Jumlah NOP',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.jumlahDetail} NOP</Badge>
      ),
    },
    {
      accessorKey: 'keterangan',
      header: 'Keterangan',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.keterangan ?? '-'}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <PemekaranDetailPanel id={row.original.id} />,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Pemekaran</h1>
          <p className="text-muted-foreground">Manajemen pemekaran wilayah dan objek pajak — pemetaan NOP lama ke NOP baru</p>
        </div>
        <CreatePemekaranDialog
          onSuccess={() => qc.invalidateQueries({ queryKey: ['pemekaran'] })}
        />
      </div>

      <DataTable
        columns={columns}
        data={(listQuery.data?.rows ?? []) as PemekaranRow[]}
        totalRows={listQuery.data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={listQuery.isLoading}
        emptyMessage="Belum ada event pemekaran."
        emptyIcon={<GitBranch size={48} className="opacity-10" />}
      />
    </div>
  )
}
