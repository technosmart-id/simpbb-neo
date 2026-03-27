'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'
import {
  generateBeritaAcara,
  generateBeritaAcaraDetail,
  type BeritaAcaraData,
} from '@/lib/utils/pdf/berita-acara-generator'

export function BeritaAcaraClient(data: BeritaAcaraData) {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Berita Acara Pelayanan</h1>
        <p className="text-sm text-muted-foreground">
          No. Berkas:{' '}
          <span className="font-mono font-medium">{data.pelayanan.noPelayanan}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Berita Acara Standar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Dokumen resmi pelayanan lengkap dengan checklist dan tanda tangan.
            </p>
            <Button onClick={() => generateBeritaAcara(data)} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Cetak BA
            </Button>
          </CardContent>
        </Card>

        {data.mutasi && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Berita Acara Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Termasuk perbandingan data sebelum dan sesudah mutasi.
              </p>
              <Button
                variant="outline"
                onClick={() => generateBeritaAcaraDetail(data)}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" /> Cetak BA Detail
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
