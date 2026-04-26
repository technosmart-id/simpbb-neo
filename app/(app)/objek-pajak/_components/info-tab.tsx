'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, User, Building2 } from 'lucide-react'
import { formatRupiah } from '@/components/data-table/column-helpers'
import { NopDisplay } from '@/components/nop/nop-display'

interface InfoTabProps {
  initialData: any
}

export function InfoTab({ initialData }: InfoTabProps) {
  const orpc = useORPC()

  const { data: buildings } = useQuery({
    ...orpc.lspop.listByNop.queryOptions({
      input: {
        kdPropinsi: initialData.kdPropinsi,
        kdDati2: initialData.kdDati2,
        kdKecamatan: initialData.kdKecamatan,
        kdKelurahan: initialData.kdKelurahan,
        kdBlok: initialData.kdBlok,
        noUrut: initialData.noUrut,
        kdJnsOp: initialData.kdJnsOp,
      }
    }),
    enabled: !!initialData,
  })

  if (!initialData) return null

  return (
    <div className="grid gap-4 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* OP Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Data Objek Pajak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">NOP</span><NopDisplay parts={initialData} /></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Alamat OP</span><span>{initialData.jalanOp}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Luas Bumi</span><span>{Number(initialData.luasBumi).toLocaleString('id-ID')} m²</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">NJOP Bumi</span><span className="font-mono">{formatRupiah(initialData.nilaiSistemBumi)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Jenis Bumi</span><span>{initialData.jnsBumi === '1' ? 'TANAH + BNG' : 'KAVLING'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ZNT</span><span>{initialData.kdZnt}</span></div>
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
          {initialData.subjekPajak ? (
            <>
              <div className="flex justify-between"><span className="text-muted-foreground">Nama</span><span>{initialData.subjekPajak.nmWp}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Alamat</span><span>{initialData.subjekPajak.jalanWp}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">NPWP</span><span>{initialData.subjekPajak.npwp ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ID Subjek</span><span className="text-xs text-muted-foreground">{initialData.subjekPajak.subjekPajakId}</span></div>
            </>
          ) : (
            <p className="text-muted-foreground">Data WP tidak ditemukan</p>
          )}
        </CardContent>
      </Card>

      {/* Bangunan */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Data Bangunan ({buildings?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {buildings && buildings.length > 0 ? (
            <div className="space-y-2">
              {buildings.map((b) => (
                <div key={b.noBng} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-medium">Bangunan #{b.noBng} — {b.luasBng} m²</span>
                    <span className="text-xs text-muted-foreground uppercase">{b.kdJpb} | Dibangun {b.thnDibangunBng || '—'}</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{formatRupiah(b.nilaiSistemBng)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Tidak ada bangunan terdaftar</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
