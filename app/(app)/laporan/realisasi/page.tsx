'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatRupiah } from '@/components/data-table/column-helpers'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

export default function LaporanRealisasiPage() {
  const orpc = useORPC()
  const currentYear = new Date().getFullYear()
  const [thnPajak, setThnPajak] = React.useState(currentYear)

  const dataQuery = useQuery(
    orpc.dashboard.realisasiPerKecamatan.queryOptions({ input: { thnPajak } }),
  )

  const summaryQuery = useQuery(
    orpc.dashboard.summary.queryOptions({ input: { thnPajak } }),
  )

  const s = summaryQuery.data

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Laporan Realisasi</h1>
          <p className="text-muted-foreground">Realisasi penerimaan PBB per wilayah</p>
        </div>
        <Select value={String(thnPajak)} onValueChange={(v) => setThnPajak(parseInt(v))}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Ketetapan</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold">{formatRupiah(s?.ketetapan)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Realisasi</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold text-green-600">{formatRupiah(s?.realisasi)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">SPPT Lunas</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold">{s?.lunas?.toLocaleString('id-ID') ?? '-'} / {s?.totalSppt?.toLocaleString('id-ID') ?? '-'}</div></CardContent>
        </Card>
      </div>

      {/* Per Kecamatan */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kecamatan</TableHead>
              <TableHead>Jumlah SPPT</TableHead>
              <TableHead>Total Ketetapan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : dataQuery.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">Tidak ada data</TableCell>
              </TableRow>
            ) : (
              dataQuery.data?.map((r) => (
                <TableRow key={r.kdKecamatan}>
                  <TableCell className="font-medium">{r.kdKecamatan}</TableCell>
                  <TableCell>{r.totalSppt}</TableCell>
                  <TableCell className="font-mono">{formatRupiah(r.totalKetetapan)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
