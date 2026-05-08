'use client'

import * as React from 'react'
import { Save, RotateCcw, Wand2, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatRupiah } from '@/components/data-table/column-helpers'
import { NopInput } from '@/components/nop/nop-input'
import { orpcClient } from '@/lib/orpc/client'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { withMask } from 'use-mask-input'
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { parseNop, formatNop, type NopParts } from '@/lib/utils/nop'
import { toast } from 'sonner'

const spopFormSchema = z.object({
  // SPOP Fields
  nop: z.string(),
  nopAsal: z.string().optional(),
  nopBersama: z.string().optional(),
  noFormulirSpop: z.string().optional(),
  jnsTransaksiOp: z.string().default('1'),
  noPersil: z.string().optional(),
  jalanOp: z.string().min(1, "Jalan harus diisi"),
  rtOp: z.string().optional(),
  rwOp: z.string().optional(),
  blokKavNoOp: z.string().optional(),
  kelurahanOp: z.string().optional(),
  luasBumi: z.number().min(0),
  kdZnt: z.string().length(2, "ZNT harus 2 karakter"),
  jnsBumi: z.string().default('1'),
  nilaiSistemBumi: z.number().min(0),
  kdStatusWp: z.string().default('1'),

  // Subjek Pajak Fields
  subjekPajakId: z.string().min(1, "No. KTP/ID harus diisi"),
  nmWp: z.string().min(1, "Nama WP harus diisi"),
  statusPekerjaanWp: z.string().default('1'),
  jalanWp: z.string().min(1, "Jalan WP harus diisi"),
  rtWp: z.string().optional(),
  rwWp: z.string().optional(),
  blokKavNoWp: z.string().optional(),
  kelurahanWp: z.string().optional(),
  kotaWp: z.string().default('DENPASAR'),
  kdPosWp: z.string().optional(),
  telpWp: z.string().optional(),
  npwp: z.string().optional(),
  emailWp: z.string().email().optional().or(z.literal('')),

  // Identitas Pendata
  tglPendataanOp: z.string().optional(),
  nmPendataanOp: z.string().optional(),
  nipPendata: z.string().optional(),
  tglPemeriksaanOp: z.string().optional(),
  nmPemeriksaanOp: z.string().optional(),
  nipPemeriksaOp: z.string().optional(),

  // Beban (Joint Property)
  luasBumiBeban: z.number().optional(),
  luasBngBeban: z.number().optional(),
})

type SpopFormValues = z.infer<typeof spopFormSchema>

interface SpopFormProps {
  initialData?: any
  onSaveSuccess?: () => void
}

