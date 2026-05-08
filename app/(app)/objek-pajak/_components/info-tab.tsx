'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, User, Building2, Printer } from 'lucide-react'
import { formatRupiah } from '@/components/data-table/column-helpers'
import { NopDisplay } from '@/components/nop/nop-display'
import { Button } from '@/components/ui/button'
import { downloadInfoPdf } from '@/lib/utils/pdf/info-generator'
import { toast } from 'sonner'

interface InfoTabProps {
  initialData: any
}

export function InfoTab({ initialData }: InfoTabProps) {
  const orpc = useORPC()

  const { data: buildings } = useQuery({
    ...orpc.lspop.listByNop.queryOptions({
      input: {
        kdPropinsi: initialData?.kdPropinsi ?? '',
        kdDati2: initialData?.kdDati2 ?? '',
        kdKecamatan: initialData?.kdKecamatan ?? '',
        kdKelurahan: initialData?.kdKelurahan ?? '',
        kdBlok: initialData?.kdBlok ?? '',
        noUrut: initialData?.noUrut ?? '',
        kdJnsOp: initialData?.kdJnsOp ?? '',
      }
    }),
    enabled: !!initialData,
  })

  if (!initialData) return null

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 font-bold uppercase text-[10px]"
          onClick={() => {
            downloadInfoPdf({
              nopParts: initialData,
              spop: initialData,
              buildings: buildings || []
            })
            toast.success("PDF Informasi Objek berhasil dibuat")
          }}
        >
          <Printer className="h-3.5 w-3.5" />
          Cetak Informasi
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* OP Info */}
      <Card className="dark:bg-slate-900/40 dark:backdrop-blur-sm border-muted-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight uppercase">
            <MapPin className="h-4 w-4 text-primary" />
            Data Objek Pajak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">NOP</span><NopDisplay parts={initialData} /></div>
          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Alamat OP</span><span className="font-semibold text-right">{initialData.jalanOp}</span></div>
          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Luas Bumi</span><span className="font-semibold">{Number(initialData.luasBumi).toLocaleString('id-ID')} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">m²</span></span></div>
          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">NJOP Bumi</span><span className="font-mono font-bold text-primary">{formatRupiah(initialData.nilaiSistemBumi)}</span></div>
          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Jenis Bumi</span><span className="font-semibold">{initialData.jnsBumi === '1' ? 'TANAH + BNG' : 'KAVLING'}</span></div>
          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">ZNT</span><span className="font-black text-primary">{initialData.kdZnt}</span></div>
        </CardContent>
      </Card>

      {/* WP Info */}
      <Card className="dark:bg-slate-900/40 dark:backdrop-blur-sm border-muted-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight uppercase">
            <User className="h-4 w-4 text-primary" />
            Data Wajib Pajak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {initialData.subjekPajak ? (
            <>
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Nama</span><span className="font-bold uppercase tracking-tight">{initialData.subjekPajak.nmWp}</span></div>
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Alamat</span><span className="font-semibold text-right">{initialData.subjekPajak.jalanWp}</span></div>
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">NPWP</span><span className="font-mono font-bold">{initialData.subjekPajak.npwp ?? '-'}</span></div>
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">ID Subjek</span><span className="text-[10px] font-mono text-muted-foreground/70">{initialData.subjekPajak.subjekPajakId}</span></div>
            </>
          ) : (
            <p className="text-muted-foreground italic text-xs py-4 text-center">Data WP tidak ditemukan</p>
          )}
        </CardContent>
      </Card>

      {/* Bangunan */}
      <Card className="lg:col-span-2 dark:bg-slate-900/40 dark:backdrop-blur-sm border-muted-foreground/10 overflow-hidden">
        <CardHeader className="bg-muted/30 dark:bg-muted/10 border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight uppercase">
            <Building2 className="h-4 w-4 text-primary" />
            Data Bangunan ({buildings?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {buildings && buildings.length > 0 ? (
            <div className="divide-y divide-border/50">
              {buildings.map((b) => (
                <div key={b.noBng} className="flex justify-between items-center p-4 hover:bg-muted/20 dark:hover:bg-muted/5 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold tracking-tight">Bangunan #{b.noBng} — {b.luasBng} <span className="text-[10px] font-normal text-muted-foreground">m²</span></span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70 mt-0.5">{b.kdJpb} | Dibangun {b.thnDibangunBng || '—'}</span>
                  </div>
                  <span className="font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10 shadow-inner">
                    {formatRupiah(b.nilaiSistemBng)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground italic font-medium opacity-50">Tidak ada bangunan terdaftar</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
