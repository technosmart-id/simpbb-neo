'use client'

import * as React from 'react'
import { NopInput } from '@/components/nop/nop-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type NopParts } from '@/lib/utils/nop'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { formatRupiah } from '@/components/data-table/column-helpers'
import { Building2, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LspopPage() {
  const orpc = useORPC()
  const [nop, setNop] = React.useState<NopParts | null>(null)
  const [searchNop, setSearchNop] = React.useState<NopParts | null>(null)

  const bangunanQuery = useQuery({
    ...orpc.lspop.listByNop.queryOptions({ input: searchNop! }),
    enabled: !!searchNop,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">LSPOP</h1>
        <p className="text-muted-foreground">Lampiran Surat Pemberitahuan Objek Pajak — Data bangunan</p>
      </div>

      <div className="rounded-md border bg-card p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 max-w-md">
            <label className="text-sm font-medium mb-1 block">Masukkan NOP</label>
            <NopInput value={nop ?? undefined} onChange={setNop} />
          </div>
          <Button onClick={() => nop && setSearchNop(nop)} disabled={!nop}>
            <Search className="w-4 h-4 mr-2" />
            Cari Bangunan
          </Button>
        </div>
      </div>

      {bangunanQuery.isLoading && (
        <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {bangunanQuery.data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bangunanQuery.data.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Building2 size={48} className="mx-auto mb-2 opacity-10" />
                Tidak ada bangunan terdaftar untuk NOP ini.
              </CardContent>
            </Card>
          ) : (
            bangunanQuery.data.map((b) => (
              <Card key={b.noBng} className={b.aktif === 0 ? 'opacity-50' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Bangunan #{b.noBng}
                    {b.aktif === 0 && <span className="text-xs text-red-500">(Non-aktif)</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Luas</span><span>{b.luasBng} m²</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Lantai</span><span>{b.jmlLantaiBng}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">JPB</span><span>{b.kdJpb ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Thn Dibangun</span><span>{b.thnDibangunBng ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Nilai</span><span className="font-mono">{formatRupiah(b.nilaiSistemBng)}</span></div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
