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
  LayoutDashboard,
  FileText,
  CreditCard,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  Loader2,
} from 'lucide-react'

export default function DashboardPage() {
  const orpc = useORPC()
  const currentYear = new Date().getFullYear()
  const [thnPajak, setThnPajak] = React.useState(currentYear)

  const summaryQuery = useQuery(
    orpc.dashboard.summary.queryOptions({
      input: { thnPajak },
    }),
  )

  const s = summaryQuery.data

  const cards = [
    {
      title: 'Total Objek Pajak',
      value: s?.totalOp?.toLocaleString('id-ID') ?? '-',
      icon: <LayoutDashboard className="h-4 w-4" />,
      description: 'Jumlah SPOP terdaftar',
    },
    {
      title: `SPPT ${thnPajak}`,
      value: s?.totalSppt?.toLocaleString('id-ID') ?? '-',
      icon: <FileText className="h-4 w-4" />,
      description: 'Jumlah SPPT diterbitkan',
    },
    {
      title: 'Ketetapan',
      value: formatRupiah(s?.ketetapan),
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Total PBB terhutang',
    },
    {
      title: 'Realisasi',
      value: formatRupiah(s?.realisasi),
      icon: <CreditCard className="h-4 w-4" />,
      description: 'Total pembayaran diterima',
    },
    {
      title: 'Lunas',
      value: s?.lunas?.toLocaleString('id-ID') ?? '-',
      icon: <CreditCard className="h-4 w-4 text-green-500" />,
      description: 'SPPT telah lunas',
    },
    {
      title: 'Belum Bayar',
      value: s?.belumBayar?.toLocaleString('id-ID') ?? '-',
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      description: 'SPPT belum lunas',
    },
    {
      title: 'Pelayanan Aktif',
      value: s?.pelayananAktif?.toLocaleString('id-ID') ?? '-',
      icon: <ClipboardList className="h-4 w-4" />,
      description: 'Berkas dalam proses',
    },
  ]

  const ketetapanNum = parseFloat(s?.ketetapan ?? '0')
  const realisasiNum = parseFloat(s?.realisasi ?? '0')
  const realisasiPct = ketetapanNum > 0 ? ((realisasiNum / ketetapanNum) * 100).toFixed(1) : '0.0'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan data PBB-P2</p>
        </div>
        <Select value={String(thnPajak)} onValueChange={(v) => setThnPajak(parseInt(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {summaryQuery.isLoading ? (
        <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Memuat data dashboard...
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Realisasi {thnPajak}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{realisasiPct}%</span>
                <span className="text-sm text-muted-foreground">
                  {formatRupiah(s?.realisasi)} / {formatRupiah(s?.ketetapan)}
                </span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(parseFloat(realisasiPct), 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
