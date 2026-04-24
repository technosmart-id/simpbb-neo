'use client'

import * as React from 'react'
import { Search, Save, MapPin, FileText, LandPlot } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRupiah } from '@/components/data-table/column-helpers'

export default function ObjekPajakPage() {
  const [nop, setNop] = React.useState('')

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
      {/* 1. Header & NOP Search - One Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-2 rounded-lg border">
        <h1 className="text-lg font-bold tracking-tight whitespace-nowrap text-primary flex items-center gap-2">
          <FileText className="h-5 w-5" />
          SPOP - Objek Pajak
        </h1>
        <div className="flex flex-1 max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="nop"
              placeholder="Masukkan 18 digit NOP..."
              className="h-8 pl-8 text-xs bg-background font-mono"
              value={nop}
              onChange={(e) => setNop(e.target.value)}
              maxLength={18}
            />
          </div>
          <button className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Cari
          </button>
        </div>
      </div>

      {/* 2. Overview Card - Ultra Compact */}
      <Card className="border-primary/20 shadow-sm">
        <CardContent className="p-3">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-start text-xs">
            <div className="lg:col-span-1">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">NOP / Status</p>
              <div className="flex items-center gap-1.5 mt-0.5 font-mono">
                <p className="text-[11px] font-bold leading-none">{mockData.nop}</p>
                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[8px] font-black text-green-700 dark:bg-green-900/30 dark:text-green-400">AKTIF</span>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Nama Wajib Pajak</p>
              <p className="mt-0.5 text-[11px] font-semibold leading-none truncate">{mockData.namaWp}</p>
            </div>

            <div className="lg:col-span-1">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Kecamatan / Kelurahan</p>
              <p className="mt-0.5 text-[11px] font-semibold leading-none truncate">{mockData.kecamatan} / {mockData.kelurahan}</p>
            </div>

            <div className="lg:col-span-1">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Alamat OP</p>
              <p className="mt-0.5 text-[11px] font-semibold leading-none truncate" title={mockData.alamatOp}>{mockData.alamatOp}</p>
            </div>

            <div className="lg:col-span-1">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Bumi / Bngn (m²)</p>
              <p className="mt-0.5 text-[11px] font-semibold leading-none">{mockData.luasBumi} / {mockData.luasBangunan} ({mockData.jumlahBangunan})</p>
            </div>

            <div className="lg:col-span-1">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">NJOP Total</p>
              <p className="mt-0.5 text-[12px] font-black text-primary leading-none">{formatRupiah(mockData.njopTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Form Tabs Section */}
      <Tabs defaultValue="bumi" className="w-full">
        <TabsList className="grid h-8 w-full grid-cols-5 md:w-auto">
          <TabsTrigger value="bumi" className="text-[11px] py-1">Bumi</TabsTrigger>
          <TabsTrigger value="bangunan" className="text-[11px] py-1">Bangunan</TabsTrigger>
          <TabsTrigger value="sppt" className="text-[11px] py-1">SPPT</TabsTrigger>
          <TabsTrigger value="tunggakan" className="text-[11px] py-1">Tunggakan</TabsTrigger>
          <TabsTrigger value="info" className="text-[11px] py-1">Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bumi" className="mt-2">
          <Card>
            <CardContent className="p-4 space-y-6">
              {/* Form Section: Data Formulir */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Data Formulir SPOP</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="noForm" className="text-[10px] font-bold uppercase">No. Formulir SPOP</Label>
                    <Input id="noForm" placeholder="Contoh: 20240001" className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jnsTrans" className="text-[10px] font-bold uppercase">Jenis Transaksi</Label>
                    <select id="jnsTrans" className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="1">1. PEREKAMAN DATA</option>
                      <option value="2">2. PEMUTAKHIRAN DATA</option>
                      <option value="3">3. PENGHAPUSAN DATA</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="noSpptLama" className="text-[10px] font-bold uppercase">No. SPPT Lama (Jika Ada)</Label>
                    <Input id="noSpptLama" placeholder="4 digit" className="h-8 text-xs" maxLength={4} />
                  </div>
                </div>
              </div>

              {/* Form Section: Letak Objek Pajak */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Letak Objek Pajak</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="jalanOp" className="text-[10px] font-bold uppercase">Jalan / Alamat</Label>
                    <Input id="jalanOp" defaultValue={mockData.alamatOp} className="h-8 text-xs uppercase" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="blokOp" className="text-[10px] font-bold uppercase">Blok / Kav / No</Label>
                    <Input id="blokOp" placeholder="C-12" className="h-8 text-xs uppercase" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="rtOp" className="text-[10px] font-bold uppercase">RT</Label>
                      <Input id="rtOp" placeholder="000" className="h-8 text-xs font-mono" maxLength={3} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rwOp" className="text-[10px] font-bold uppercase">RW</Label>
                      <Input id="rwOp" placeholder="00" className="h-8 text-xs font-mono" maxLength={2} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section: Data Bumi / Tanah */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-1.5">
                  <LandPlot className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Data Bumi (Tanah)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="statusWp" className="text-[10px] font-bold uppercase">Status WP</Label>
                    <select id="statusWp" className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="1">1. MILIK SENDIRI</option>
                      <option value="2">2. PENYEWA</option>
                      <option value="3">3. PENGELOLA</option>
                      <option value="4">4. PEMAKAI</option>
                      <option value="5">5. SENGKETA</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="luasBumi" className="text-[10px] font-bold uppercase">Luas Bumi (m²)</Label>
                    <Input id="luasBumi" type="number" defaultValue={mockData.luasBumi} className="h-8 text-xs font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="znt" className="text-[10px] font-bold uppercase">ZNT</Label>
                    <Input id="znt" placeholder="AA" className="h-8 text-xs font-black uppercase text-blue-600" maxLength={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jnsBumi" className="text-[10px] font-bold uppercase">Jenis Bumi</Label>
                    <select id="jnsBumi" className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="1">1. TANAH + BANGUNAN</option>
                      <option value="2">2. TANAH KOSONG</option>
                      <option value="3">3. FASILITAS UMUM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button className="h-9 px-4 rounded-md border border-input bg-background hover:bg-muted text-xs font-bold transition-colors">
                  Reset
                </button>
                <button className="h-9 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95">
                  <Save className="h-4 w-4" />
                  Simpan SPOP
                </button>
              </div>

              {/* Valuation Preview (Calculated) */}
              <div className="bg-muted/30 p-3 rounded-lg border border-dashed grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Kelas Bumi</p>
                  <p className="text-xs font-black">071</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">NJOP Bumi / m²</p>
                  <p className="text-xs font-semibold">{formatRupiah(5000000)}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-[10px] font-bold text-primary uppercase">Estimasi Total NJOP Bumi</p>
                  <p className="text-lg font-black text-primary leading-none">{formatRupiah(mockData.njopBumi)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bangunan" className="mt-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-center h-24 text-[10px] text-muted-foreground border border-dashed rounded bg-muted/10">
                Tabel data rincian bangunan
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sppt" className="mt-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-center h-24 text-[10px] text-muted-foreground border border-dashed rounded bg-muted/10">
                Tabel riwayat penerbitan SPPT
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tunggakan" className="mt-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-center h-24 text-[10px] text-muted-foreground border border-dashed rounded bg-muted/10">
                Daftar tagihan yang belum dibayar
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info" className="mt-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-center h-24 text-[10px] text-muted-foreground border border-dashed rounded bg-muted/10">
                Informasi koordinat, foto, atau catatan
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
