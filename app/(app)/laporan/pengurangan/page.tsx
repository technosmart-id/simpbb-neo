'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Percent } from 'lucide-react'

export default function LaporanPenguranganPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Laporan Pengurangan</h1>
        <p className="text-muted-foreground">Data pengurangan PBB</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Percent size={48} className="mx-auto mb-3 opacity-10" />
          <p>Laporan pengurangan akan tersedia setelah data status_pbb terisi.</p>
        </CardContent>
      </Card>
    </div>
  )
}
