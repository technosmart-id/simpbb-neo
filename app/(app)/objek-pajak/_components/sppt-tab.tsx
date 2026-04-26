'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { 
  Loader2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  User,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'

interface SpptTabProps {
  initialData: any
}

export function SpptTab({ initialData }: SpptTabProps) {
  const orpc = useORPC()
  const [selectedYear, setSelectedYear] = React.useState<number | undefined>()

  const { data: history, isLoading } = useQuery({
    ...orpc.objekPajak.getSpptHistory.queryOptions({
      input: {
        kdPropinsi: initialData.kdPropinsi,
        kdDati2: initialData.kdDati2,
        kdKecamatan: initialData.kdKecamatan,
        kdKelurahan: initialData.kdKelurahan,
        kdBlok: initialData.kdBlok,
        noUrut: initialData.noUrut,
        kdJnsOp: initialData.kdJnsOp,
      }
    }),
    enabled: !!initialData,
  })

  React.useEffect(() => {
    if (history && history.length > 0 && !selectedYear) {
      setSelectedYear(history[0].thnPajakSppt)
    }
  }, [history, selectedYear])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 border border-dashed rounded-xl bg-muted/5">
        <FileText className="h-10 w-10 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground font-medium">Belum ada riwayat SPPT untuk NOP ini.</p>
      </div>
    )
  }

  const years = history.map(h => h.thnPajakSppt).sort((a, b) => b - a)
  const currentSppt = history.find(h => h.thnPajakSppt === selectedYear) || history[0]
  const currentIndex = years.indexOf(currentSppt.thnPajakSppt)

  const handlePrev = () => {
    if (currentIndex < years.length - 1) {
      setSelectedYear(years[currentIndex + 1])
    }
  }

  const handleNext = () => {
    if (currentIndex > 0) {
      setSelectedYear(years[currentIndex - 1])
    }
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden">
      <CardHeader className="bg-muted/30 border-b py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10 text-primary">
               <FileText className="h-5 w-5" />
             </div>
             <div>
               <CardTitle className="text-lg">Detail SPPT Tahun {currentSppt.thnPajakSppt}</CardTitle>
               <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-2 py-0">SIKLUS 1</Badge>
                  <span className="text-xs text-muted-foreground uppercase font-medium">Salinan Resmi</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border shadow-sm">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-md"
              onClick={handlePrev}
              disabled={currentIndex === years.length - 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select 
              value={selectedYear?.toString()} 
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="h-7 w-[100px] font-bold text-xs border-none shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()} className="font-medium">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-md"
              onClick={handleNext}
              disabled={currentIndex === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: WP & Object Info */}
          <div className="p-6 space-y-8 border-r border-muted/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                <User className="h-3.5 w-3.5" />
                Data Wajib Pajak
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Wajib Pajak</span>
                <p className="text-xl font-black text-foreground uppercase tracking-tight">{currentSppt.nmWp}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tgl. Terbit</span>
                  <p className="text-sm font-semibold">{currentSppt.tglTerbit ? format(new Date(currentSppt.tglTerbit), 'dd MMM yyyy') : '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tgl. Jatuh Tempo</span>
                  <p className="text-sm font-semibold text-destructive">{currentSppt.tglJatuhTempo ? format(new Date(currentSppt.tglJatuhTempo), 'dd MMM yyyy') : '—'}</p>
                </div>
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                <MapPin className="h-3.5 w-3.5" />
                Fisik Objek Pajak
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Luas Bumi</span>
                  </div>
                  <p className="text-lg font-bold">{currentSppt.luasBumi?.toLocaleString()}<span className="text-xs font-normal text-muted-foreground ml-1">m²</span></p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Luas Bangunan</span>
                  </div>
                  <p className="text-lg font-bold">{currentSppt.luasBng?.toLocaleString()}<span className="text-xs font-normal text-muted-foreground ml-1">m²</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calculations & Payment */}
          <div className="p-6 space-y-8 bg-muted/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                <DollarSign className="h-3.5 w-3.5" />
                Kalkulasi PBB
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">NJOP Bumi</span>
                  <span className="font-mono font-bold">Rp {currentSppt.njopBumi?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">NJOP Bangunan</span>
                  <span className="font-mono font-bold">Rp {currentSppt.njopBng?.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-foreground">Total NJOP</span>
                  <span className="font-mono">Rp {currentSppt.njopSppt?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>NJOPTKP</span>
                  <span className="font-mono">- Rp {currentSppt.njoptkpSppt?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-primary">
                  <span>NJKP</span>
                  <span className="font-mono">Rp {currentSppt.njkpSppt?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background border shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PBB Harus Dibayar</span>
                  <p className="text-2xl font-black tracking-tight text-primary">Rp {currentSppt.pbbHarusDibayar?.toLocaleString()}</p>
                </div>
                {currentSppt.statusPembayaran === 1 || currentSppt.statusPembayaran === 2 ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20 gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" />
                    LUNAS
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20 gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="h-3 w-3" />
                    BELUM BAYAR
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 border-t py-3 flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
        <Info className="h-3 w-3" />
        Data ini merupakan snapshot saat SPPT diterbitkan. Perubahan data terbaru dapat dilihat di tab Bumi/Bangunan.
      </CardFooter>
    </Card>
  )
}
