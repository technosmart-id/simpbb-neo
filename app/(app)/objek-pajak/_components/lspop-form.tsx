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
import { orpcClient } from '@/lib/orpc/client'
import { useORPC } from '@/lib/orpc/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'

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
    <h4 className="text-xs text-foreground uppercase tracking-tight">{title}</h4>
  </div>
)

const lspopSchema = z.any() // We will use z.any() for now to handle all the dynamic DB fields flexibly

type LspopFormValues = Record<string, any>

interface LspopFormProps {
  initialData?: any
  onSaveSuccess?: () => void
}

const formDefaults: LspopFormValues = {
  kdJpb: '01',
  luasBng: '0',
  jmlLantaiBng: '1',
  thnDibangunBng: '',
  thnRenovasiBng: '',
  kondisiBng: '1',
  jnsKonstruksiBng: '1',
  jnsAtapBng: '1',
  kdDinding: '1',
  kdLantai: '1',
  kdLangitLangit: '1',
  // JPB
  klsJpb2: '1',
  klsJpb9: '1',
  tingKolomJpb3: '0',
  lbrBentJpb3: '0',
  luasMezzanineJpb3: '0',
  kelilingDindingJpb3: '0',
  dayaDukungLantaiJpb3: '1',
  tingKolomJpb8: '0',
  lbrBentJpb8: '0',
  luasMezzanineJpb8: '0',
  kelilingDindingJpb8: '0',
  dayaDukungLantaiJpb8: '1',
  klsJpb4: '1',
  klsJpb5: '1',
  klsJpb6: '1',
  jnsJpb7: '1',
  bintangJpb7: '0',
  jmlKmrJpb7: '0',
  luasKmrJpb7DgnAcSent: '0',
  luasKmrLainJpb7DgnAcSent: '0',
  typeKonstruksiJpb12: '1',
  klsJpb13: '1',
  luasKanopiJpb14: '0',
  letakTangkiJpb15: '1',
  kapasitasTangkiJpb15: '0',
  klsJpb16: '1',
  // Fasilitas
  dayaListrik: '0',
  acSplit: '0',
  acWindow: '0',
  acCentral: false,
  panjangPagar: '0',
  bahanPagar: 'bata',
  luasKolam: '0',
  bahanKolam: 'plester',
  perkerasanRingan: '0',
  perkerasanSedang: '0',
  perkerasanBerat: '0',
  perkerasanPenutup: '0',
  liftPenumpang: '0',
  liftKapsul: '0',
  liftBarang: '0',
  eskalatorKecil: '0',
  eskalatorBesar: '0',
  fireHydrant: false,
  fireAlarm: false,
  fireSplinkler: false,
}

