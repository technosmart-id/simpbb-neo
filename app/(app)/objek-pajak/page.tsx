'use client'

import * as React from 'react'
import { Search, Plus, Table2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { orpcClient } from '@/lib/orpc/client'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { useSearchParams } from 'next/navigation'
import { formatNop } from '@/lib/utils/nop'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox'
import { SpopForm } from './_components/spop-form'
import { LspopForm } from './_components/lspop-form'

export default function ObjekPajakPage() {
  const orpc = useORPC()
  const [mounted, setMounted] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)

  const deferredSearchQuery = React.useDeferredValue(searchQuery)
  const searchResults = useQuery(
    orpc.objekPajak.search.queryOptions({
      input: { query: deferredSearchQuery, limit: 10 },
    })
  )

  const searchParams = useSearchParams()

  React.useEffect(() => {
    setMounted(true)
    
    const nopParam = searchParams.get('nop')
    if (nopParam && nopParam.length === 18) {
      const nop = {
        kdPropinsi: nopParam.slice(0, 2),
        kdDati2: nopParam.slice(2, 4),
        kdKecamatan: nopParam.slice(4, 7),
        kdKelurahan: nopParam.slice(7, 10),
        kdBlok: nopParam.slice(10, 13),
        noUrut: nopParam.slice(13, 17),
        kdJnsOp: nopParam.slice(17, 18),
      }
      handleSelect(nop)
    }
  }, [searchParams])

  const handleSelect = async (item: any) => {
    setLoading(true)
    try {
      const res = await orpcClient.objekPajak.getByNop(item)
      if (res) {
        setData(res)
      } else {
        setData(null)
      }
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async (nop?: any) => {
    const target = nop || data
    if (!target) return
    
    setLoading(true)
    try {
      const res = await orpcClient.objekPajak.getByNop(target)
      if (res) {
        setData(res)
      }
    } catch (err) {
      console.error("Refresh failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Header & NOP Search */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card p-3 rounded-xl border shadow-sm">
        <div className="flex flex-1 max-w-xl items-center">
          <Combobox 
            onValueChange={(val) => {
              if (val) handleSelect(val)
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <ComboboxInput
                placeholder="Cari NOP atau Nama Wajib Pajak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 w-full"
              />
            </div>
            <ComboboxContent>
              <ComboboxList>
                {searchResults.data?.map((item) => (
                  <ComboboxItem key={formatNop(item)} value={item}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm">{formatNop(item)}</span>
                      <span className="text-[10px] text-muted-foreground leading-none">
                        {item.nmWp} • {item.jalanOp}
                      </span>
                    </div>
                  </ComboboxItem>
                ))}
                <ComboboxEmpty>
                  {searchResults.isLoading ? "Mencari..." : "Tidak ada hasil."}
                </ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <Link href="/objek-pajak/list">
            <Button variant="outline" className="ml-2 h-10 px-4 font-bold border-primary/20 text-primary hover:bg-primary/5">
              <Table2 className="h-4 w-4 mr-1" />
              List NOP
            </Button>
          </Link>
          <Button 
            onClick={() => { setData(null); setSearchQuery(''); }}
            className="ml-2 h-10 px-4 font-bold shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Baru
          </Button>
        </div>

        <div className="hidden xl:block">
          <Separator orientation="vertical" className="h-10" />
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-tight tracking-wider">Wajib Pajak</span>
            <span className="font-bold text-foreground truncate max-w-[180px]">
              {data?.subjekPajak?.nmWp ?? "—"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-tight tracking-wider">Wilayah</span>
            <span className="font-semibold text-foreground">
              {data?.kdKecamatan ?? "—"} / {data?.kdKelurahan ?? "—"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-tight tracking-wider">Luas (m²)</span>
            <span className="font-semibold text-foreground">
              T: {data?.luasBumi ?? 0} | B: {data?.luasBangunan ?? 0}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-tight tracking-wider">ZNT</span>
            <span className="font-bold text-primary">{data?.kdZnt ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* 2. Form Content Section */}
      <Tabs defaultValue="bumi">
        <TabsList>
          <TabsTrigger value="bumi">Bumi</TabsTrigger>
          <TabsTrigger value="bangunan" disabled={!data}>Bangunan</TabsTrigger>
          <TabsTrigger value="sppt" disabled={!data}>SPPT</TabsTrigger>
          <TabsTrigger value="tunggakan" disabled={!data}>Tunggakan</TabsTrigger>
          <TabsTrigger value="info" disabled={!data}>Info</TabsTrigger>
        </TabsList>

        <TabsContent value="bumi">
          <SpopForm key={data ? formatNop(data) : 'new'} initialData={data} onSaveSuccess={refreshData} />
        </TabsContent>

        <TabsContent value="bangunan">
          <LspopForm initialData={data} />
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
