'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ArrowRightLeft } from 'lucide-react'

export default function LaporanMutasiPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Laporan Mutasi</h1>
        <p className="text-muted-foreground">Riwayat perubahan/mutasi objek pajak</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <ArrowRightLeft size={48} className="mx-auto mb-3 opacity-10" />
          <p>Laporan mutasi akan tersedia setelah modul pelayanan berjalan.</p>
        </CardContent>
      </Card>
    </div>
  )
}