export function LspopForm({ initialData, onSaveSuccess }: LspopFormProps) {
  const orpc = useORPC()
  const [ConfirmDialog, confirmDelete] = useConfirm()
  const [activeBng, setActiveBng] = React.useState(1)
  const [loading, setLoading] = React.useState(false)

  const { data: lookups } = useQuery(
    orpc.lookup.getMultipleGroups.queryOptions({
      input: {
        groups: ['21', '22', '41', '42', '43', '44', '28', '39', '40', '45', '46', '47', '48', '49', '50', '51', '52', '82', '09']
      }
    })
  )

  // ─── Fetch NOP Buildings ───
  const { data: buildings, refetch: refetchBuildings } = useQuery({
    ...orpc.lspop.listByNop.queryOptions({
      input: {
        kdPropinsi: initialData?.kdPropinsi ?? '',
        kdDati2: initialData?.kdDati2 ?? '',
        kdKecamatan: initialData?.kdKecamatan ?? '',
        kdKelurahan: initialData?.kdKelurahan ?? '',
        kdBlok: initialData?.kdBlok ?? '',
        noUrut: initialData?.noUrut ?? '',
        kdJnsOp: initialData?.kdJnsOp ?? '',
      }
    }),
    enabled: !!initialData?.kdPropinsi,
  })

  // ─── Fetch SPOP Data ───
  const { data: spopData } = useQuery({
    ...orpc.lspop.getSpop.queryOptions({
      input: {
        kdPropinsi: initialData?.kdPropinsi ?? '',
        kdDati2: initialData?.kdDati2 ?? '',
        kdKecamatan: initialData?.kdKecamatan ?? '',
        kdKelurahan: initialData?.kdKelurahan ?? '',
        kdBlok: initialData?.kdBlok ?? '',
        noUrut: initialData?.noUrut ?? '',
        kdJnsOp: initialData?.kdJnsOp ?? '',
      }
    }),
    enabled: !!initialData?.kdPropinsi,
  })

  // ─── Fetch Fasilitas for Active Building ───
  const { data: fasilitasBng, refetch: refetchFasilitas } = useQuery({
    ...orpc.lspop.listFasilitas.queryOptions({
      input: {
        kdPropinsi: initialData?.kdPropinsi ?? '',
        kdDati2: initialData?.kdDati2 ?? '',
        kdKecamatan: initialData?.kdKecamatan ?? '',
        kdKelurahan: initialData?.kdKelurahan ?? '',
        kdBlok: initialData?.kdBlok ?? '',
        noUrut: initialData?.noUrut ?? '',
        kdJnsOp: initialData?.kdJnsOp ?? '',
        noBng: activeBng,
      }
    }),
    enabled: !!initialData?.kdPropinsi && !!activeBng,
  })

  const { register, control, handleSubmit, watch, reset, formState: { errors, isDirty } } = useForm<LspopFormValues>({
    resolver: zodResolver(lspopSchema),
    defaultValues: formDefaults
  })

  const checkUnsavedChanges = async () => {
    if (isDirty) {
      const ok = await confirmDelete({
        title: "Perubahan Belum Disimpan",
        message: "Ada perubahan yang belum disimpan. Abaikan perubahan?",
        confirmText: "Ya, Abaikan",
        cancelText: "Kembali",
        variant: "destructive"
      })
      return ok
    }
    return true
  }

  // Watch kdJpb for dynamic rendering
  const watchJpb = watch('kdJpb')

  // Effect to populate form when switching buildings
  React.useEffect(() => {
    if (buildings) {
      const bng = buildings.find(b => b.noBng === activeBng)
      if (bng) {
        const jpb = (bng as any).jpbDetails || {}
        const fas: Record<string, any> = {}
        
        // Map fasilitas from server to form fields
        if (fasilitasBng) {
          fasilitasBng.forEach(f => {
            if (f.kdFasilitas === '01') fas.acCentral = true
            if (f.kdFasilitas === '44') fas.dayaListrik = f.jmlSatuan.toString()
            if (f.kdFasilitas === '35') { fas.panjangPagar = f.jmlSatuan.toString(); fas.bahanPagar = 'baja'; }
            if (f.kdFasilitas === '36') { fas.panjangPagar = f.jmlSatuan.toString(); fas.bahanPagar = 'bata'; }
            if (f.kdFasilitas === '12') { fas.luasKolam = f.jmlSatuan.toString(); fas.bahanKolam = 'plester'; }
            if (f.kdFasilitas === '13') { fas.luasKolam = f.jmlSatuan.toString(); fas.bahanKolam = 'pelapis'; }
            if (f.kdFasilitas === '14') fas.perkerasanRingan = f.jmlSatuan.toString()
            if (f.kdFasilitas === '15') fas.perkerasanSedang = f.jmlSatuan.toString()
            if (f.kdFasilitas === '16') fas.perkerasanBerat = f.jmlSatuan.toString()
            if (f.kdFasilitas === '17') fas.perkerasanPenutup = f.jmlSatuan.toString()
            if (f.kdFasilitas === '30') fas.liftPenumpang = f.jmlSatuan.toString()
            if (f.kdFasilitas === '31') fas.liftKapsul = f.jmlSatuan.toString()
            if (f.kdFasilitas === '32') fas.liftBarang = f.jmlSatuan.toString()
            if (f.kdFasilitas === '33') fas.eskalatorKecil = f.jmlSatuan.toString()
            if (f.kdFasilitas === '34') fas.eskalatorBesar = f.jmlSatuan.toString()
            if (f.kdFasilitas === '37') fas.fireHydrant = true
            if (f.kdFasilitas === '38') fas.fireAlarm = true
            if (f.kdFasilitas === '39') fas.fireSplinkler = true
          })
        }

        reset({
          ...formDefaults,
          kdJpb: bng.kdJpb || '',
          luasBng: bng.luasBng?.toString() || '0',
          jmlLantaiBng: bng.jmlLantaiBng?.toString() || '1',
          thnDibangunBng: bng.thnDibangunBng || '',
          thnRenovasiBng: bng.thnRenovasiBng || '',
          kondisiBng: bng.kondisiBng || '1',
          jnsKonstruksiBng: bng.jnsKonstruksiBng || '1',
          jnsAtapBng: bng.jnsAtapBng || '1',
          kdDinding: bng.kdDinding || '1',
          kdLantai: bng.kdLantai || '1',
          kdLangitLangit: bng.kdLangitLangit || '1',
          // JPB fields mapping
          klsJpb2: jpb.klsJpb2 || jpb.klsJpb9 || '1',
          klsJpb9: jpb.klsJpb9 || jpb.klsJpb2 || '1',
          tingKolomJpb3: jpb.tingKolomJpb3?.toString() || jpb.tingKolomJpb8?.toString() || '0',
          lbrBentJpb3: jpb.lbrBentJpb3?.toString() || jpb.lbrBentJpb8?.toString() || '0',
          luasMezzanineJpb3: jpb.luasMezzanineJpb3?.toString() || jpb.luasMezzanineJpb8?.toString() || '0',
          kelilingDindingJpb3: jpb.kelilingDindingJpb3?.toString() || jpb.kelilingDindingJpb8?.toString() || '0',
          dayaDukungLantaiJpb3: jpb.dayaDukungLantaiJpb3?.toString() || jpb.dayaDukungLantaiJpb8?.toString() || '1',
          tingKolomJpb8: jpb.tingKolomJpb8?.toString() || jpb.tingKolomJpb3?.toString() || '0',
          lbrBentJpb8: jpb.lbrBentJpb8?.toString() || jpb.lbrBentJpb3?.toString() || '0',
          luasMezzanineJpb8: jpb.luasMezzanineJpb8?.toString() || jpb.luasMezzanineJpb3?.toString() || '0',
          kelilingDindingJpb8: jpb.kelilingDindingJpb8?.toString() || jpb.kelilingDindingJpb3?.toString() || '0',
          dayaDukungLantaiJpb8: jpb.dayaDukungLantaiJpb8?.toString() || jpb.dayaDukungLantaiJpb3?.toString() || '1',
          klsJpb4: jpb.klsJpb4 || '1',
          klsJpb5: jpb.klsJpb5 || '1',
          klsJpb6: jpb.klsJpb6 || '1',
          jnsJpb7: jpb.jnsJpb7 || '1',
          bintangJpb7: jpb.bintangJpb7 || '0',
          jmlKmrJpb7: jpb.jmlKmrJpb7?.toString() || '0',
          luasKmrJpb7DgnAcSent: jpb.luasKmrJpb7DgnAcSent?.toString() || '0',
          luasKmrLainJpb7DgnAcSent: jpb.luasKmrLainJpb7DgnAcSent?.toString() || '0',
          typeKonstruksiJpb12: jpb.typeKonstruksiJpb12 || '1',
          klsJpb13: jpb.klsJpb13 || '1',
          luasKanopiJpb14: jpb.luasKanopiJpb14?.toString() || '0',
          letakTangkiJpb15: jpb.letakTangkiJpb15 || '1',
          kapasitasTangkiJpb15: jpb.kapasitasTangkiJpb15?.toString() || '0',
          klsJpb16: jpb.klsJpb16 || '1',
          // Fasilitas fields mapping
          ...fas,
        })
      } else {
        // Reset for new building
        reset(formDefaults)
      }
    }
  }, [activeBng, buildings, fasilitasBng, reset])

  const saveLspop = useMutation(orpc.lspop.create.mutationOptions())
  const updateLspop = useMutation(orpc.lspop.update.mutationOptions())
  const saveFasilitas = useMutation(orpc.lspop.setFasilitas.mutationOptions())

  const onSubmit = async (values: LspopFormValues) => {
    if (!initialData) return toast.error("Data NOP tidak ditemukan")
    
    // Safety check: SPOP must exist
    if (!spopData) {
      await confirmDelete({
        title: "Penyimpanan Gagal",
        message: "Data SPOP untuk NOP ini tidak ditemukan. Anda harus mengisi SPOP terlebih dahulu sebelum bisa menyimpan LSPOP.",
        confirmText: "Ok, Mengerti",
        cancelText: "Tutup",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const baseInput = {
        kdPropinsi: initialData.kdPropinsi,
        kdDati2: initialData.kdDati2,
        kdKecamatan: initialData.kdKecamatan,
        kdKelurahan: initialData.kdKelurahan,
        kdBlok: initialData.kdBlok,
        noUrut: initialData.noUrut,
        kdJnsOp: initialData.kdJnsOp,
        noBng: activeBng,
      }

      const bngData: any = {
        ...baseInput,
        kdJpb: values.kdJpb,
        luasBng: Number(values.luasBng || 0),
        jmlLantaiBng: Number(values.jmlLantaiBng || 1),
        thnDibangunBng: values.thnDibangunBng || undefined,
        thnRenovasiBng: values.thnRenovasiBng || undefined,
        kondisiBng: values.kondisiBng,
        jnsKonstruksiBng: values.jnsKonstruksiBng,
        jnsAtapBng: values.jnsAtapBng,
        kdDinding: values.kdDinding,
        kdLantai: values.kdLantai,
        kdLangitLangit: values.kdLangitLangit,
      }

      // Handle JPB specific details
      const jpbDetails: any = {}
      if (values.kdJpb === '02' || values.kdJpb === '09') {
        jpbDetails[values.kdJpb === '02' ? 'klsJpb2' : 'klsJpb9'] = values.klsJpb2
      } else if (values.kdJpb === '03' || values.kdJpb === '08') {
        const suffix = values.kdJpb === '03' ? 'Jpb3' : 'Jpb8'
        jpbDetails[`tingKolom${suffix}`] = values.tingKolomJpb3
        jpbDetails[`lbrBent${suffix}`] = values.lbrBentJpb3
        jpbDetails[`luasMezzanine${suffix}`] = values.luasMezzanineJpb3
        jpbDetails[`kelilingDinding${suffix}`] = values.kelilingDindingJpb3
        jpbDetails[`dayaDukungLantai${suffix}`] = values.dayaDukungLantaiJpb3
      } else if (values.kdJpb === '04') {
        jpbDetails.klsJpb4 = values.klsJpb4
      } else if (values.kdJpb === '05') {
        jpbDetails.klsJpb5 = values.klsJpb5
      } else if (values.kdJpb === '06') {
        jpbDetails.klsJpb6 = values.klsJpb6
      } else if (values.kdJpb === '12') {
        jpbDetails.typeKonstruksiJpb12 = values.typeKonstruksiJpb12
      } else if (values.kdJpb === '07') {
        jpbDetails.jnsJpb7 = values.jnsJpb7
        jpbDetails.bintangJpb7 = values.bintangJpb7
        jpbDetails.jmlKmrJpb7 = Number(values.jmlKmrJpb7 || 0)
        jpbDetails.luasKmrJpb7DgnAcSent = Number(values.luasKmrJpb7DgnAcSent || 0)
        jpbDetails.luasKmrLainJpb7DgnAcSent = Number(values.luasKmrLainJpb7DgnAcSent || 0)
      } else if (values.kdJpb === '13') {
        jpbDetails.klsJpb13 = values.klsJpb13
      } else if (values.kdJpb === '14') {
        jpbDetails.luasKanopiJpb14 = Number(values.luasKanopiJpb14 || 0)
      } else if (values.kdJpb === '15') {
        jpbDetails.letakTangkiJpb15 = values.letakTangkiJpb15
        jpbDetails.kapasitasTangkiJpb15 = Number(values.kapasitasTangkiJpb15 || 0)
      } else if (values.kdJpb === '16') {
        jpbDetails.klsJpb16 = values.klsJpb16
      }

      if (Object.keys(jpbDetails).length > 0) {
        bngData.jpbDetails = jpbDetails
      }

      const existingBng = buildings?.find(b => b.noBng === activeBng)
      if (existingBng) {
        await updateLspop.mutateAsync(bngData)
      } else {
        await saveLspop.mutateAsync(bngData as any)
      }

      const fasilitasInput = []

      // AC Central (Ada) -> map to 01 if checked. (Note: standard AC Central is 01, split/window usually not tracked in fasilitas table)
      if (values.acCentral) fasilitasInput.push({ kdFasilitas: '01', jmlSatuan: 1 })

      // Listrik -> map to 44
      if (values.dayaListrik) fasilitasInput.push({ kdFasilitas: '44', jmlSatuan: Number(values.dayaListrik) })

      // Pagar
      if (values.panjangPagar && Number(values.panjangPagar) > 0) {
        fasilitasInput.push({ kdFasilitas: values.bahanPagar === 'bata' ? '36' : '35', jmlSatuan: Number(values.panjangPagar) })
      }

      // Kolam Renang
      if (values.luasKolam && Number(values.luasKolam) > 0) {
        fasilitasInput.push({ kdFasilitas: values.bahanKolam === 'pelapis' ? '13' : '12', jmlSatuan: Number(values.luasKolam) })
      }

      // Perkerasan
      if (values.perkerasanRingan && Number(values.perkerasanRingan) > 0) fasilitasInput.push({ kdFasilitas: '14', jmlSatuan: Number(values.perkerasanRingan) })
      if (values.perkerasanSedang && Number(values.perkerasanSedang) > 0) fasilitasInput.push({ kdFasilitas: '15', jmlSatuan: Number(values.perkerasanSedang) })
      if (values.perkerasanBerat && Number(values.perkerasanBerat) > 0) fasilitasInput.push({ kdFasilitas: '16', jmlSatuan: Number(values.perkerasanBerat) })
      if (values.perkerasanPenutup && Number(values.perkerasanPenutup) > 0) fasilitasInput.push({ kdFasilitas: '17', jmlSatuan: Number(values.perkerasanPenutup) })

      // Lift
      if (values.liftPenumpang && Number(values.liftPenumpang) > 0) fasilitasInput.push({ kdFasilitas: '30', jmlSatuan: Number(values.liftPenumpang) })
      if (values.liftKapsul && Number(values.liftKapsul) > 0) fasilitasInput.push({ kdFasilitas: '31', jmlSatuan: Number(values.liftKapsul) })
      if (values.liftBarang && Number(values.liftBarang) > 0) fasilitasInput.push({ kdFasilitas: '32', jmlSatuan: Number(values.liftBarang) })

      // Tangga Berjalan
      if (values.eskalatorKecil && Number(values.eskalatorKecil) > 0) fasilitasInput.push({ kdFasilitas: '33', jmlSatuan: Number(values.eskalatorKecil) })
      if (values.eskalatorBesar && Number(values.eskalatorBesar) > 0) fasilitasInput.push({ kdFasilitas: '34', jmlSatuan: Number(values.eskalatorBesar) })

      // Pemadam
      if (values.fireHydrant) fasilitasInput.push({ kdFasilitas: '37', jmlSatuan: 1 })
      if (values.fireAlarm) fasilitasInput.push({ kdFasilitas: '38', jmlSatuan: 1 })
      if (values.fireSplinkler) fasilitasInput.push({ kdFasilitas: '39', jmlSatuan: 1 })

      // Tennis (Simplified mapping, mapping all 12 options here is exhaustive, using some basic ones for demonstration)
      // Ideally we'd loop through tennis combinations if provided.

      await saveFasilitas.mutateAsync({ ...baseInput, fasilitas: fasilitasInput })

      toast.success("Data LSPOP berhasil disimpan")
      reset(values)
      refetchBuildings()
      refetchFasilitas()
      onSaveSuccess?.()
    } catch (err) {
      console.error(err)
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
              <Select 
                value={String(activeBng)} 
                onValueChange={async (v) => {
                  if (await checkUnsavedChanges()) {
                    setActiveBng(parseInt(v))
                  }
                }}
              >
                <SelectTrigger className="h-8 w-32 font-bold bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* Show existing buildings */}
                  {buildings?.map(b => (
                    <SelectItem key={b.noBng} value={String(b.noBng)}>{b.noBng}</SelectItem>
                  ))}
                  {/* If current active is not in list (new building), show it */}
                  {!buildings?.some(b => b.noBng === activeBng) && (
                    <SelectItem value={String(activeBng)}>{activeBng} (BARU)</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button 
                  type="button" 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
                  onClick={async () => {
                    if (!initialData) return toast.error("Pilih NOP terlebih dahulu")
                    if (await checkUnsavedChanges()) {
                      const res = await orpcClient.lspop.nextNoBng({
                        kdPropinsi: initialData.kdPropinsi,
                        kdDati2: initialData.kdDati2,
                        kdKecamatan: initialData.kdKecamatan,
                        kdKelurahan: initialData.kdKelurahan,
                        kdBlok: initialData.kdBlok,
                        noUrut: initialData.noUrut,
                        kdJnsOp: initialData.kdJnsOp,
                      })
                      setActiveBng(Number(res.nextNoBng) || 1)
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10"
                  disabled={!buildings?.some(b => b.noBng === activeBng)}
                  onClick={async () => {
                    if (!initialData) return toast.error("Pilih NOP terlebih dahulu")
                    const ok = await confirmDelete({
                      title: "Hapus Bangunan",
                      message: `Apakah Anda yakin ingin menghapus bangunan ke-${activeBng}? Data ini akan dinonaktifkan dari sistem.`,
                      confirmText: "Hapus",
                      variant: "destructive"
                    })
                    if (ok) {
                      await orpcClient.lspop.softDelete({
                        kdPropinsi: initialData.kdPropinsi,
                        kdDati2: initialData.kdDati2,
                        kdKecamatan: initialData.kdKecamatan,
                        kdKelurahan: initialData.kdKelurahan,
                        kdBlok: initialData.kdBlok,
                        noUrut: initialData.noUrut,
                        kdJnsOp: initialData.kdJnsOp,
                        noBng: activeBng
                      })
                      toast.success("Bangunan berhasil dihapus")
                      refetchBuildings()
                      setActiveBng(buildings?.[0]?.noBng || 1)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
 
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground uppercase">Jumlah Bangunan</span>
            <span className="text-sm text-foreground">{buildings?.length || 0}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground uppercase">Tgl Kunjungan</span>
            <Input type="date" className="h-8 text-xs font-mono w-32" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Core Details */}
        <div className="xl:col-span-8 space-y-4">
          <Card>
            <CardContent>
              <SectionTitle title="Rincian Data Bangunan" icon={Building2} />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Left Side: General Info */}
                <div className="space-y-2">
                  {/* JNS PENGGUNAAN */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-4 text-xs text-foreground uppercase">Jns Penggunaan</label>
                    <div className="md:col-span-8">
                      <Controller
                        name="kdJpb"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-8 w-full font-bold uppercase bg-muted/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="01">01. PERUMAHAN</SelectItem>
                              <SelectItem value="02">02. PERKANTORAN SWASTA</SelectItem>
                              <SelectItem value="03">03. PABRIK</SelectItem>
                              <SelectItem value="04">04. TOKO/APOTIK/PASAR/RUKO</SelectItem>
                              <SelectItem value="05">05. RUMAH SAKIT/KLINIK</SelectItem>
                              <SelectItem value="06">06. OLAH RAGA/REKREASI</SelectItem>
                              <SelectItem value="07">07. HOTEL/WISMA</SelectItem>
                              <SelectItem value="08">08. BENGKEL/GUDANG/PERTANIAN</SelectItem>
                              <SelectItem value="09">09. GEDUNG PEMERINTAH</SelectItem>
                              <SelectItem value="10">10. LAIN-LAIN</SelectItem>
                              <SelectItem value="11">11. BINAAN NON KOMERSIAL</SelectItem>
                              <SelectItem value="12">12. BANGUNAN PARKIR</SelectItem>
                              <SelectItem value="13">13. APARTEMEN</SelectItem>
                              <SelectItem value="14">14. POMPA BENSIN</SelectItem>
                              <SelectItem value="15">15. TANGKI MINYAK</SelectItem>
                              <SelectItem value="16">16. GEDUNG SEKOLAH</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  {/* LUAS & TH DIBANGUN */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-2 text-xs text-foreground uppercase">Luas</label>
                    <div className="md:col-span-4">
                      <Input type="number" {...register('luasBng')} className="h-8 font-mono bg-yellow-50/50" />
                    </div>
                    <label className="md:col-span-3 text-right pr-2 text-xs text-foreground uppercase">Th Dibangun</label>
                    <div className="md:col-span-3">
                      <Input type="number" {...register('thnDibangunBng')} className="h-8 font-mono" />
                    </div>
                  </div>

                  {/* JML LANTAI & TH RENOVASI */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-2 text-xs text-foreground uppercase">Jml Lantai</label>
                    <div className="md:col-span-4">
                      <Input type="number" {...register('jmlLantaiBng')} className="h-8 font-mono" />
                    </div>
                    <label className="md:col-span-3 text-right pr-2 text-xs text-foreground uppercase">Th Renovasi</label>
                    <div className="md:col-span-3">
                      <Input type="number" {...register('thnRenovasiBng')} className="h-8 font-mono" />
                    </div>
                  </div>

                  {/* KONDISI & LISTRIK */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <label className="md:col-span-2 text-xs text-foreground uppercase">Kondisi</label>
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
                    <label className="md:col-span-3 text-right pr-2 text-xs text-foreground uppercase">Listrik (Watt)</label>
                    <div className="md:col-span-3">
                      <Input type="number" {...register('dayaListrik')} className="h-8 font-mono" />
                    </div>
                  </div>

                  {/* Full Width Fields */}
                  {[
                    { label: 'Konstruksi', name: 'jnsKonstruksiBng', group: '22' },
                    { label: 'Atap', name: 'jnsAtapBng', group: '41' },
                    { label: 'Dinding', name: 'kdDinding', group: '42' },
                    { label: 'Lantai', name: 'kdLantai', group: '43' },
                    { label: 'Langit2', name: 'kdLangitLangit', group: '44' },
                  ].map((f) => (
                    <div key={f.name} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <label className="md:col-span-2 text-xs text-foreground uppercase">{f.label}</label>
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

                {/* Right Side: Usage Specific */}
                {/* JPB 02 & 09 */}
                {(watchJpb === '02' || watchJpb === '09') && (
                  <div className="space-y-2 border-l pl-10 border-dashed">
                    <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 rounded-none text-[10px] uppercase">
                      {watchJpb === '02' ? 'Perkantoran' : 'Gedung Pemerintah'}
                    </Badge>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <label className="md:col-span-6 text-xs text-foreground uppercase">Kelas Bangunan</label>
                      <div className="md:col-span-6">
                        <Controller
                          name="klsJpb2"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.['45']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* JPB 03 & 08 */}
                {(watchJpb === '03' || watchJpb === '08') && (
                  <div className="space-y-2 border-l pl-10 border-dashed">
                    <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 rounded-none text-[10px] uppercase">
                      {watchJpb === '03' ? 'Pabrik' : 'Bengkel/Gudang'}
                    </Badge>
                    {[
                      { l: 'Tinggi Kolom (m)', n: 'tingKolomJpb3' },
                      { l: 'Lebar Bentang (m)', n: 'lbrBentJpb3' },
                      { l: 'Luas Mezzanine (m²)', n: 'luasMezzanineJpb3' },
                      { l: 'Keliling Dinding (m)', n: 'kelilingDindingJpb3' },
                    ].map(f => (
                      <div key={f.n} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                        <label className="md:col-span-9 text-xs text-foreground uppercase">{f.l}</label>
                        <Input type="number" {...register(f.n as any)} className="md:col-span-3 h-8 font-mono text-right" />
                      </div>
                    ))}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <label className="md:col-span-6 text-xs text-foreground uppercase">Daya Dukung</label>
                      <div className="md:col-span-6">
                        <Controller
                          name="dayaDukungLantaiJpb3"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.['82']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* JPB 04 & 13 */}
                {(watchJpb === '04' || watchJpb === '13') && (
                  <div className="space-y-2 border-l pl-10 border-dashed">
                    <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 rounded-none text-[10px] uppercase">
                      {watchJpb === '04' ? 'Toko/Ruko' : 'Apartemen'}
                    </Badge>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <label className="md:col-span-6 text-xs text-foreground uppercase">Kelas Bangunan</label>
                      <div className="md:col-span-6">
                        <Controller
                          name={watchJpb === '04' ? "klsJpb4" : "klsJpb13"}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.[watchJpb === '04' ? '46' : '52']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* JPB 05 */}
                {watchJpb === '05' && (
                  <div className="space-y-2 border-l pl-10 border-dashed">
                    <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 rounded-none text-[10px] uppercase">Rumah Sakit</Badge>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <label className="md:col-span-6 text-xs text-foreground uppercase">Kelas Bangunan</label>
                      <div className="md:col-span-6">
                        <Controller
                          name="klsJpb5"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.['50']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* JPB 06 & 12 */}
                {(watchJpb === '06' || watchJpb === '12') && (
                  <div className="space-y-2 border-l pl-10 border-dashed">
                    <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 rounded-none text-[10px] uppercase">
                      {watchJpb === '06' ? 'Olahraga' : 'Parkir'}
                    </Badge>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <label className="md:col-span-6 text-xs text-foreground uppercase">{watchJpb === '06' ? 'Kelas Bangunan' : 'Type Konstruksi'}</label>
                      <div className="md:col-span-6">
                        <Controller
                          name={watchJpb === '06' ? "klsJpb6" : "typeKonstruksiJpb12"}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.[watchJpb === '06' ? '47' : '49']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* JPB 07 */}
                {watchJpb === '07' && (
                  <div className="space-y-2 border-l pl-10 border-dashed">
                    <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 rounded-none text-[10px] uppercase">HOTEL/WISMA</Badge>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <label className="md:col-span-6 text-xs text-foreground uppercase">Jenis Hotel</label>
                      <div className="md:col-span-6">
                        <Controller
                          name="jnsJpb7"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value?.toString() ?? "0"}>
                              <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.['28']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <label className="md:col-span-6 text-xs text-foreground uppercase">Jml Bintang</label>
                      <div className="md:col-span-6">
                        <Controller
                          name="bintangJpb7"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value?.toString() ?? "0"}>
                              <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.['51']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    {[
                      { l: 'Jml Kamar (Bh)', n: 'jmlKmrJpb7' },
                      { l: 'Luas Kmr dg AC (m²)', n: 'luasKmrJpb7DgnAcSent' },
                      { l: 'Luas Lain dg AC (m²)', n: 'luasKmrLainJpb7DgnAcSent' },
                    ].map(f => (
                      <div key={f.n} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                        <label className="md:col-span-9 text-xs text-foreground uppercase">{f.l}</label>
                        <Input type="number" {...register(f.n as any)} className="md:col-span-3 h-8 font-mono text-right" />
                      </div>
                    ))}
                  </div>
                )}

                {/* JPB 14, 15, 16 */}
                {['14', '15', '16'].includes(watchJpb) && (
                  <div className="space-y-2 border-l pl-10 border-dashed">
                    <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 rounded-none text-[10px] uppercase">
                      {watchJpb === '14' ? 'Pompa Bensin' : watchJpb === '15' ? 'Tangki Minyak' : 'Gedung Sekolah'}
                    </Badge>
                    {watchJpb === '14' && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                        <label className="md:col-span-9 text-xs text-foreground uppercase">Luas Kanopi (m²)</label>
                        <Input type="number" {...register('luasKanopiJpb14')} className="md:col-span-3 h-8 font-mono text-right" />
                      </div>
                    )}
                    {watchJpb === '15' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                          <label className="md:col-span-6 text-xs text-foreground uppercase">Letak Tangki</label>
                          <div className="md:col-span-6">
                            <Controller
                              name="letakTangkiJpb15"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {lookups?.['09']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                          <label className="md:col-span-9 text-xs text-foreground uppercase">Kapasitas (m³)</label>
                          <Input type="number" {...register('kapasitasTangkiJpb15')} className="md:col-span-3 h-8 font-mono text-right" />
                        </div>
                      </>
                    )}
                    {watchJpb === '16' && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                        <label className="md:col-span-6 text-xs text-foreground uppercase">Kelas Bangunan</label>
                        <div className="md:col-span-6">
                          <Controller
                            name="klsJpb16"
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-8 w-full font-bold bg-muted/10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {lookups?.['48']?.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {['01', '10', '11'].includes(watchJpb) && (
                  <div className="flex flex-col items-center justify-center space-y-2 border-l pl-10 border-dashed text-muted-foreground opacity-50">
                    <Building2 className="h-10 w-10 mb-2" />
                    <span className="text-xs font-bold uppercase text-center">Spesifikasi Detail Tidak Tersedia Untuk Jenis Penggunaan Ini</span>
                  </div>
                )}
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
                      <label className="col-span-8 text-xs uppercase">AC Split (Bh)</label>
                      <Input type="number" {...register('acSplit')} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs uppercase">AC Window (Bh)</label>
                      <Input type="number" {...register('acWindow')} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase">AC Central</label>
                      <div className="flex items-center gap-2">
                        <Controller
                          name="acCentral"
                          control={control}
                          render={({ field }) => (
                            <Checkbox id="ac-ada" checked={field.value} onCheckedChange={field.onChange} />
                          )}
                        />
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
                      <label className="col-span-8 text-xs uppercase">Panjang (m)</label>
                      <Input type="number" {...register('panjangPagar')} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <Controller
                      name="bahanPagar"
                      control={control}
                      defaultValue="baja"
                      render={({ field }) => (
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4 pt-1">
                          <div className="flex items-center space-x-1.5">
                            <RadioGroupItem value="baja" id="baja" className="h-3 w-3" />
                            <label htmlFor="baja" className="text-xs uppercase">Baja/Besi</label>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <RadioGroupItem value="bata" id="bata" className="h-3 w-3" />
                            <label htmlFor="bata" className="text-xs uppercase">Bata/Batako</label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* KOLAM RENANG */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Kolam Renang" icon={Waves} />
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs uppercase">Luas (m²)</label>
                      <Input type="number" {...register('luasKolam')} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <Controller
                      name="bahanKolam"
                      control={control}
                      defaultValue="plester"
                      render={({ field }) => (
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4 pt-1">
                          <div className="flex items-center space-x-1.5">
                            <RadioGroupItem value="plester" id="plester" className="h-3 w-3" />
                            <label htmlFor="plester" className="text-xs uppercase">Diplester</label>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <RadioGroupItem value="pelapis" id="pelapis" className="h-3 w-3" />
                            <label htmlFor="pelapis" className="text-xs uppercase">Dgn Pelapis</label>
                          </div>
                        </RadioGroup>
                      )}
                    />
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
                    {[
                      { l: 'Ringan', n: 'perkerasanRingan' },
                      { l: 'Sedang', n: 'perkerasanSedang' },
                      { l: 'Berat', n: 'perkerasanBerat' },
                      { l: 'DG Penutup Lantai', n: 'perkerasanPenutup' }
                    ].map(f => (
                      <div key={f.l} className="grid grid-cols-12 gap-2 items-center">
                        <label className="col-span-8 text-xs uppercase">{f.l}</label>
                        <Input type="number" {...register(f.n)} className="col-span-4 h-7 font-mono text-right" />
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
                    {[
                      { l: 'Penumpang', n: 'liftPenumpang' },
                      { l: 'Kapsul', n: 'liftKapsul' },
                      { l: 'Barang', n: 'liftBarang' }
                    ].map(f => (
                      <div key={f.l} className="grid grid-cols-12 gap-2 items-center">
                        <label className="col-span-8 text-xs uppercase">{f.l}</label>
                        <Input type="number" {...register(f.n)} className="col-span-4 h-7 font-mono text-right" />
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
                      <div className="col-span-3 text-[9px] text-center leading-tight">DGN LAMPU</div>
                      <div className="col-span-3 text-[9px] text-center leading-tight">TANPA LAMPU</div>
                    </div>
                    {['Beton', 'Aspal', 'Tanah Liat/Rumput'].map(l => (
                      <div key={l} className="grid grid-cols-12 gap-2 items-center">
                        <label className="col-span-6 text-xs uppercase leading-tight">{l}</label>
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
                      <div className="col-span-4 text-[9px] text-center uppercase">Jumlah (Bh)</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs uppercase">Lbr &lt;= 0,8 m</label>
                      <Input type="number" {...register('eskalatorKecil')} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-8 text-xs uppercase">Lbr &gt; 0,8 m</label>
                      <Input type="number" {...register('eskalatorBesar')} className="col-span-4 h-7 font-mono text-right" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PEMADAM KEBAKARAN */}
              <Card className="shadow-none border-muted">
                <CardContent className="p-3 space-y-3">
                  <SectionTitle title="Pemadam Kebakaran" icon={Flame} />
                  <div className="space-y-2">
                    {[
                      { l: 'Splinkler', n: 'fireSplinkler' },
                      { l: 'Hydrant', n: 'fireHydrant' },
                      { l: 'Fire Alarm', n: 'fireAlarm' }
                    ].map(f => (
                      <div key={f.l} className="flex items-center justify-between">
                        <label className="text-xs uppercase">{f.l}</label>
                        <div className="flex items-center gap-2">
                          <Controller
                            name={f.n as any}
                            control={control}
                            render={({ field }) => (
                              <Checkbox id={`fire-${f.l}`} checked={field.value} onCheckedChange={field.onChange} />
                            )}
                          />
                          <label htmlFor={`fire-${f.l}`} className="text-xs font-bold uppercase">Ada</label>
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
                  <span className="text-xl text-primary">52,160</span>
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
                  <span className="text-xs text-foreground uppercase mb-1">NJOP/m²</span>
                  <span className="text-4xl text-foreground tracking-tighter">823</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-bold text-foreground uppercase">Kelas</span>
                    <Badge variant="outline" className="text-lg border-2 border-primary text-primary">023</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-muted">
            <CardContent className="p-4 space-y-4">
              <SectionTitle title="Petugas Pendataan" />
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground uppercase">Tgl Pendataan</span>
                  <span className="text-xs font-bold uppercase">1/5/2004 12:00:00 AM</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground uppercase">NIP Pendata</span>
                  <span className="text-xs font-bold uppercase">12345678</span>
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
                  <span className="text-xs font-bold uppercase">1/5/2004 12:00:00 AM</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground uppercase">NIP Pemeriksa</span>
                  <span className="text-xs font-bold uppercase">19690429 199803 1 00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" className="h-14 uppercase text-base shadow-xl gap-3" disabled={loading}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
              Simpan LSPOP
            </Button>
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </form>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-muted", className)} />
}
