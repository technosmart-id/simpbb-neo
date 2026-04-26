'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Save,
  RotateCcw,
  Loader2,
  Plus,
  Trash2,
  History,
  Building2,
  Calendar,
  Zap,
  Box,
  Cylinder,
  Waves,
  Wind,
  Flame,
  Search
} from 'lucide-react'
import { toast } from 'sonner'
import { useORPC } from '@/lib/orpc/react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

// Helper components for consistent field layout
const FieldGroup = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-2", className)}>{children}</div>
)

const Field = ({ label, children, colSpan = 12 }: { label: string, children: React.ReactNode, colSpan?: number }) => (
  <div className={cn("flex flex-col gap-1", `md:col-span-${colSpan}`)}>
    <label className="text-xs font-bold text-foreground uppercase tracking-wider">{label}</label>
    <div>{children}</div>
  </div>
)

const SectionTitle = ({ title, icon: Icon }: { title: string, icon?: any }) => (
  <div className="flex items-center gap-2 border-b pb-1 mb-3">
    {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
    <h4 className="text-xs font-black text-foreground uppercase tracking-tight">{title}</h4>
  </div>
)

const lspopSchema = z.object({
  // Header
  noUrutBng: z.string(),
  kdJpb: z.string(),
  noFormulirLspop: z.string().optional(),
  thDibangun: z.string(),
  thRenovasi: z.string().optional(),
  luasBng: z.number().min(1),
  jmlLantai: z.number().min(1),
  kondisiBng: z.string(),
  konstruksiBng: z.string(),
  atapBng: z.string(),
  dindingBng: z.string(),
  lantaiBng: z.string(),
  langitBng: z.string(),
  dayaListrik: z.number().optional(),
  // ... more fields as needed
})

type LspopFormValues = z.infer<typeof lspopSchema>

interface LspopFormProps {
  initialData?: any
  onSaveSuccess?: () => void
}

export function LspopForm({ initialData, onSaveSuccess }: LspopFormProps) {
  const orpc = useORPC()
  const [activeBng, setActiveBng] = React.useState(1)
  const [loading, setLoading] = React.useState(false)

  const { data: lookups } = useQuery(
    orpc.lookup.getMultipleGroups.queryOptions({
      input: {
        groups: ['21', '22', '41', '42', '43', '44', '28', '39', '40']
      }
    })
  )

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<LspopFormValues>({
    resolver: zodResolver(lspopSchema),
    defaultValues: {
      noUrutBng: '1',
      jmlLantai: 1,
      kondisiBng: '1',
      konstruksiBng: '1',
      atapBng: '1',
      dindingBng: '1',
      lantaiBng: '1',
      langitBng: '1',
    }
  })

  const onSubmit = async (values: LspopFormValues) => {
    setLoading(true)
    try {
      // Mock save
      await new Promise(r => setTimeout(r, 1000))
      toast.success("Data LSPOP berhasil disimpan")
      onSaveSuccess?.()
    } catch (err) {
      toast.error("Gagal menyimpan data LSPOP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 1. Header Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-3 rounded-lg border border-dashed">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground uppercase">Bangunan Ke</span>
            <div className="flex items-center gap-2">
              <Select value={String(activeBng)} onValueChange={(v) => setActiveBng(parseInt(v))}>
                <SelectTrigger className="h-8 w-full font-bold bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button type="button" size="icon" variant="outline" className="h-8 w-8 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="outline" className="h-8 w-8 text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground uppercase">Jumlah Bangunan</span>
            <span className="text-sm font-black text-foreground">4</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground uppercase">Tgl Kunjungan</span>
            <Input type="date" className="h-8 text-xs font-mono w-32" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" className="h-8 font-bold gap-2 shadow-sm">
            <History className="h-3.5 w-3.5" />
            Riwayat Per NOP
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 font-bold gap-2 shadow-sm">
            <History className="h-3.5 w-3.5" />
            Riwayat Input
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Core Details */}
        <div className="xl:col-span-8 space-y-4">
          <Card className="shadow-none border-muted">
            <CardContent className="p-4 space-y-4">
              <SectionTitle title="Rincian Data Bangunan" icon={Building2} />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Left Side: General Info */}
                <div className="space-y-2">
                  {/* JNS PENGGUNAAN */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-4 text-xs font-black text-foreground uppercase">Jns Penggunaan</label>
                    <div className="md:col-span-8">
                      <Select defaultValue="07">
                        <SelectTrigger className="h-8 w-full font-bold uppercase bg-muted/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">01. PERUMAHAN</SelectItem>
                          <SelectItem value="07">07. HOTEL/WISMA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* LUAS & TH DIBANGUN */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-2 text-xs font-black text-foreground uppercase">Luas</label>
                    <div className="md:col-span-4">
                      <Input type="number" {...register('luasBng')} className="h-8 font-mono bg-yellow-50/50" />
                    </div>
                    <label className="md:col-span-3 text-right pr-2 text-xs font-black text-foreground uppercase">Th Dibangun</label>
                    <div className="md:col-span-3">
                      <Input type="number" {...register('thDibangun')} className="h-8 font-mono" />
                    </div>
                  </div>

                  {/* JML LANTAI & TH RENOVASI */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-2 text-xs font-black text-foreground uppercase">Jml Lantai</label>
                    <div className="md:col-span-4">
                      <Input type="number" {...register('jmlLantai')} className="h-8 font-mono" />
                    </div>
                    <label className="md:col-span-3 text-right pr-2 text-xs font-black text-foreground uppercase">Th Renovasi</label>
                    <div className="md:col-span-3">
                      <Input type="number" {...register('thRenovasi')} className="h-8 font-mono" />
                    </div>
                  </div>

                  {/* KONDISI & LISTRIK */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-2 text-xs font-black text-foreground uppercase">Kondisi</label>
                    <div className="md:col-span-4">
                      <Controller
                        name="kondisiBng"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-8 w-full font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {lookups?.['21']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <label className="md:col-span-3 text-right pr-2 text-xs font-black text-foreground uppercase">Listrik (Watt)</label>
                    <div className="md:col-span-3">
                      <Input type="number" {...register('dayaListrik')} className="h-8 font-mono" />
                    </div>
                  </div>

                  {/* Full Width Fields */}
                  {[
                    { label: 'Konstruksi', name: 'konstruksiBng', group: '22' },
                    { label: 'Atap', name: 'atapBng', group: '41' },
                    { label: 'Dinding', name: 'dindingBng', group: '42' },
                    { label: 'Lantai', name: 'lantaiBng', group: '43' },
                    { label: 'Langit2', name: 'langitBng', group: '44' },
                  ].map((f) => (
                    <div key={f.name} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <label className="md:col-span-2 text-xs font-black text-foreground uppercase">{f.label}</label>
                      <div className="md:col-span-10">
                        <Controller
                          name={f.name as any}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-8 w-full font-bold uppercase">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.[f.group]?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Side: Usage Specific (Hotel/Wisma Mockup) */}
                <div className="space-y-2 border-l pl-10 border-dashed">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-none font-black text-[10px]">HOTEL/WISMA</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-6 text-xs font-black text-foreground uppercase">Jenis Hotel</label>
                    <div className="md:col-span-6">
                      <Select defaultValue="0">
                        <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">NON RESORT</SelectItem>
                          <SelectItem value="1">RESORT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-6 text-xs font-black text-foreground uppercase">Jml Bintang</label>
                    <div className="md:col-span-6">
                      <Select defaultValue="0">
                        <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">NON BINTANG</SelectItem>
                          <SelectItem value="1">1 BINTANG</SelectItem>
                          <SelectItem value="2">2 BINTANG</SelectItem>
                          <SelectItem value="3">3 BINTANG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-9 text-xs font-black text-foreground uppercase">Jml Kamar (Bh)</label>
                    <div className="md:col-span-3">
                      <Input type="number" defaultValue={0} className="h-8 font-mono text-right" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-9 text-xs font-black text-foreground uppercase">Luas Kmr dg AC Sentral (m²)</label>
                    <div className="md:col-span-3">
                      <Input type="number" defaultValue={0} className="h-8 font-mono text-right" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-9 text-xs font-black text-foreground uppercase">Luas Ruang Lain dg AC Sentral (m²)</label>
                    <div className="md:col-span-3">
                      <Input type="number" defaultValue={0} className="h-8 font-mono text-right" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fasilitas Section (Grid) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* COLUMN 1 */}
            <div className="space-y-4">
              {/* AC */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Air Conditioner (AC)" icon={Wind} />
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs font-black uppercase">AC Split (Bh)</label>
                      <Input type="number" defaultValue={0} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs font-black uppercase">AC Window (Bh)</label>
                      <Input type="number" defaultValue={0} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase">AC Central</label>
                      <div className="flex items-center gap-2">
                        <Checkbox id="ac-ada" />
                        <label htmlFor="ac-ada" className="text-xs font-bold uppercase">Ada</label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PAGAR */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Pagar" icon={Box} />
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs font-black uppercase">Panjang (m)</label>
                      <Input type="number" defaultValue={0} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <RadioGroup defaultValue="baja" className="flex gap-4 pt-1">
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="baja" id="baja" className="h-3 w-3" />
                        <label htmlFor="baja" className="text-xs font-black uppercase">Baja/Besi</label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="bata" id="bata" className="h-3 w-3" />
                        <label htmlFor="bata" className="text-xs font-black uppercase">Bata/Batako</label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* KOLAM RENANG */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Kolam Renang" icon={Waves} />
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs font-black uppercase">Luas (m²)</label>
                      <Input type="number" defaultValue={0} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <RadioGroup defaultValue="plester" className="flex gap-4 pt-1">
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="plester" id="plester" className="h-3 w-3" />
                        <label htmlFor="plester" className="text-xs font-black uppercase">Diplester</label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="pelapis" id="pelapis" className="h-3 w-3" />
                        <label htmlFor="pelapis" className="text-xs font-black uppercase">Dgn Pelapis</label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* COLUMN 2 */}
            <div className="space-y-4">
              {/* PERKERASAN HALAMAN */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Perkerasan Halaman (m²)" icon={Box} />
                  <div className="space-y-2">
                    {['Ringan', 'Sedang', 'Berat', 'DG Penutup Lantai'].map(l => (
                      <div key={l} className="grid grid-cols-12 gap-2 items-center">
                        <label className="col-span-8 text-xs font-black uppercase">{l}</label>
                        <Input type="number" defaultValue={0} className="col-span-4 h-7 font-mono text-right" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* JML LIFT */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Jml Lift (Bh)" icon={Box} />
                  <div className="space-y-2">
                    {['Penumpang', 'Kapsul', 'Barang'].map(l => (
                      <div key={l} className="grid grid-cols-12 gap-2 items-center">
                        <label className="col-span-8 text-xs font-black uppercase">{l}</label>
                        <Input type="number" defaultValue={0} className="col-span-4 h-7 font-mono text-right" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* COLUMN 3 */}
            <div className="space-y-4">
              {/* LAPANGAN TENIS */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Jml Lapangan Tenis (Bh)" icon={Box} />
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 mb-1">
                      <div className="col-span-6" />
                      <div className="col-span-3 text-[9px] font-black text-center leading-tight">DGN LAMPU</div>
                      <div className="col-span-3 text-[9px] font-black text-center leading-tight">TANPA LAMPU</div>
                    </div>
                    {['Beton', 'Aspal', 'Tanah Liat/Rumput'].map(l => (
                      <div key={l} className="grid grid-cols-12 gap-2 items-center">
                        <label className="col-span-6 text-xs font-black uppercase leading-tight">{l}</label>
                        <Input type="number" defaultValue={0} className="col-span-3 h-7 font-mono text-right" />
                        <Input type="number" defaultValue={0} className="col-span-3 h-7 font-mono text-right" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* TANGGA BERJALAN */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Tangga Berjalan" icon={Box} />
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 mb-1">
                      <div className="col-span-8" />
                      <div className="col-span-4 text-[9px] font-black text-center uppercase">Jumlah (Bh)</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs font-black uppercase">Lbr &lt;= 0,8 m</label>
                      <Input type="number" defaultValue={0} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs font-black uppercase">Lbr &gt; 0,8 m</label>
                      <Input type="number" defaultValue={0} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PEMADAM KEBAKARAN */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Pemadam Kebakaran" icon={Flame} />
                  <div className="space-y-2">
                    {['Splinkler', 'Hydrant', 'Fire Alarm'].map(l => (
                      <div key={l} className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase">{l}</label>
                        <div className="flex items-center gap-2">
                          <Checkbox id={`fire-${l}`} />
                          <label htmlFor={`fire-${l}`} className="text-xs font-bold uppercase">Ada</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary & NJOP */}
        <div className="xl:col-span-4 space-y-4">
          <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardContent className="p-4 space-y-6">
              <SectionTitle title="Nilai Bangunan (per 1000)" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase">Total</span>
                  <span className="text-xl font-black text-primary">52,160</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase">Individual</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue={0} className="h-8 w-24 text-right font-mono" />
                    <Button type="button" size="icon" variant="outline" className="h-8 w-8">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg border border-dashed border-primary/30 mt-4">
                  <span className="text-xs font-black text-foreground uppercase mb-1">NJOP/m²</span>
                  <span className="text-4xl font-black text-foreground tracking-tighter">823</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-bold text-foreground uppercase">Kelas</span>
                    <Badge variant="outline" className="text-lg font-black border-2 border-primary text-primary">023</Badge>
                  </div>
                </div>

                <Button type="button" className="w-full h-10 font-bold uppercase tracking-widest shadow-lg">
                  Daftar Kelas Bgn...
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-muted">
            <CardContent className="p-4 space-y-4">
              <SectionTitle title="Petugas Pendataan" />
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground uppercase">Tgl Pendataan</span>
                  <span className="text-xs font-bold">1/5/2004 12:00:00 AM</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground uppercase">NIP Pendata</span>
                  <span className="text-xs font-bold">12345678</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground uppercase">Nama Pendata</span>
                  <span className="text-xs font-bold uppercase">Admin</span>
                </div>
              </div>

              <Separator className="my-4" />

              <SectionTitle title="Petugas Pemeriksaan" />
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground uppercase">Tgl Pemeriksaan</span>
                  <span className="text-xs font-bold">1/5/2004 12:00:00 AM</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground uppercase">NIP Pemeriksa</span>
                  <span className="text-xs font-bold">19690429 199803 1 00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" className="h-14 font-black uppercase text-base shadow-xl gap-3" disabled={loading}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
              Simpan LSPOP
            </Button>
            <Button type="button" variant="outline" size="lg" className="h-10 font-bold uppercase gap-2" onClick={() => reset()}>
              <RotateCcw className="h-4 w-4" />
              Reset Data
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-muted", className)} />
}
