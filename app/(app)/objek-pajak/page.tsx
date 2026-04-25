'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatRupiah } from '@/components/data-table/column-helpers'
import { NopInput } from '@/components/nop/nop-input'
import { SpopForm } from './_components/spop-form'

export default function ObjekPajakPage() {
  const [mounted, setMounted] = React.useState(false)
  const [nopSearch, setNopSearch] = React.useState('')

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data for initial state
  const mockData = {
    nop: '32.01.010.001.001-0001.0',
    namaWp: 'BUDI SANTOSO',
    kecamatan: 'CIBINONG',
    kelurahan: 'PAKAN SARI',
    alamatWp: 'JL. RAYA TEGAR BERIMAN NO. 1, CIBINONG, BOGOR',
    alamatOp: 'JL. RAYA PAKAN SARI NO. 12, RT 01 RW 02',
    luasBumi: 200,
    luasBangunan: 150,
    jumlahBangunan: 1,
    njopBumi: 1000000000,
    njopBangunan: 750000000,
    njopTotal: 1750000000,
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Header & NOP Search */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card p-3 rounded-xl border shadow-sm">
        <div className="flex flex-1 max-w-xl gap-2 items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
            <Search className="h-5 w-5" />
          </div>
          <NopInput
            value={nopSearch}
            onChange={(val) => setNopSearch(val)}
            className="flex-1 h-10 border-none shadow-none focus-visible:ring-0 text-base font-medium"
          />
          <Button className="h-10 px-6 font-bold">
            Cari
          </Button>
        </div>

        <div className="hidden xl:block">
          <Separator orientation="vertical" className="h-10" />
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-tight tracking-wider">Wajib Pajak</span>
            <span className="font-bold text-foreground truncate max-w-[180px]">{mockData.namaWp}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-tight tracking-wider">Wilayah</span>
            <span className="font-semibold text-foreground">{mockData.kecamatan} / {mockData.kelurahan}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-tight tracking-wider">Luas (m²)</span>
            <span className="font-semibold text-foreground">T: {mockData.luasBumi} | B: {mockData.luasBangunan}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-tight tracking-wider">Total NJOP</span>
            <span className="font-bold text-primary">{formatRupiah(mockData.njopTotal)}</span>
          </div>
        </div>
      </div>

      {/* 2. Form Content Section */}
      <Tabs defaultValue="bumi">
        <TabsList>
          <TabsTrigger value="bumi">Bumi</TabsTrigger>
          <TabsTrigger value="bangunan">Bangunan</TabsTrigger>
          <TabsTrigger value="sppt">SPPT</TabsTrigger>
          <TabsTrigger value="tunggakan">Tunggakan</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="bumi">
          <SpopForm mockData={mockData} />
        </TabsContent>

        <TabsContent value="bangunan">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border border-dashed rounded bg-muted/10">
                Tabel data rincian bangunan
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sppt">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border border-dashed rounded bg-muted/10">
                Tabel riwayat penerbitan SPPT
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tunggakan">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border border-dashed rounded bg-muted/10">
                Daftar tagihan yang belum dibayar
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border border-dashed rounded bg-muted/10">
                Informasi koordinat, foto, atau catatan
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
