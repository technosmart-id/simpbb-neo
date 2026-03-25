'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
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
import { ExcelExportButton } from '@/components/export/excel-export-button'

export default function LaporanTunggakanPage() {
  const orpc = useORPC()

  const summaryQuery = useQuery(
    orpc.tunggakan.summaryPerYear.queryOptions({ input: {} }),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Laporan Tunggakan</h1>
          <p className="text-muted-foreground">Rekapitulasi tunggakan per tahun pajak</p>
        </div>
        <ExcelExportButton
          filename="Laporan_Tunggakan"
          title="LAPORAN TUNGGAKAN PBB PER TAHUN"
          columns={[
            { header: 'Tahun Pajak', key: 'thnPajak', width: 14 },
            { header: 'Jumlah SPPT', key: 'jumlahSppt', width: 14, style: 'number' },
            { header: 'Total Tunggakan (Rp)', key: 'totalTunggakan', width: 22, style: 'currency' },
          ]}
          getRows={() => (summaryQuery.data ?? []).map((r) => ({
            thnPajak: r.thnPajak,
            jumlahSppt: r.jumlahSppt,
            totalTunggakan: Number(r.totalTunggakan),
          }))}
          label="Export Excel"
        />
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tahun Pajak</TableHead>
              <TableHead>Jumlah SPPT</TableHead>
              <TableHead>Total Tunggakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : summaryQuery.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">Tidak ada tunggakan</TableCell>
              </TableRow>
            ) : (
              summaryQuery.data?.map((r) => (
                <TableRow key={r.thnPajak}>
                  <TableCell className="font-medium">{r.thnPajak}</TableCell>
                  <TableCell>{r.jumlahSppt}</TableCell>
                  <TableCell className="font-mono text-red-600">{formatRupiah(r.totalTunggakan)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
