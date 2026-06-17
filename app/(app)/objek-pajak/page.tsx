'use client'

import * as React from 'react'
import { Search, Plus, Table2, Loader2 } from 'lucide-react'
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
import { SpptTab } from './_components/sppt-tab'
import { TunggakanTab } from './_components/tunggakan-tab'
import { InfoTab } from './_components/info-tab'

function ObjekPajakPageContent() {
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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card dark:bg-card/50 backdrop-blur-sm p-3 rounded-xl border shadow-sm dark:shadow-primary/5">
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
                className="pl-10 h-10 w-full bg-background/50 focus-visible:ring-primary/30 transition-all"
              />
            </div>
            <ComboboxContent className="dark:bg-slate-900/95 dark:backdrop-blur-md">
              <ComboboxList>
                {searchResults.data?.map((item) => (
                  <ComboboxItem key={formatNop(item)} value={item} className="cursor-pointer">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm text-foreground">{formatNop(item)}</span>
                      <span className="text-[10px] text-muted-foreground leading-none">
                        {item.nmWpSppt} • {item.jalanOp}
                      </span>
                    </div>
                  </ComboboxItem>
                ))}
                <ComboboxEmpty className="py-6 text-center text-xs text-muted-foreground">
                  {searchResults.isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Mencari...</span>
                    </div>
                  ) : "Tidak ada hasil."}
                </ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <Link href="/objek-pajak/list">
            <Button variant="outline" className="ml-2 h-10 px-4 font-bold border-primary/20 text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
              <Table2 className="h-4 w-4 mr-1.5" />
              List
            </Button>
          </Link>
          <Button 
            onClick={() => { setData(null); setSearchQuery(''); }}
            className="ml-2 h-10 px-4 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Baru
          </Button>
        </div>

        <div className="hidden xl:block">
          <Separator orientation="vertical" className="h-10 opacity-50" />
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm px-2">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-muted-foreground uppercase leading-tight tracking-widest opacity-70">Wajib Pajak</span>
            <span className="font-bold text-foreground truncate max-w-[180px] text-sm">
              {data?.subjekPajak?.nmWp ?? "—"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] font-black text-muted-foreground uppercase leading-tight tracking-widest opacity-70">Wilayah</span>
            <span className="font-semibold text-foreground text-sm">
              {data?.kdKecamatan ?? "—"} / {data?.kdKelurahan ?? "—"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] font-black text-muted-foreground uppercase leading-tight tracking-widest opacity-70">Luas (m²)</span>
            <span className="font-semibold text-foreground text-sm">
              T: {data?.luasBumi ?? 0} | B: {data?.luasBangunan ?? 0}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] font-black text-muted-foreground uppercase leading-tight tracking-widest opacity-70">ZNT</span>
            <span className="font-black text-primary text-sm">{data?.kdZnt ?? "—"}</span>
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
          <SpptTab initialData={data} />
        </TabsContent>

        <TabsContent value="tunggakan">
          <TunggakanTab initialData={data} />
        </TabsContent>

        <TabsContent value="info">
          <InfoTab initialData={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ObjekPajakPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ObjekPajakPageContent />
    </React.Suspense>
  )
}
