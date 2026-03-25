'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LaporanDhkpPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Laporan DHKP</h1>
        <p className="text-muted-foreground">Daftar Himpunan Ketetapan Pajak</p>
      </div>
      <Card>
        <CardContent className="p-8 flex flex-col items-center gap-4 text-center text-muted-foreground">
          <BookOpen size={48} className="opacity-20" />
          <div>
            <p className="font-medium text-foreground">Generator DHKP tersedia di menu DHKP</p>
            <p className="text-sm mt-1">
              Gunakan halaman DHKP untuk menghasilkan dan mengunduh Daftar Himpunan Ketetapan Pajak
              dalam format PDF maupun Excel, dengan filter wilayah dan tahun pajak.
            </p>
          </div>
          <Button asChild>
            <Link href="/dhkp">
              Buka Generator DHKP
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
