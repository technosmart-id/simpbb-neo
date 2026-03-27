'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { PelayananBadge } from '@/components/status/pelayanan-badge'
import { NopDisplay } from '@/components/nop/nop-display'
import { parseNop } from '@/lib/utils/nop'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ChevronRight, Clock, FileText, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// 6 statuses per business spec
const STATUSES = [
  { value: 1, label: 'Diterima', color: 'bg-blue-100 text-blue-800' },
  { value: 2, label: 'Masuk Penilai', color: 'bg-yellow-100 text-yellow-800' },
  { value: 3, label: 'Masuk Penetapan', color: 'bg-orange-100 text-orange-800' },
  { value: 4, label: 'Selesai', color: 'bg-green-100 text-green-800' },
  { value: 5, label: 'Terkonfirmasi WP', color: 'bg-purple-100 text-purple-800' },
  { value: 6, label: 'Ditunda', color: 'bg-red-100 text-red-800' },
]

function AdvanceStatusButton({
  noPelayanan,
  currentStatus,
}: {
  noPelayanan: string
  currentStatus: number
}) {
  const orpc = useORPC()
  const qc = useQueryClient()
  const [catatan, setCatatan] = React.useState('')
  const [nipPetugas, setNipPetugas] = React.useState('')
  const [open, setOpen] = React.useState(false)

  const nextStatus = currentStatus === 6 ? null : currentStatus < 5 ? currentStatus + 1 : null
  const canDitunda = currentStatus < 4 && currentStatus !== 6
  const targetStatus = nextStatus

  const mutation = useMutation(
    orpc.pelayanan.updateStatus.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['pelayanan'] })
        setOpen(false)
        setCatatan('')
      },
    }),
  )

  if (!nextStatus && !canDitunda) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-2">
          {nextStatus && (
            <Button size="sm">
              <ChevronRight className="w-4 h-4 mr-2" />
              Maju ke {STATUSES.find((s) => s.value === nextStatus)?.label}
            </Button>
          )}
          {canDitunda && (
            <Button size="sm" variant="outline" onClick={(e) => {
              e.preventDefault()
              mutation.mutate({ noPelayanan, newStatus: 6 })
            }}>
              Tunda
            </Button>
          )}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ubah Status ke: {STATUSES.find((s) => s.value === targetStatus)?.label}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>NIP Petugas</Label>
            <Input
              value={nipPetugas}
              onChange={(e) => setNipPetugas(e.target.value)}
              placeholder="Opsional"
              className="font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label>Catatan</Label>
            <Textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Catatan perubahan status..."
            />
          </div>
          <Button
            className="w-full"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                noPelayanan,
                newStatus: targetStatus!,
                nipPetugas: nipPetugas || undefined,
                catatan: catatan || undefined,
              })
            }
          >
            {mutation.isPending ? 'Menyimpan...' : 'Konfirmasi'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AddLampiranDialog({ noPelayanan }: { noPelayanan: string }) {
  const orpc = useORPC()
  const qc = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ nop: '', nama: '', alamat: '', lt: '', lb: '', keterangan: '' })

  const mutation = useMutation(
    orpc.pelayanan.addLampiran.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['pelayanan'] })
        setOpen(false)
        setForm({ nop: '', nama: '', alamat: '', lt: '', lb: '', keterangan: '' })
      },
    }),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />Tambah
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Lampiran Kolektif</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>NOP</Label>
            <Input value={form.nop} onChange={(e) => setForm((f) => ({ ...f, nop: e.target.value }))} className="font-mono" maxLength={18} />
          </div>
          <div className="space-y-1">
            <Label>Nama WP</Label>
            <Input value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} maxLength={100} />
          </div>
          <div className="space-y-1">
            <Label>Alamat OP</Label>
            <Textarea value={form.alamat} onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Luas Tanah (m²)</Label>
              <Input type="number" value={form.lt} onChange={(e) => setForm((f) => ({ ...f, lt: e.target.value }))} min={0} />
            </div>
            <div className="space-y-1">
              <Label>Luas Bangunan (m²)</Label>
              <Input type="number" value={form.lb} onChange={(e) => setForm((f) => ({ ...f, lb: e.target.value }))} min={0} />
            </div>
          </div>
          <Button
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ noPelayanan, ...form })}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Tambah'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function PelayananDetailPage() {
  const params = useParams<{ no: string }>()
  const orpc = useORPC()
  const qc = useQueryClient()

  const query = useQuery(
    orpc.pelayanan.getByNo.queryOptions({ input: { noPelayanan: params.no } }),
  )

  const deleteLampiranMutation = useMutation(
    orpc.pelayanan.deleteLampiran.mutationOptions({
      onSuccess: () => qc.invalidateQueries({ queryKey: ['pelayanan'] }),
    }),
  )

  const data = query.data
  const isLoading = query.isLoading

  const nopParts = React.useMemo(() => {
    if (!data?.kdPropinsi || !data?.kdDati2) return null
    return {
      kdPropinsi: data.kdPropinsi,
      kdDati2: data.kdDati2,
      kdKecamatan: data.kdKecamatan ?? '',
      kdKelurahan: data.kdKelurahan ?? '',
      kdBlok: data.kdBlok ?? '',
      noUrut: data.noUrut ?? '',
      kdJnsOp: data.kdJnsOp ?? '4',
    }
  }, [data])

  const status = STATUSES.find((s) => s.value === data?.statusPelayanan)

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pelayanan"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="space-y-0.5">
          {isLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight font-mono">{data?.noPelayanan}</h1>
          )}
          <p className="text-muted-foreground text-sm">Detail Berkas Pelayanan</p>
        </div>
        {!isLoading && data && (
          <div className="ml-auto flex items-center gap-2">
            <PelayananBadge status={data.statusPelayanan} />
            <Button variant="outline" size="sm" asChild>
              <Link href={`/pelayanan/${data.noPelayanan}/berita-acara`}>
                <FileText className="w-4 h-4 mr-2" />
                Cetak Berita Acara
              </Link>
            </Button>
            <AdvanceStatusButton noPelayanan={data.noPelayanan} currentStatus={data.statusPelayanan} />
          </div>
        )}
      </div>

      {!isLoading && !data && (
        <p className="text-destructive">Berkas tidak ditemukan: {params.no}</p>
      )}

      {/* Info Dasar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informasi Berkas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">No Pelayanan:</span>{' '}
                <span className="font-mono font-medium">{data?.noPelayanan}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tanggal:</span>{' '}
                {data?.tanggalPelayanan
                  ? new Date(data.tanggalPelayanan).toLocaleDateString('id-ID', { dateStyle: 'long' })
                  : '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Jenis Pelayanan:</span>{' '}
                <span className="font-medium">{data?.kdJnsPelayanan}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{' '}
                {status && <PelayananBadge status={data!.statusPelayanan} />}
              </div>
              {nopParts && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">NOP:</span>{' '}
                  <NopDisplay parts={nopParts} />
                </div>
              )}
              {data?.letakOp && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Letak OP:</span> {data.letakOp}
                </div>
              )}
              {data?.namaPemohon && (
                <div>
                  <span className="text-muted-foreground">Pemohon:</span>{' '}
                  <span className="font-medium">{data.namaPemohon}</span>
                </div>
              )}
              {data?.alamatPemohon && (
                <div>
                  <span className="text-muted-foreground">Alamat Pemohon:</span>{' '}
                  {String(data.alamatPemohon)}
                </div>
              )}
              {data?.catatan && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Catatan:</span>{' '}
                  {String(data.catatan)}
                </div>
              )}
              {data?.namaPetugasPenerima && (
                <div>
                  <span className="text-muted-foreground">Petugas:</span>{' '}
                  {data.namaPetugasPenerima}
                  {data.nipPetugasPenerima && ` (${data.nipPetugasPenerima})`}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Kolektif:</span>{' '}
                {data?.isKolektif ? 'Ya' : 'Tidak'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lampiran Kolektif */}
      {data?.isKolektif === 1 && (
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base">Lampiran Kolektif</CardTitle>
            <AddLampiranDialog noPelayanan={params.no} />
          </CardHeader>
          <CardContent>
            {(data.lampiran?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada lampiran.</p>
            ) : (
              <div className="space-y-2">
                {data.lampiran?.map((l) => (
                  <div key={l.id} className="flex items-start justify-between rounded-md border px-3 py-2 text-sm">
                    <div className="space-y-0.5">
                      <div className="font-mono text-xs text-muted-foreground">{l.nop ?? '-'}</div>
                      <div className="font-medium">{l.nama ?? '-'}</div>
                      {l.alamat && <div className="text-muted-foreground">{String(l.alamat)}</div>}
                      <div className="text-xs text-muted-foreground">
                        LT: {l.lt ? Number(l.lt).toLocaleString('id-ID') : '-'} m² · LB: {l.lb ? Number(l.lb).toLocaleString('id-ID') : '-'} m²
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => deleteLampiranMutation.mutate({ id: l.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Riwayat Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Riwayat Perubahan Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (data?.mutasi?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada riwayat perubahan status.</p>
          ) : (
            <div className="space-y-3">
              {data?.mutasi?.map((m) => (
                <div key={m.id} className="flex items-start gap-3 text-sm">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {new Date(m.tglMutasi).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        {' '}
                        {new Date(m.tglMutasi).toLocaleTimeString('id-ID', { timeStyle: 'short' })}
                      </span>
                      {m.nipPetugas && (
                        <span className="text-muted-foreground text-xs">NIP {m.nipPetugas}</span>
                      )}
                    </div>
                    {m.nopSesudah && (
                      <div className="text-muted-foreground">
                        {m.nopSebelum && <span>NOP {m.nopSebelum} → </span>}
                        <span className="font-mono">{m.nopSesudah}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline status aktif */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tanggal Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Diterima:</span>{' '}
                {data?.tanggalPelayanan
                  ? new Date(data.tanggalPelayanan).toLocaleDateString('id-ID')
                  : '-'}
              </div>
              {data?.tglMasukPenilai && (
                <div>
                  <span className="text-muted-foreground">Masuk Penilai:</span>{' '}
                  {new Date(data.tglMasukPenilai).toLocaleDateString('id-ID')}
                </div>
              )}
              {data?.tglMasukPenetapan && (
                <div>
                  <span className="text-muted-foreground">Masuk Penetapan:</span>{' '}
                  {new Date(data.tglMasukPenetapan).toLocaleDateString('id-ID')}
                </div>
              )}
              {data?.tglSelesai && (
                <div>
                  <span className="text-muted-foreground">Selesai:</span>{' '}
                  {new Date(data.tglSelesai).toLocaleDateString('id-ID')}
                </div>
              )}
              {data?.tglTerkonfirmasiWp && (
                <div>
                  <span className="text-muted-foreground">Dikonfirmasi WP:</span>{' '}
                  {new Date(data.tglTerkonfirmasiWp).toLocaleDateString('id-ID')}
                </div>
              )}
              {data?.tglBerkasDitunda && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-destructive">Ditunda:</span>{' '}
                  {new Date(data.tglBerkasDitunda).toLocaleDateString('id-ID')}
                  {data.alasanDitunda && ` — ${data.alasanDitunda}`}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
