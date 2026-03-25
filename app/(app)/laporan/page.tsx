'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart3,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ArrowRightLeft,
  FileText,
  Percent,
  BookOpen,
} from 'lucide-react'
import Link from 'next/link'

const reports = [
  { title: 'Laporan Pembayaran', description: 'Rincian pembayaran PBB per periode', href: '/laporan/pembayaran', icon: <CreditCard className="h-5 w-5" /> },
  { title: 'Laporan Realisasi', description: 'Realisasi penerimaan per wilayah', href: '/laporan/realisasi', icon: <TrendingUp className="h-5 w-5" /> },
  { title: 'Laporan Tunggakan', description: 'Daftar tunggakan per tahun pajak', href: '/laporan/tunggakan', icon: <AlertTriangle className="h-5 w-5" /> },
  { title: 'Laporan Mutasi', description: 'Riwayat perubahan objek pajak', href: '/laporan/mutasi', icon: <ArrowRightLeft className="h-5 w-5" /> },
  { title: 'Laporan Penetapan', description: 'Data penetapan PBB', href: '/laporan/penetapan', icon: <FileText className="h-5 w-5" /> },
  { title: 'Laporan Pengurangan', description: 'Data pengurangan PBB', href: '/laporan/pengurangan', icon: <Percent className="h-5 w-5" /> },
  { title: 'Laporan DHKP', description: 'Daftar Himpunan Ketetapan Pajak', href: '/laporan/dhkp', icon: <BookOpen className="h-5 w-5" /> },
]

export default function LaporanPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
        <p className="text-muted-foreground">Pusat laporan PBB-P2</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                {r.icon}
                <CardTitle className="text-base">{r.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{r.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
