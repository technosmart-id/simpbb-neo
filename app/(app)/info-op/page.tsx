'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { NopInput } from '@/components/nop/nop-input'
import { NopDisplay } from '@/components/nop/nop-display'
import { PembayaranBadge } from '@/components/status/pembayaran-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type NopParts, formatNop } from '@/lib/utils/nop'
import { formatRupiah, formatTanggal } from '@/components/data-table/column-helpers'
import { Search, MapPin, User, Building2, FileText, Loader2 } from 'lucide-react'

export default function InfoOpPage() {
  const orpc = useORPC()
  const [nop, setNop] = React.useState<NopParts | null>(null)
  const [searchNop, setSearchNop] = React.useState<NopParts | null>(null)

  const spopQuery = useQuery({
    ...orpc.objekPajak.getByNop.queryOptions({ input: searchNop! }),
    enabled: !!searchNop,
  })

  const spptQuery = useQuery({
    ...orpc.sppt.listByNop.queryOptions({ input: searchNop! }),
    enabled: !!searchNop,
  })

  const bangunanQuery = useQuery({
    ...orpc.lspop.listByNop.queryOptions({ input: searchNop! }),
    enabled: !!searchNop,
  })

  const subjekQuery = useQuery({
    ...orpc.objekPajak.getSubjekPajak.queryOptions({
      input: { subjekPajakId: spopQuery.data?.subjekPajakId ?? '' },
    }),
    enabled: !!spopQuery.data?.subjekPajakId,
  })

  const handleSearch = () => {
    if (nop) setSearchNop(nop)
  }

  const op = spopQuery.data
  const wp = subjekQuery.data
  const isLoading = spopQuery.isLoading

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Info Objek Pajak</h1>
        <p className="text-muted-foreground">Cari dan lihat informasi lengkap objek pajak</p>
      </div>

      {/* Search */}
      <div className="rounded-md border bg-card p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 max-w-md">
            <label className="text-sm font-medium mb-1 block">Masukkan NOP</label>
            <NopInput value={nop ?? undefined} onChange={setNop} />
          </div>
          <Button onClick={handleSearch} disabled={!nop}>
            <Search className="w-4 h-4 mr-2" />
            Cari
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Memuat data...
        </div>
      )}

      {searchNop && !isLoading && !op && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Objek Pajak dengan NOP <span className="font-mono">{formatNop(searchNop)}</span> tidak ditemukan.
          </CardContent>
        </Card>
      )}

      {op && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* OP Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Data Objek Pajak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">NOP</span><NopDisplay parts={op} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Alamat OP</span><span>{op.jalanOp}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Luas Bumi</span><span>{Number(op.luasBumi).toLocaleString('id-ID')} m²</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">NJOP Bumi</span><span className="font-mono">{formatRupiah(op.nilaiSistemBumi)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Jenis Bumi</span><span>{op.jnsBumi}</span></div>
            </CardContent>
          </Card>

          {/* WP Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Data Wajib Pajak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {wp ? (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Nama</span><span>{wp.nmWp}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Alamat</span><span>{wp.jalanWp}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">NPWP</span><span>{wp.npwp ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Telp</span><span>{wp.telpWp ?? '-'}</span></div>
                </>
              ) : (
                <p className="text-muted-foreground">Data WP tidak ditemukan</p>
              )}
            </CardContent>
          </Card>

          {/* Bangunan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Data Bangunan ({bangunanQuery.data?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bangunanQuery.data && bangunanQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {bangunanQuery.data.map((b) => (
                    <div key={b.noBng} className="flex justify-between text-sm border-b pb-2 last:border-0">
                      <span>Bangunan #{b.noBng} — {b.luasBng} m²</span>
                      <span className="font-mono">{formatRupiah(b.nilaiSistemBng)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada bangunan terdaftar</p>
              )}
            </CardContent>
          </Card>

          {/* SPPT History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Riwayat SPPT
              </CardTitle>
            </CardHeader>
            <CardContent>
              {spptQuery.data && spptQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {spptQuery.data.slice(0, 10).map((s) => (
                    <div key={s.thnPajakSppt} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <span className="font-medium">{s.thnPajakSppt}</span>
                      <span className="font-mono">{formatRupiah(s.pbbYgHarusDibayarSppt)}</span>
                      <PembayaranBadge status={s.statusPembayaranSppt} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada SPPT</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
