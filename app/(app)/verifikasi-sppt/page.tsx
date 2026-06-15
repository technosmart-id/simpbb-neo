'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { parseNop, formatNop } from '@/lib/utils/nop'
import { NopDisplay } from '@/components/nop/nop-display'
import { PembayaranBadge } from '@/components/status/pembayaran-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react'
import { formatRupiah } from '@/components/data-table/column-helpers'

function VerifikasiSpptContent() {
  const searchParams = useSearchParams()
  const nopRaw = searchParams.get('nop') ?? ''
  const thnStr = searchParams.get('thn') ?? ''
  const thn = parseInt(thnStr, 10)

  const orpc = useORPC()
  const nopParts = React.useMemo(() => parseNop(nopRaw.replace(/\./g, '')), [nopRaw])

  const enabled = Boolean(nopParts && !isNaN(thn))

  const query = useQuery({
    ...orpc.sppt.get.queryOptions({
      input: enabled
        ? { ...nopParts!, thnPajakSppt: thn }
        : { kdPropinsi: '', kdDati2: '', kdKecamatan: '', kdKelurahan: '', kdBlok: '', noUrut: '', kdJnsOp: '', thnPajakSppt: 0 },
    }),
    enabled,
  })

  if (!nopRaw || isNaN(thn) || !nopParts) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <XCircle className="w-16 h-16 text-destructive" />
        <h1 className="text-xl font-semibold">Parameter Tidak Valid</h1>
        <p className="text-muted-foreground text-sm">Kode QR tidak mengandung data NOP atau tahun pajak yang valid.</p>
      </div>
    )
  }

  if (query.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Memverifikasi dokumen...</p>
      </div>
    )
  }

  const row = query.data

  if (!row) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <XCircle className="w-16 h-16 text-destructive" />
        <h1 className="text-xl font-semibold">SPPT Tidak Ditemukan</h1>
        <p className="text-muted-foreground text-sm">
          Tidak ada SPPT terdaftar untuk NOP <span className="font-mono">{nopRaw}</span> tahun {thn}.
        </p>
        <p className="text-xs text-muted-foreground">Dokumen ini mungkin tidak sah atau belum diterbitkan.</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <ShieldCheck className="w-14 h-14 text-green-600" />
        <h1 className="text-2xl font-bold">SPPT Terverifikasi</h1>
        <p className="text-muted-foreground text-sm">
          Dokumen ini terdaftar resmi dalam sistem PBB-P2.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data SPPT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Nomor Objek Pajak (NOP)</span>
            <NopDisplay parts={nopParts} copyable />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted-foreground block">Tahun Pajak</span>
              <span className="font-medium">{row.thnPajakSppt}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Status Pembayaran</span>
              <PembayaranBadge status={row.statusPembayaranSppt ?? 0} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted-foreground block">Nama WP</span>
              <span className="font-medium">{row.nmWp ?? '-'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">PBB Yang Harus Dibayar</span>
              <span className="font-mono font-semibold">{formatRupiah(row.pbbYgHarusDibayarSppt ?? 0)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted-foreground block">Batas Jatuh Tempo</span>
              <span className="font-medium">
                {row.tglJatuhTempo
                  ? new Date(row.tglJatuhTempo).toLocaleDateString('id-ID', { dateStyle: 'long' })
                  : '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Status Cetak</span>
              {row.statusCetakSppt === 1 ? (
                <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/10">Sudah Dicetak</Badge>
              ) : (
                <Badge variant="outline">Belum Dicetak</Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <span>Dokumen ini diverifikasi pada {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifikasiSpptPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Memverifikasi...</p>
        </div>
      }
    >
      <VerifikasiSpptContent />
    </React.Suspense>
  )
}
