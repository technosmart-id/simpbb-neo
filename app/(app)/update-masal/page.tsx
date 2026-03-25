'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { WilayahCascade, type WilayahValue } from '@/components/wilayah/wilayah-cascade'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { formatRupiah } from '@/components/data-table/column-helpers'

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 1) return <Badge variant="outline">Tidak ada perubahan</Badge>
  if (delta > 0) return <Badge className="bg-amber-500">+{formatRupiah(delta)}</Badge>
  return <Badge className="bg-green-600">{formatRupiah(delta)}</Badge>
}

export default function UpdateMasalPage() {
  const orpc = useORPC()
  const qc = useQueryClient()
  const currentYear = new Date().getFullYear()

  // Step state
  const [step, setStep] = React.useState<'config' | 'preview' | 'result'>('config')
  const [thnPajak, setThnPajak] = React.useState(currentYear)
  const [wilayah, setWilayah] = React.useState<Partial<WilayahValue>>({})
  const [forceAll, setForceAll] = React.useState(false)
  const [nipPetugas, setNipPetugas] = React.useState('')
  const [keterangan, setKeterangan] = React.useState('')

  const previewQuery = useQuery({
    ...orpc.updateMasal.preview.queryOptions({
      input: {
        thnPajak,
        kdPropinsi: wilayah.kdPropinsi || undefined,
        kdDati2: wilayah.kdDati2 || undefined,
        kdKecamatan: wilayah.kdKecamatan || undefined,
        kdKelurahan: wilayah.kdKelurahan || undefined,
      },
    }),
    enabled: step === 'preview',
  })

  const processMutation = useMutation(
    orpc.updateMasal.processHitungUlang.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['sppt'] })
        setStep('result')
      },
    }),
  )

  function handlePreview() {
    setStep('preview')
  }

  function handleProcess() {
    processMutation.mutate({
      thnPajak,
      kdPropinsi: wilayah.kdPropinsi || undefined,
      kdDati2: wilayah.kdDati2 || undefined,
      kdKecamatan: wilayah.kdKecamatan || undefined,
      kdKelurahan: wilayah.kdKelurahan || undefined,
      forceAll,
      nipPetugas: nipPetugas || undefined,
      keterangan: keterangan || `Update Masal ${thnPajak}`,
    })
  }

  function handleReset() {
    setStep('config')
    processMutation.reset()
  }

  const prev = previewQuery.data
  const result = processMutation.data

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Update Masal</h1>
        <p className="text-muted-foreground">Pembaruan data secara massal — Hitung ulang SPPT dengan tarif &amp; NJOPTKP terkini</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {['config', 'preview', 'result'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 ${step === s ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step === s ? 'bg-primary text-primary-foreground' :
                  (i < ['config', 'preview', 'result'].indexOf(step) ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground')}`}>
                {i + 1}
              </div>
              <span className="capitalize">{s}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Config */}
      {step === 'config' && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. Pilih Cakupan</CardTitle>
              <CardDescription>Tentukan tahun pajak dan wilayah yang akan diproses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 max-w-xs">
                <Label>Tahun Pajak</Label>
                <Select value={String(thnPajak)} onValueChange={(v) => setThnPajak(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Filter Wilayah (opsional)</Label>
                <WilayahCascade value={wilayah} onChange={setWilayah} />
                <p className="text-xs text-muted-foreground mt-1">Kosongkan untuk memproses seluruh wilayah</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2. Opsi Proses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch id="force-all" checked={forceAll} onCheckedChange={setForceAll} />
                <div>
                  <Label htmlFor="force-all">Proses SPPT yang sudah lunas</Label>
                  <p className="text-xs text-muted-foreground">Secara default, SPPT berstatus lunas tidak diproses ulang</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>NIP Petugas</Label>
                  <Input value={nipPetugas} onChange={(e) => setNipPetugas(e.target.value)} className="font-mono" placeholder="Opsional" />
                </div>
                <div className="space-y-1">
                  <Label>Keterangan</Label>
                  <Input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder={`Update Masal ${thnPajak}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Perhatian</AlertTitle>
            <AlertDescription>
              Proses ini akan menghitung ulang PBB berdasarkan NJOPTKP dan Tarif Pajak yang tersimpan di Konfigurasi.
              Riwayat kalkulasi lama akan disimpan di Histori SPPT. Pastikan nilai NJOPTKP dan Tarif sudah benar sebelum melanjutkan.
            </AlertDescription>
          </Alert>

          <Button onClick={handlePreview}>
            Lanjut ke Preview
          </Button>
        </>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preview Dampak</CardTitle>
              <CardDescription>Perkiraan jumlah data yang akan berubah</CardDescription>
            </CardHeader>
            <CardContent>
              {previewQuery.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menghitung...
                </div>
              ) : prev ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total SPPT dalam cakupan</p>
                    <p className="text-2xl font-bold">{prev.count.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Akan diproses</p>
                    <p className="text-2xl font-bold">
                      {forceAll ? prev.count : (prev.count - prev.belumBayar > 0 ? prev.belumBayar : prev.count).toLocaleString('id-ID')}
                    </p>
                    {!forceAll && <p className="text-xs text-muted-foreground">({prev.belumCetak} belum cetak)</p>}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total PBB saat ini</p>
                    <p className="font-mono font-medium">{formatRupiah(prev.totalPbb)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Konfigurasi yang akan digunakan</p>
                    <p className="text-xs">NJOPTKP: <span className="font-mono">{formatRupiah(Number(prev.currentNjoptkp))}</span></p>
                    <p className="text-xs">Tarif: <span className="font-mono">{(Number(prev.currentTarif) * 100).toFixed(3)}%</span></p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('config')}>Kembali</Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={previewQuery.isLoading || (prev?.count ?? 0) === 0}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Proses Sekarang
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Update Masal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan menghitung ulang PBB untuk {prev?.count ?? 0} SPPT tahun {thnPajak}.
                    Proses ini tidak dapat dibatalkan. Data lama akan tersimpan di Histori SPPT.
                    Lanjutkan?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleProcess}>
                    Ya, Proses Sekarang
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {processMutation.isPending && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses... Mohon tunggu, jangan tutup halaman ini.
            </div>
          )}

          {processMutation.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Proses Gagal</AlertTitle>
              <AlertDescription>{String(processMutation.error)}</AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Step 3: Result */}
      {step === 'result' && result && (
        <>
          <Card className="border-green-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Update Masal Selesai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">SPPT diproses</p>
                  <p className="text-2xl font-bold text-green-600">{result.processed}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">SPPT dilewati (lunas)</p>
                  <p className="text-2xl font-bold text-muted-foreground">{result.skipped}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total PBB sebelum</p>
                  <p className="font-mono">{formatRupiah(result.totalPbbOld)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total PBB sesudah</p>
                  <p className="font-mono font-medium">{formatRupiah(result.totalPbbNew)}</p>
                  <DeltaBadge delta={result.delta} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Proses Baru
          </Button>
        </>
      )}
    </div>
  )
}
