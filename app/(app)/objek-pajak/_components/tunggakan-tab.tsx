'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface TunggakanTabProps {
  initialData: any
}

export function TunggakanTab({ initialData }: TunggakanTabProps) {
  const orpc = useORPC()

  const { data: tunggakan, isLoading } = useQuery({
    ...orpc.objekPajak.getTunggakan.queryOptions({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const totalPokok = tunggakan?.reduce((acc, curr) => acc + (curr.pbbHarusDibayar || 0), 0) || 0

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-destructive/5 border-destructive/20 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Tunggakan</p>
              <p className="text-xl font-bold text-destructive">Rp {totalPokok.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tahun Tertua</p>
              <p className="text-xl font-bold text-foreground">
                {tunggakan && tunggakan.length > 0 ? Math.min(...tunggakan.map(t => Number(t.thnPajakSppt))) : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jumlah Item</p>
              <p className="text-xl font-bold text-foreground">{tunggakan?.length || 0} Tahun</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">Tahun</TableHead>
              <TableHead>Jatuh Tempo</TableHead>
              <TableHead className="text-right">Pokok</TableHead>
              <TableHead className="text-right">Estimasi Denda (2%)</TableHead>
              <TableHead className="text-right font-bold text-foreground">Total Tagihan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tunggakan?.map((item) => {
              const denda = Math.round((item.pbbHarusDibayar || 0) * 0.02) // Simple 2% estimation for UI
              return (
                <TableRow key={item.thnPajakSppt} className="hover:bg-destructive/5 transition-colors group">
                  <TableCell className="font-bold">{item.thnPajakSppt}</TableCell>
                  <TableCell className="text-xs">
                    {item.tglJatuhTempo ? format(new Date(item.tglJatuhTempo), 'dd MMM yyyy') : '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {item.pbbHarusDibayar?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground italic">
                    +{denda.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-destructive">
                    {((item.pbbHarusDibayar || 0) + denda).toLocaleString()}
                  </TableCell>
                </TableRow>
              )
            })}
            {(!tunggakan || tunggakan.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-20" />
                    <span className="font-semibold text-emerald-600">Alhamdulillah! Tidak ada tunggakan pajak.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import { CheckCircle2 } from 'lucide-react'
