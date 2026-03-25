'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NopInput } from '@/components/nop/nop-input'
import { type NopParts, formatNop } from '@/lib/utils/nop'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Map, Loader2, MapPin, Search } from 'lucide-react'
import { formatRupiah } from '@/components/data-table/column-helpers'

// Dynamic import to prevent SSR (leaflet requires window)
const LeafletMap = dynamic(() => import('@/components/peta/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-md border bg-muted flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

export default function PetaPage() {
  const orpc = useORPC()
  const [nop, setNop] = React.useState<NopParts | undefined>()
  const [searchNop, setSearchNop] = React.useState<NopParts | null>(null)

  const spopQuery = useQuery({
    ...orpc.objekPajak.getByNop.queryOptions({ input: searchNop! }),
    enabled: !!searchNop,
  })

  interface SpopData {
    jlnOp?: string | null;
    luasBumi?: string | number | null;
    wp?: { nmWp?: string | null } | null;
    koordinat?: string | null;
  }

  const spop = spopQuery.data as SpopData | undefined

  // Default center: Indonesia
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.5, 118.0])
  const [mapZoom, setMapZoom] = React.useState(5)

  function handleSearch() {
    if (!nop) return
    setSearchNop(nop)
  }

  // If SPOP has coordinates (future: from koordinat field), center map there
  const markerPosition: [number, number] | null = null // Will use coordinate data when available

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Peta</h1>
          <p className="text-muted-foreground">Peta interaktif objek pajak PBB</p>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-500/50 bg-amber-500/10">
          <MapPin className="w-3 h-3 mr-1" />
          Tanpa Koordinat
        </Badge>
      </div>

      {/* NOP search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-2">
            <div className="space-y-1 flex-1">
              <label className="text-sm font-medium">Cari Objek Pajak</label>
              <NopInput value={nop} onChange={setNop} />
            </div>
            <Button onClick={handleSearch} disabled={!nop || spopQuery.isLoading}>
              {spopQuery.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {spop && (
            <div className="mt-3 rounded-md border bg-muted/30 p-3 text-sm grid grid-cols-2 gap-x-8 gap-y-1">
              <div><span className="text-muted-foreground">NOP:</span> <span className="font-mono text-xs">{searchNop ? formatNop(searchNop) : '-'}</span></div>
              <div><span className="text-muted-foreground">WP:</span> {spop.wp?.nmWp ?? '-'}</div>
              <div><span className="text-muted-foreground">Alamat OP:</span> {spop.jlnOp ?? '-'}</div>
              <div><span className="text-muted-foreground">Luas Bumi:</span> {Number(spop.luasBumi).toLocaleString('id-ID')} m²</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <div className="rounded-md overflow-hidden border">
        <LeafletMap
          center={mapCenter}
          zoom={mapZoom}
          markers={markerPosition ? [{ position: markerPosition, popup: searchNop ? formatNop(searchNop) : '' }] : []}
        />
      </div>

      {/* Info panel */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Map className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-700">Data Koordinat Belum Tersedia</p>
              <p className="text-muted-foreground mt-1">
                Peta interaktif siap digunakan namun memerlukan data koordinat (latitude/longitude) untuk setiap objek pajak.
                Data koordinat dapat ditambahkan melalui import GeoJSON atau SHP, atau input manual per objek pajak di formulir SPOP.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Peta menggunakan OpenStreetMap (Leaflet) — tersedia secara gratis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
