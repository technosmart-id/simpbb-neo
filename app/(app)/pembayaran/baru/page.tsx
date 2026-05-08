'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { NopInput } from '@/components/nop/nop-input'
import { NopDisplay } from '@/components/nop/nop-display'
import { CurrencyInput } from '@/components/forms/currency-input'
import { parseNop, formatNop } from '@/lib/utils/nop'
import { calculateDenda } from '@/lib/utils/denda-calculator'
import { formatRupiah } from '@/components/data-table/column-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { PembayaranBadge } from '@/components/status/pembayaran-badge'

const CHANNELS = [
  'Tunai / Kasir',
  'Bank Mitra',
  'Pos Indonesia',
  'Transfer Bank',
  'Aplikasi Mobile',
  'Minimarket',
]

function PembayaranBaruForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orpc = useORPC()
  const qc = useQueryClient()

  // Pre-fill NOP from query param (e.g., from cetak-sppt page)
  const prefillNop = searchParams.get('nop') ?? ''

  const [nopParts, setNopParts] = React.useState<import("@/lib/utils/nop").NopParts | undefined>(() => parseNop(prefillNop) ?? undefined)
  const [thnPajak, setThnPajak] = React.useState(new Date().getFullYear())
  const [tglPembayaran, setTglPembayaran] = React.useState(
    new Date().toISOString().slice(0, 10),
  )
  const [namaBayar, setNamaBayar] = React.useState('')
  const [channel, setChannel] = React.useState('Tunai / Kasir')
  const [noReferensi, setNoReferensi] = React.useState('')
  const [nipPetugas, setNipPetugas] = React.useState('')

  // Calculated amounts (can be overridden)
  const [dendaOverride, setDendaOverride] = React.useState<number | null>(null)


  // Load SPPT for the selected NOP + tahun
  const spptQuery = useQuery({
    ...orpc.sppt.get.queryOptions({
      input: { ...nopParts!, thnPajakSppt: thnPajak },
    }),
    enabled: !!nopParts,
  })

  const sppt = spptQuery.data

  // Calculate denda based on SPPT jatuh tempo
  const dendaCalc = React.useMemo(() => {
    if (!sppt?.tglJatuhTempo || !sppt?.pbbYgHarusDibayarSppt) return null
    const jatuhTempo = new Date(sppt.tglJatuhTempo)
    const bayarDate = new Date(tglPembayaran)
    if (bayarDate <= jatuhTempo) return 0
    return calculateDenda(Number(sppt.pbbYgHarusDibayarSppt), jatuhTempo, bayarDate).dendaAmount
  }, [sppt, tglPembayaran])

  const denda = dendaOverride !== null ? dendaOverride : (dendaCalc ?? 0)
  const pbbPokok = sppt?.pbbYgHarusDibayarSppt ? Number(sppt.pbbYgHarusDibayarSppt) : 0
  const totalBayar = pbbPokok + denda

  const createMutation = useMutation(
    orpc.pembayaran.create.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['pembayaran'] })
        qc.invalidateQueries({ queryKey: ['sppt'] })
        router.push('/pembayaran')
      },
    }),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nopParts || !sppt) return
    createMutation.mutate({
      ...nopParts,
      thnPajakSppt: thnPajak,
      tglPembayaranSppt: tglPembayaran,
      jmlSpptYgDibayar: String(pbbPokok),
      dendaSppt: String(denda),
      jmlBayar: String(totalBayar),
      namaBayar: namaBayar || undefined,
      channelPembayaran: channel,
      noReferensi: noReferensi || undefined,
      nipPetugas: nipPetugas || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href="/pembayaran"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Rekam Pembayaran PBB</h1>
          <p className="text-muted-foreground text-sm">Input pembayaran SPPT</p>
        </div>
      </div>

      {/* NOP & Tahun */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Objek Pajak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>NOP (18 digit) *</Label>
            <NopInput value={nopParts} onChange={(_, parts) => setNopParts(parts ?? undefined)} />
          </div>
          <div className="space-y-1 max-w-xs">
            <Label>Tahun Pajak *</Label>
            <Input
              type="number"
              value={thnPajak}
              onChange={(e) => setThnPajak(Number(e.target.value))}
              min={2000}
              max={2099}
            />
          </div>
        </CardContent>
      </Card>

      {/* SPPT Info */}
      {nopParts && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Data SPPT Tahun {thnPajak}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spptQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : !sppt ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <AlertCircle className="w-4 h-4 text-destructive" />
                SPPT untuk NOP {formatNop(nopParts)} tahun {thnPajak} tidak ditemukan.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                <div>
                  <span className="text-muted-foreground">NOP:</span>{' '}
                  <NopDisplay parts={nopParts} copyable={false} />
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <PembayaranBadge status={sppt.statusPembayaranSppt ?? 0} />
                </div>
                <div>
                  <span className="text-muted-foreground">NJOP:</span>{' '}
                  {formatRupiah(Number(sppt.njopSppt))}
                </div>
                <div>
                  <span className="text-muted-foreground">PBB Terutang:</span>{' '}
                  <span className="font-medium">{formatRupiah(Number(sppt.pbbYgHarusDibayarSppt))}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Jatuh Tempo:</span>{' '}
                  {sppt.tglJatuhTempo
                    ? new Date(sppt.tglJatuhTempo).toLocaleDateString('id-ID', { dateStyle: 'long' })
                    : '-'}
                </div>
                {sppt.statusPembayaranSppt === 1 && (
                  <div className="col-span-2">
                    <Badge variant="default" className="bg-green-600">LUNAS</Badge>
                    <span className="text-muted-foreground ml-2 text-xs">
                      SPPT ini sudah lunas. Memproses pembayaran lanjutan/cicilan.
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rincian Pembayaran */}
      {sppt && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rincian Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Tanggal Bayar *</Label>
              <Input
                type="date"
                value={tglPembayaran}
                onChange={(e) => setTglPembayaran(e.target.value)}
                required
                className="max-w-xs"
              />
            </div>

            <div className="rounded-md border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PBB Pokok</span>
                <span className="font-mono font-medium">{formatRupiah(pbbPokok)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Denda
                  {dendaCalc !== null && dendaCalc > 0 && (
                    <span className="text-xs ml-1 text-destructive">(terlambat)</span>
                  )}
                </span>
                <div className="w-36">
                  <CurrencyInput
                    value={denda}
                    onChange={(v) => setDendaOverride(v)}
                  />
                </div>
              </div>
              {dendaCalc !== null && dendaCalc !== denda && (
                <button
                  type="button"
                  className="text-xs text-primary underline"
                  onClick={() => setDendaOverride(null)}
                >
                  Reset ke kalkulasi otomatis ({formatRupiah(dendaCalc)})
                </button>
              )}
              <div className="border-t pt-2 flex justify-between font-medium text-base">
                <span>Total Bayar</span>
                <span className="font-mono">{formatRupiah(totalBayar)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Pembayar */}
      {sppt && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Pembayar &amp; Metode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nama Pembayar</Label>
                <Input
                  value={namaBayar}
                  onChange={(e) => setNamaBayar(e.target.value)}
                  placeholder="Nama penyetor"
                />
              </div>
              <div className="space-y-1">
                <Label>Channel Pembayaran</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>No Referensi / NTPN</Label>
                <Input
                  value={noReferensi}
                  onChange={(e) => setNoReferensi(e.target.value)}
                  placeholder="Opsional"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label>NIP Petugas</Label>
                <Input
                  value={nipPetugas}
                  onChange={(e) => setNipPetugas(e.target.value)}
                  placeholder="Opsional"
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!nopParts || !sppt || createMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {createMutation.isPending ? 'Menyimpan...' : 'Rekam Pembayaran'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/pembayaran">Batal</Link>
        </Button>
      </div>
      {createMutation.isError && (
        <p className="text-sm text-destructive">{String(createMutation.error)}</p>
      )}
    </form>
  )
}

export default function PembayaranBaruPage() {
  return (
    <React.Suspense>
      <PembayaranBaruForm />
    </React.Suspense>
  )
}