export function SpopForm({ initialData, onSaveSuccess }: SpopFormProps) {
  const orpc = useORPC()
  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [kelasInfo, setKelasInfo] = React.useState<{ kelasBumi: string, njopBumi: string } | null>(null)

  const { data: lookups } = useQuery(
    orpc.lookup.getMultipleGroups.queryOptions({
      input: { groups: ['08', '10', '20', '33'] }
    })
  )

  const defaultValues: Partial<SpopFormValues> = React.useMemo(() => {
    if (!initialData) return {
        kdStatusWp: '1',
        jnsTransaksiOp: '1',
        jnsBumi: '1',
        statusPekerjaanWp: '1',
        kotaWp: 'DENPASAR'
    }

    const spop = initialData
    const wp = spop.subjekPajak || {}
    const anggota = spop.anggota || {}

    return {
      nop: formatNop(spop),
      nopAsal: spop.kdPropinsiAsal ? formatNop({
        kdPropinsi: spop.kdPropinsiAsal,
        kdDati2: spop.kdDati2Asal,
        kdKecamatan: spop.kdKecamatanAsal,
        kdKelurahan: spop.kdKelurahanAsal,
        kdBlok: spop.kdBlokAsal,
        noUrut: spop.noUrutAsal,
        kdJnsOp: spop.kdJnsOpAsal,
      } as NopParts) : '',
      nopBersama: anggota.kdPropinsiInduk ? formatNop({
        kdPropinsi: anggota.kdPropinsiInduk,
        kdDati2: anggota.kdDati2Induk,
        kdKecamatan: anggota.kdKecamatanInduk,
        kdKelurahan: anggota.kdKelurahanInduk,
        kdBlok: anggota.kdBlokInduk,
        noUrut: anggota.noUrutInduk,
        kdJnsOp: anggota.kdJnsOpInduk,
      } as NopParts) : '',
      noFormulirSpop: spop.noFormulirSpop || '',
      jnsTransaksiOp: '2',
      noPersil: spop.noPersil || '',
      jalanOp: spop.jalanOp || '',
      rtOp: spop.rtOp || '',
      rwOp: spop.rwOp || '',
      blokKavNoOp: spop.blokKavNoOp || '',
      kelurahanOp: spop.kelurahanOp || '',
      luasBumi: spop.luasBumi || 0,
      kdZnt: spop.kdZnt || '',
      jnsBumi: spop.jnsBumi || '1',
      nilaiSistemBumi: spop.nilaiSistemBumi || 0,
      kdStatusWp: spop.kdStatusWp || '1',

      subjekPajakId: wp.subjekPajakId || '',
      nmWp: wp.nmWp || '',
      statusPekerjaanWp: wp.statusPekerjaanWp || '1',
      jalanWp: wp.jalanWp || '',
      rtWp: wp.rtWp || '',
      rwWp: wp.rwWp || '',
      blokKavNoWp: wp.blokKavNoWp || '',
      kelurahanWp: wp.kelurahanWp || '',
      kotaWp: wp.kotaWp || 'DENPASAR',
      kdPosWp: wp.kdPosWp || '',
      telpWp: wp.telpWp || '',
      npwp: wp.npwp || '',
      emailWp: wp.emailWp || '',

      tglPendataanOp: spop.tglPendataanOp ? new Date(spop.tglPendataanOp).toISOString().split('T')[0] : '',
      nmPendataanOp: spop.nmPendataanOp || '',
      nipPendata: spop.nipPendata || '',
      tglPemeriksaanOp: spop.tglPemeriksaanOp ? new Date(spop.tglPemeriksaanOp).toISOString().split('T')[0] : '',
      nmPemeriksaanOp: spop.nmPemeriksaanOp || '',
      nipPemeriksaOp: spop.nipPemeriksaOp || '',

      luasBumiBeban: anggota.luasBumiBeban || 0,
      luasBngBeban: anggota.luasBngBeban || 0,
    }
  }, [initialData])

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(spopFormSchema) as any,
    defaultValues
  })

  const watchNilaiSistem = watch('nilaiSistemBumi')
  const watchNopBersama = watch('nopBersama')

  React.useEffect(() => {
    setMounted(true)
    if (!initialData) {
        handleAutoNoFormulir()
    }
    reset(defaultValues)
  }, [initialData, reset, defaultValues])

  // Auto-calculate Kelas & NJOP when Nilai Sistem changes
  React.useEffect(() => {
    if (watchNilaiSistem > 0) {
      const fetchKelas = async () => {
        try {
          const res = await orpcClient.objekPajak.getKelasBumi({ nilai: watchNilaiSistem })
          if (res) {
            setKelasInfo({ kelasBumi: res.kelasBumi, njopBumi: res.njopBumi })
          } else {
            setKelasInfo(null)
          }
        } catch (err) {
          console.error("Failed to fetch kelas bumi:", err)
        }
      }
      fetchKelas()
    } else {
      setKelasInfo(null)
    }
  }, [watchNilaiSistem])

  const handleAutoNoFormulir = async () => {
    try {
      const res = await orpcClient.objekPajak.getNextNoFormulir({})
      setValue('noFormulirSpop', res.nextNoFormulir)
    } catch (err) {
      console.error("Failed to generate No. Formulir:", err)
    }
  }

  const onSubmit = async (values: any) => {
    const nopParts = parseNop(values.nop as string)
    if (!nopParts) {
      toast.error("NOP tidak valid")
      return
    }

    setLoading(true)
    try {
      const nopAsal = values.nopAsal ? parseNop(values.nopAsal) : null
      const nopInduk = values.nopBersama ? parseNop(values.nopBersama) : null

      const payload: any = {
        spop: {
          ...nopParts,
          subjekPajakId: values.subjekPajakId,
          noFormulirSpop: values.noFormulirSpop,
          jnsTransaksiOp: values.jnsTransaksiOp,
          jalanOp: values.jalanOp,
          rtOp: values.rtOp,
          rwOp: values.rwOp,
          blokKavNoOp: values.blokKavNoOp,
          kelurahanOp: values.kelurahanOp,
          luasBumi: values.luasBumi,
          kdZnt: values.kdZnt,
          jnsBumi: values.jnsBumi,
          nilaiSistemBumi: values.nilaiSistemBumi,
          kdStatusWp: values.kdStatusWp,
          noPersil: values.noPersil,
          nmPendataanOp: values.nmPendataanOp,
          nipPendata: values.nipPendata,
          tglPendataanOp: values.tglPendataanOp ? new Date(values.tglPendataanOp) : undefined,
          nmPemeriksaanOp: values.nmPemeriksaanOp,
          nipPemeriksaOp: values.nipPemeriksaOp,
          tglPemeriksaanOp: values.tglPemeriksaanOp ? new Date(values.tglPemeriksaanOp) : undefined,

          // NOP Asal mapping
          kdPropinsiAsal: nopAsal?.kdPropinsi,
          kdDati2Asal: nopAsal?.kdDati2,
          kdKecamatanAsal: nopAsal?.kdKecamatan,
          kdKelurahanAsal: nopAsal?.kdKelurahan,
          kdBlokAsal: nopAsal?.kdBlok,
          noUrutAsal: nopAsal?.noUrut,
          kdJnsOpAsal: nopAsal?.kdJnsOp,
        },
        subjekPajak: {
          subjekPajakId: values.subjekPajakId,
          nmWp: values.nmWp,
          statusPekerjaanWp: values.statusPekerjaanWp,
          jalanWp: values.jalanWp,
          rtWp: values.rtWp,
          rwWp: values.rwWp,
          blokKavNoWp: values.blokKavNoWp,
          kelurahanWp: values.kelurahanWp,
          kotaWp: values.kotaWp,
          kdPosWp: values.kdPosWp,
          telpWp: values.telpWp,
          npwp: values.npwp,
          emailWp: values.emailWp,
        }
      }

      if (nopInduk) {
        payload.anggota = {
          kdPropinsiInduk: nopInduk.kdPropinsi,
          kdDati2Induk: nopInduk.kdDati2,
          kdKecamatanInduk: nopInduk.kdKecamatan,
          kdKelurahanInduk: nopInduk.kdKelurahan,
          kdBlokInduk: nopInduk.kdBlok,
          noUrutInduk: nopInduk.noUrut,
          kdJnsOpInduk: nopInduk.kdJnsOp,
          luasBumiBeban: values.luasBumiBeban,
          luasBngBeban: values.luasBngBeban,
        }
      }

      await orpcClient.objekPajak.save(payload)
      toast.success("Data SPOP berhasil disimpan")
      onSaveSuccess?.()
    } catch (err: any) {
      console.error("Save failed:", err)
      toast.error(`Gagal menyimpan data: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* 2.1 Informasi Umum */}
            <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-foreground uppercase">Informasi Umum</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Jenis Transaksi:</span>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase rounded-sm px-2">
                  {lookups?.['33']?.find(i => i.value === watch('jnsTransaksiOp'))?.label || 'Unknown'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left: NOPs */}
                <div className="space-y-4">
                  <FieldGroup className="flex flex-col gap-2.5">
                    <Field className="gap-0.5">
                      <FieldLabel className="text-xs">NOP (Nomor Objek Pajak)</FieldLabel>
                      <FieldContent>
                        <Controller
                          name="nop"
                          control={control}
                          render={({ field }) => (
                            <NopInput 
                              value={field.value} 
                              onChange={(val) => field.onChange(val)} 
                              lockRegion={!!initialData}
                            />
                          )}
                        />
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel className="text-xs">NOP Asal</FieldLabel>
                      <FieldContent>
                        <Controller
                          name="nopAsal"
                          control={control}
                          render={({ field }) => (
                            <NopInput value={field.value} onChange={(val) => field.onChange(val)} />
                          )}
                        />
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel className="text-xs">NOP Bersama</FieldLabel>
                      <FieldContent>
                        <Controller
                          name="nopBersama"
                          control={control}
                          render={({ field }) => (
                            <NopInput value={field.value} onChange={(val) => field.onChange(val)} />
                          )}
                        />
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </div>

                {/* Right: Metadata */}
                <div className="space-y-4">
                  <FieldGroup className="flex flex-col gap-2.5">
                    <Field className="gap-0.5">
                      <FieldLabel className="text-xs">No. Formulir SPOP</FieldLabel>
                      <FieldContent className="relative">
                        <Input
                          {...register('noFormulirSpop')}
                          ref={mounted ? withMask("9999.9999.999", { placeholder: "0", showMaskOnHover: false }) : null}
                          placeholder="2026.0001.001"
                          maxLength={13}
                          className="uppercase font-mono pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-8 w-8 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors"
                          onClick={handleAutoNoFormulir}
                          title="Auto-generate"
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                        </Button>
                      </FieldContent>
                    </Field>
                    {/* Hidden Jenis Transaksi - Logic handled automatically or via Badge */}
                    <Controller
                      name="jnsTransaksiOp"
                      control={control}
                      render={({ field }) => <input type="hidden" {...field} />}
                    />
                    
                    <Field className="gap-0.5">
                      <FieldLabel className="text-xs">Peruntukan</FieldLabel>
                      <FieldContent>
                        {/* Ariefan: handle later */}
                        <Input placeholder="Peruntukan..." className="uppercase" disabled />
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel className="text-xs">No. Persil</FieldLabel>
                      <FieldContent>
                        <Input {...register('noPersil')} placeholder="5 digit" maxLength={5} className="font-mono" />
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                <Field className="md:col-span-6 gap-0.5">
                  <FieldLabel className="text-xs">Jalan</FieldLabel>
                  <FieldContent>
                    <Input {...register('jalanOp')} className="uppercase" />
                    {errors.jalanOp && <p className="text-[10px] text-destructive font-bold">{errors.jalanOp.message as string}</p>}
                  </FieldContent>
                </Field>
                <Field className="md:col-span-1 gap-0.5">
                  <FieldLabel className="text-xs">RW</FieldLabel>
                  <FieldContent>
                    <Input {...register('rwOp')} maxLength={2} className="font-mono text-center" />
                  </FieldContent>
                </Field>
                <Field className="md:col-span-1 gap-0.5">
                  <FieldLabel className="text-xs">RT</FieldLabel>
                  <FieldContent>
                    <Input {...register('rtOp')} maxLength={3} className="font-mono text-center" />
                  </FieldContent>
                </Field>
                <Field className="md:col-span-4 gap-0.5">
                  <FieldLabel className="text-xs">Blok/Kav/No</FieldLabel>
                  <FieldContent>
                    <Input {...register('blokKavNoOp')} className="uppercase" />
                  </FieldContent>
                </Field>

                <Field className="md:col-span-12 gap-0.5">
                  <FieldLabel className="text-xs">Kelurahan/Desa</FieldLabel>
                  <FieldContent>
                    <Input {...register('kelurahanOp')} className="uppercase" />
                  </FieldContent>
                </Field>

                <Field className="md:col-span-4 gap-0.5">
                  <FieldLabel className="text-xs">Luas Bumi</FieldLabel>
                  <FieldContent>
                    <Input 
                        type="number" 
                        {...register('luasBumi', { valueAsNumber: true })} 
                        className="font-mono" 
                    />
                  </FieldContent>
                </Field>
                <Field className="md:col-span-4 gap-0.5">
                  <FieldLabel className="text-xs">Kode ZNT</FieldLabel>
                  <FieldContent>
                    <Input {...register('kdZnt')} maxLength={2} className="font-mono uppercase" placeholder="AA" />
                    {errors.kdZnt && <p className="text-[10px] text-destructive font-bold">{errors.kdZnt.message as string}</p>}
                  </FieldContent>
                </Field>
                <Field className="md:col-span-4 gap-0.5">
                  <FieldLabel className="text-xs">Jenis Bumi</FieldLabel>
                  <FieldContent>
                    <Controller
                      name="jnsBumi"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Jenis Bumi" />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.['20']?.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldContent>
                </Field>

                <Field className="md:col-span-4 gap-0.5">
                  <FieldLabel className="text-xs">Nilai Sistem Bumi</FieldLabel>
                  <FieldContent>
                    <Input 
                        type="number" 
                        {...register('nilaiSistemBumi', { valueAsNumber: true })} 
                        className="font-mono" 
                    />
                  </FieldContent>
                </Field>
                <Field className="md:col-span-4 gap-0.5">
                  <FieldLabel className="text-xs">Kelas Bumi</FieldLabel>
                  <FieldContent className="flex items-center h-10 px-3 bg-muted/30 rounded-md border border-input text-sm font-semibold">
                    {kelasInfo?.kelasBumi || "—"}
                  </FieldContent>
                </Field>
                <Field className="md:col-span-4 gap-0.5">
                  <FieldLabel className="text-xs">NJOP Bumi</FieldLabel>
                  <FieldContent className="flex items-center h-10 px-3 bg-primary/5 text-primary rounded-md border border-primary/20 text-sm font-bold">
                    {kelasInfo ? formatRupiah(parseFloat(kelasInfo.njopBumi) * (watch('luasBumi') || 0)) : "Rp 0"}
                  </FieldContent>
                </Field>

                {watchNopBersama && (
                  <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-4 border-t border-dashed mt-2">
                    <Field className="gap-0.5">
                      <FieldLabel className="text-xs">Luas Bumi Beban</FieldLabel>
                      <FieldContent>
                        <Input 
                            type="number" 
                            {...register('luasBumiBeban', { valueAsNumber: true })} 
                            className="font-mono" 
                        />
                      </FieldContent>
                    </Field>
                    <Field className="gap-0.5">
                      <FieldLabel className="text-xs">Luas Bangunan Beban</FieldLabel>
                      <FieldContent>
                        <Input 
                            type="number" 
                            {...register('luasBngBeban', { valueAsNumber: true })} 
                            className="font-mono" 
                        />
                      </FieldContent>
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2.2 Subjek Pajak */}
            <div className="space-y-6 xl:border-l xl:pl-12">
            <h3 className="text-base font-bold border-b pb-2 uppercase">
              Subjek Pajak
            </h3>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              <Field className="md:col-span-6 gap-0.5">
                <FieldLabel className="text-xs">No. KTP / ID</FieldLabel>
                <FieldContent>
                  <Input {...register('subjekPajakId')} maxLength={30} className="font-mono" />
                  {errors.subjekPajakId && <p className="text-[10px] text-destructive font-bold">{errors.subjekPajakId.message as string}</p>}
                </FieldContent>
              </Field>
              <Field className="md:col-span-6 gap-0.5">
                <FieldLabel className="text-xs">Status WP</FieldLabel>
                <FieldContent>
                  <Controller
                    name="kdStatusWp"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Status WP" />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.['10']?.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                      </Select>
                    )}
                  />
                </FieldContent>
              </Field>

              <Field className="md:col-span-6 gap-0.5">
                <FieldLabel className="text-xs">Nama</FieldLabel>
                <FieldContent>
                  <Input {...register('nmWp')} className="uppercase" />
                  {errors.nmWp && <p className="text-[10px] text-destructive font-bold">{errors.nmWp.message as string}</p>}
                </FieldContent>
              </Field>
              <Field className="md:col-span-6 gap-0.5">
                <FieldLabel className="text-xs">Pekerjaan</FieldLabel>
                <FieldContent>
                  <Controller
                    name="statusPekerjaanWp"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Pekerjaan" />
                              </SelectTrigger>
                              <SelectContent>
                                {lookups?.['08']?.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                      </Select>
                    )}
                  />
                </FieldContent>
              </Field>

              <Field className="md:col-span-6 gap-0.5">
                <FieldLabel className="text-xs">Jalan</FieldLabel>
                <FieldContent>
                  <Input {...register('jalanWp')} className="uppercase" />
                  {errors.jalanWp && <p className="text-[10px] text-destructive font-bold">{errors.jalanWp.message as string}</p>}
                </FieldContent>
              </Field>
              <Field className="md:col-span-1 gap-0.5">
                <FieldLabel className="text-xs">RW</FieldLabel>
                <FieldContent>
                  <Input {...register('rwWp')} maxLength={2} className="font-mono text-center" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-1 gap-0.5">
                <FieldLabel className="text-xs">RT</FieldLabel>
                <FieldContent>
                  <Input {...register('rtWp')} maxLength={3} className="font-mono text-center" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Blok/Kav/No</FieldLabel>
                <FieldContent>
                  <Input {...register('blokKavNoWp')} className="uppercase" />
                </FieldContent>
              </Field>

              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Telepon</FieldLabel>
                <FieldContent>
                  <Input {...register('telpWp')} type="tel" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Kode Pos</FieldLabel>
                <FieldContent>
                  <Input {...register('kdPosWp')} maxLength={5} className="font-mono" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">NPWP</FieldLabel>
                <FieldContent>
                  <Input {...register('npwp')} maxLength={16} className="font-mono" />
                </FieldContent>
              </Field>

              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Kota/Kab</FieldLabel>
                <FieldContent>
                  <Input {...register('kotaWp')} className="uppercase" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Kelurahan/Desa</FieldLabel>
                <FieldContent>
                  <Input {...register('kelurahanWp')} className="uppercase" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Email</FieldLabel>
                <FieldContent>
                  <Input {...register('emailWp')} type="email" placeholder="example@domain.com" />
                </FieldContent>
              </Field>
              </FieldGroup>
            </div>
          </div>

          <div className="space-y-10 mt-10 pt-10 border-t">
            {/* 2.3 Identitas Pendata */}
          <div className="space-y-8">
            <h3 className="text-base font-bold border-b pb-2 uppercase">
              Identitas Pendata/Pejabat Yang Berwenang
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Petugas Pendata */}
              <FieldGroup className="gap-2.5">
                <Field className="gap-0.5">
                  <FieldLabel className="text-xs">Tanggal Pendataan</FieldLabel>
                  <FieldContent>
                    <Input {...register('tglPendataanOp')} type="date" />
                  </FieldContent>
                </Field>
                <Field className="gap-0.5">
                  <FieldLabel className="text-xs">Nama Pendata</FieldLabel>
                  <FieldContent>
                    <Input {...register('nmPendataanOp')} className="uppercase" />
                  </FieldContent>
                </Field>
                <Field className="gap-0.5">
                  <FieldLabel className="text-xs">NIP Pendata</FieldLabel>
                  <FieldContent>
                    <Input {...register('nipPendata')} className="font-mono" />
                  </FieldContent>
                </Field>
              </FieldGroup>

              {/* Pejabat Berwenang */}
              <FieldGroup className="gap-2.5">
                <Field className="gap-0.5">
                  <FieldLabel className="text-xs">Tanggal Pemeriksaan</FieldLabel>
                  <FieldContent>
                    <Input {...register('tglPemeriksaanOp')} type="date" />
                  </FieldContent>
                </Field>
                <Field className="gap-0.5">
                  <FieldLabel className="text-xs">Nama Pemeriksa</FieldLabel>
                  <FieldContent>
                    <Input {...register('nmPemeriksaanOp')} className="uppercase" />
                  </FieldContent>
                </Field>
                <Field className="gap-0.5">
                  <FieldLabel className="text-xs">NIP Pemeriksa</FieldLabel>
                  <FieldContent>
                    <Input {...register('nipPemeriksaOp')} className="font-mono" />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </div>
          </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
                type="button" 
                variant="outline" 
                className="px-6 font-bold" 
                onClick={() => reset()}
                disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Form
            </Button>
            <Button 
                type="submit" 
                className="px-10 font-bold flex items-center gap-2 shadow-lg"
                disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan SPOP
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
