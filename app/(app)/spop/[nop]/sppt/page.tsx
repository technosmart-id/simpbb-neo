'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { parseNop, formatNop } from '@/lib/utils/nop'
import { NopDisplay } from '@/components/nop/nop-display'
import { calculatePbb, calculateNjopBumi, calculateNjopBangunan, findTarif } from '@/lib/utils/njop-calculator'
import { formatRupiah } from '@/components/data-table/column-helpers'
import { PembayaranBadge } from '@/components/status/pembayaran-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calculator, Plus, RefreshCw, History } from 'lucide-react'
import Link from 'next/link'
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

function CalcRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex justify-between py-1 text-sm ${highlight ? 'font-semibold text-base border-t mt-1 pt-2' : ''}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{typeof value === 'number' ? formatRupiah(value) : value}</span>
    </div>
  )
}

export default function SpptPerNopPage() {
  const params = useParams<{ nop: string }>()
  const router = useRouter()
  const orpc = useORPC()
  const qc = useQueryClient()

  const nopParts = React.useMemo(() => parseNop(params.nop), [params.nop])

  const currentYear = new Date().getFullYear()
  const [thnPajak, setThnPajak] = React.useState(currentYear)
  const [tglJatuhTempo, setTglJatuhTempo] = React.useState(`${currentYear}-09-30`)
  const [tglTerbit, setTglTerbit] = React.useState(new Date().toISOString().slice(0, 10))
  const [penguranganPersen, setPenguranganPersen] = React.useState(0)
  const [njoptkpOverride, setNjoptkpOverride] = React.useState<number | null>(null)
  const [showHistory, setShowHistory] = React.useState(false)

  // Load SPOP data
  const spopQuery = useQuery({
    ...orpc.objekPajak.getByNop.queryOptions({ input: nopParts! }),
    enabled: !!nopParts,
  })

  // Load LSPOP buildings
  const buildingsQuery = useQuery({
    ...orpc.lspop.listByNop.queryOptions({ input: nopParts! }),
    enabled: !!nopParts,
  })

  // Load existing SPPT for this NOP
  const spptListQuery = useQuery({
    ...orpc.sppt.listByNop.queryOptions({ input: nopParts! }),
    enabled: !!nopParts,
  })

  // Load existing SPPT for selected year
  const existingSpptQuery = useQuery({
    ...orpc.sppt.get.queryOptions({ input: { ...nopParts!, thnPajakSppt: thnPajak } }),
    enabled: !!nopParts,
  })

  // Load tarif
  const tarifQuery = useQuery(orpc.klasifikasi.listTarif.queryOptions())

  // Load konfigurasi for NJOPTKP and PBB_MINIMUM
  const njoptkpConfigQuery = useQuery(
    orpc.konfigurasi.get.queryOptions({ input: { nama: 'NJOPTKP' } }),
  )
  const pbbMinimumQuery = useQuery(
    orpc.konfigurasi.get.queryOptions({ input: { nama: 'PBB_MINIMUM' } }),
  )

  // Load SPPT history for existing SPPT
  const historyQuery = useQuery({
    ...orpc.sppt.getHistory.queryOptions({ input: { ...nopParts!, thnPajakSppt: thnPajak } }),
    enabled: !!nopParts && showHistory,
  })

  // NJOP Calculation
  const calc = React.useMemo(() => {
    const spop = spopQuery.data
    if (!spop) return null

    const njoptkpConfig = njoptkpConfigQuery.data?.nilai
    const njoptkp = njoptkpOverride !== null
      ? njoptkpOverride
      : (njoptkpConfig ? parseInt(njoptkpConfig, 10) : 10_000_000)

    const pbbMinimum = pbbMinimumQuery.data?.nilai
      ? parseInt(pbbMinimumQuery.data.nilai, 10)
      : 10_000

    const njopBumi = calculateNjopBumi(spop.luasBumi, spop.nilaiSistemBumi)

    const activeBuildings = (buildingsQuery.data ?? [])
      .filter((b) => b.aktif !== 0)
      .map((b) => ({ luasBng: b.luasBng, nilaiSistemBng: b.nilaiSistemBng }))

    const njopBng = calculateNjopBangunan(activeBuildings)
    const njopTotal = njopBumi + njopBng
    const hasBangunan = activeBuildings.length > 0

    const tarifList = (tarifQuery.data ?? []).map((t) => ({
      njopMin: parseFloat(String(t.njopMin)),
      njopMax: parseFloat(String(t.njopMax)),
      nilaiTarif: parseFloat(String(t.nilaiTarif)),
    }))
    const tarifPersen = findTarif(njopTotal, tarifList)

    return calculatePbb({
      njopBumi,
      njopBng,
      njoptkp,
      hasBangunan,
      tarifPersen,
      penguranganPersen,
      pbbMinimum,
    })
  }, [spopQuery.data, buildingsQuery.data, tarifQuery.data, njoptkpConfigQuery.data, pbbMinimumQuery.data, njoptkpOverride, penguranganPersen])

  const totalLuasBng = (buildingsQuery.data ?? [])
    .filter((b) => b.aktif !== 0)
    .reduce((sum, b) => sum + b.luasBng, 0)

  // Create SPPT
  const createMutation = useMutation(
    orpc.sppt.create.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['sppt'] })
      },
    }),
  )

  // Recalculate SPPT
  const recalcMutation = useMutation(
    orpc.sppt.recalculate.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['sppt'] })
      },
    }),
  )

  function buildPayload() {
    if (!nopParts || !calc) return null
    const spop = spopQuery.data
    return {
      ...nopParts,
      thnPajakSppt: thnPajak,
      luasBumi: String(spop?.luasBumi ?? 0),
      luasBng: String(totalLuasBng),
      njopBumi: String(calc.njopBumi),
      njopBng: String(calc.njopBng),
      njopSppt: String(calc.njopSppt),
      njoptkpSppt: String(calc.njoptkpApplied),
      njkpSppt: String(calc.njkp),
      pbbTerhutangSppt: String(calc.pbbTerhutang),
      faktorPengurangSppt: String(calc.faktorPengurang),
      pbbYgHarusDibayarSppt: String(calc.pbbYgHarusDibayar),
      tglJatuhTempo: tglJatuhTempo || undefined,
      tglTerbit: tglTerbit || undefined,
      nmWp: spopQuery.data?.subjekPajakId ?? undefined,
    }
  }

  function handleCreate() {
    const payload = buildPayload()
    if (!payload) return
    createMutation.mutate(payload)
  }

  function handleRecalculate() {
    const payload = buildPayload()
    if (!payload) return
    recalcMutation.mutate({
      ...payload,
      keterangan: 'Recalculate dari form SPOP',
    })
  }

  const existingSppt = existingSpptQuery.data
  const isLoading = spopQuery.isLoading || buildingsQuery.isLoading || tarifQuery.isLoading

  if (!nopParts) {
    return <p className="text-destructive">NOP tidak valid: {params.nop}</p>
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/spop/${params.nop}`}><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Penetapan SPPT</h1>
          <NopDisplay parts={nopParts} />
        </div>
      </div>

      {/* Existing SPPT list */}
      {(spptListQuery.data?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SPPT Tersimpan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {spptListQuery.data?.map((s) => (
                <div key={s.thnPajakSppt} className="flex items-center justify-between rounded px-3 py-2 text-sm hover:bg-accent">
                  <button
                    type="button"
                    className="font-mono font-medium"
                    onClick={() => setThnPajak(s.thnPajakSppt)}
                  >
                    Tahun {s.thnPajakSppt}
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{formatRupiah(Number(s.pbbYgHarusDibayarSppt))}</span>
                    <PembayaranBadge status={s.statusPembayaranSppt ?? 'belum'} />
                    <Badge variant="outline" className="text-xs">Siklus {s.siklusSppt}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year & Date settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pengaturan SPPT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Tahun Pajak</Label>
              <Input
                type="number"
                value={thnPajak}
                onChange={(e) => setThnPajak(Number(e.target.value))}
                min={2000}
                max={2099}
              />
            </div>
            <div className="space-y-1">
              <Label>Tanggal Terbit</Label>
              <Input
                type="date"
                value={tglTerbit}
                onChange={(e) => setTglTerbit(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Jatuh Tempo</Label>
              <Input
                type="date"
                value={tglJatuhTempo}
                onChange={(e) => setTglJatuhTempo(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-1">
              <Label>NJOPTKP (Rp) — override</Label>
              <Input
                type="number"
                value={njoptkpOverride !== null ? njoptkpOverride : ''}
                placeholder={`Default: ${formatRupiah(njoptkpConfigQuery.data?.nilai ? parseInt(njoptkpConfigQuery.data.nilai, 10) : 10_000_000)}`}
                onChange={(e) => setNjoptkpOverride(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-1">
              <Label>Pengurangan (%)</Label>
              <Input
                type="number"
                value={penguranganPersen}
                onChange={(e) => setPenguranganPersen(Math.min(100, Math.max(0, Number(e.target.value))))}
                min={0}
                max={100}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Rincian Perhitungan NJOP &amp; PBB
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
          ) : !calc ? (
            <p className="text-muted-foreground text-sm">Data SPOP belum tersedia.</p>
          ) : (
            <div className="space-y-1">
              {/* Land */}
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bumi</div>
              <CalcRow label={`Luas Bumi × NJOP/m²  (${Number(spopQuery.data?.luasBumi ?? 0).toLocaleString('id-ID')} m²)`} value={calc.njopBumi} />

              {/* Buildings */}
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1">Bangunan</div>
              {(buildingsQuery.data ?? []).filter((b) => b.aktif !== 0).map((b) => (
                <CalcRow
                  key={b.noBng}
                  label={`  Bng #${b.noBng} — ${Number(b.luasBng).toLocaleString('id-ID')} m² × ${formatRupiah(b.nilaiSistemBng)}/m²`}
                  value={Math.round(b.luasBng * b.nilaiSistemBng)}
                />
              ))}
              {totalLuasBng === 0 && (
                <p className="text-xs text-muted-foreground italic">Tidak ada bangunan aktif — NJOPTKP tidak berlaku</p>
              )}
              <CalcRow label={`Total NJOP Bangunan (${totalLuasBng.toLocaleString('id-ID')} m²)`} value={calc.njopBng} />

              <Separator className="my-2" />

              {/* Totals */}
              <CalcRow label="NJOP Total (BR-01)" value={calc.njopSppt} />
              <CalcRow label={`NJOPTKP (BR-02)${totalLuasBng === 0 ? ' — tidak berlaku' : ''}`} value={-calc.njoptkpApplied} />
              <CalcRow label="NJKP (BR-03)" value={calc.njkp} highlight />

              <Separator className="my-2" />

              <CalcRow label={`Tarif PBB × NJKP (BR-05)`} value={calc.pbbTerhutang} />
              {calc.faktorPengurang > 0 && (
                <CalcRow label={`Pengurangan ${penguranganPersen}% (BR-06)`} value={-calc.faktorPengurang} />
              )}
              <CalcRow label="PBB Yang Harus Dibayar" value={calc.pbbYgHarusDibayar} highlight />

              {/* Current year comparison */}
              {existingSppt && (
                <div className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-sm">
                  <div className="text-muted-foreground text-xs mb-1">SPPT Tersimpan (Siklus {existingSppt.siklusSppt})</div>
                  <div className="flex justify-between">
                    <span>PBB Tersimpan</span>
                    <span className="font-mono font-medium">{formatRupiah(Number(existingSppt.pbbYgHarusDibayarSppt))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <PembayaranBadge status={existingSppt.statusPembayaranSppt ?? 'belum'} />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error states */}
      {(createMutation.isError || recalcMutation.isError) && (
        <p className="text-sm text-destructive">
          {String(createMutation.error ?? recalcMutation.error)}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {!existingSppt ? (
          <Button
            onClick={handleCreate}
            disabled={!calc || createMutation.isPending || isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {createMutation.isPending ? 'Membuat...' : `Buat SPPT ${thnPajak}`}
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={!calc || recalcMutation.isPending || isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {recalcMutation.isPending ? 'Menghitung...' : 'Recalculate SPPT'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Recalculate SPPT {thnPajak}?</AlertDialogTitle>
                <AlertDialogDescription>
                  SPPT yang ada (Siklus {existingSppt.siklusSppt}) akan disimpan ke histori dan nilai baru akan diterapkan.
                  Siklus akan bertambah menjadi {(existingSppt.siklusSppt ?? 0) + 1}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleRecalculate}>Recalculate</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {existingSppt && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? 'Sembunyikan' : 'Lihat'} Histori
          </Button>
        )}

        <Button variant="outline" asChild>
          <Link href={`/spop/${params.nop}`}>Kembali ke SPOP</Link>
        </Button>
      </div>

      {/* SPPT History */}
      {showHistory && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Histori SPPT Tahun {thnPajak}</CardTitle>
          </CardHeader>
          <CardContent>
            {historyQuery.isLoading ? (
              <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (historyQuery.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada histori perubahan.</p>
            ) : (
              <div className="space-y-3">
                {historyQuery.data?.map((h, idx) => (
                  <div key={idx} className="rounded-md border px-4 py-3 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Siklus {h.siklusSppt}</span>
                      <span className="text-muted-foreground text-xs">
                        {h.tglPerubahan
                          ? new Date(h.tglPerubahan).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                          : '-'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 text-muted-foreground">
                      <div>NJOP: {formatRupiah(Number(h.njopSppt))}</div>
                      <div>PBB: {formatRupiah(Number(h.pbbYgHarusDibayarSppt))}</div>
                    </div>
                    {h.keterangan && (
                      <div className="text-xs text-muted-foreground">Ket: {String(h.keterangan)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
