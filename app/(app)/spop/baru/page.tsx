'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { WilayahCascade, type WilayahValue } from '@/components/wilayah/wilayah-cascade'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SpopBaruPage() {
  const router = useRouter()
  const orpc = useORPC()
  const queryClient = useQueryClient()

  // Form states
  const [wilayah, setWilayah] = React.useState<Partial<WilayahValue>>({
    kdPropinsi: '51',
    kdDati2: '71',
  })
  
  const [kdJnsOp, setKdJnsOp] = React.useState('0')
  const [subjekPajakId, setSubjekPajakId] = React.useState('')
  const [noFormulirSpop, setNoFormulirSpop] = React.useState('')
  const [jnsTransaksiOp, setJnsTransaksiOp] = React.useState('1')
  
  const [jalanOp, setJalanOp] = React.useState('')
  const [blokKavNoOp, setBlokKavNoOp] = React.useState('')
  const [rtOp, setRtOp] = React.useState('')
  const [rwOp, setRwOp] = React.useState('')
  const [kdStatusWp, setKdStatusWp] = React.useState('1')
  const [luasBumi, setLuasBumi] = React.useState('')
  const [jnsBumi, setJnsBumi] = React.useState('1')
  
  const [tglPendataan, setTglPendataan] = React.useState<Date>(new Date())
  const [nmPendata, setNmPendata] = React.useState('')
  const [nipPendata, setNipPendata] = React.useState('')
  
  const [tglPemeriksaan, setTglPemeriksaan] = React.useState<Date>(new Date())
  const [nmPemeriksa, setNmPemeriksa] = React.useState('')
  const [nipPemeriksa, setNipPemeriksa] = React.useState('')

  // Fetch next no urut when wilayah changes
  const nextNoUrutQuery = useQuery({
    ...orpc.objekPajak.getNextNoUrut.queryOptions({
      input: {
        kdPropinsi: wilayah.kdPropinsi!,
        kdDati2: wilayah.kdDati2!,
        kdKecamatan: wilayah.kdKecamatan!,
        kdKelurahan: wilayah.kdKelurahan!,
        kdBlok: wilayah.kdBlok!,
      },
    }),
    enabled: !!wilayah.kdPropinsi && !!wilayah.kdDati2 && !!wilayah.kdKecamatan && !!wilayah.kdKelurahan && !!wilayah.kdBlok,
  })

  const createMutation = useMutation(orpc.objekPajak.create.mutationOptions({
    onSuccess: () => {
      toast.success('SPOP berhasil dibuat')
      queryClient.invalidateQueries({ queryKey: ['objekPajak'] })
      router.push('/spop')
    },
    onError: (err) => {
      toast.error('Gagal membuat SPOP: ' + String(err))
    }
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!wilayah.kdKecamatan || !wilayah.kdKelurahan || !wilayah.kdBlok) {
      toast.error('Wilayah (Kecamatan, Kelurahan, Blok) harus diisi')
      return
    }

    if (!subjekPajakId) {
      toast.error('Subjek Pajak ID harus diisi')
      return
    }

    createMutation.mutate({
      kdPropinsi: wilayah.kdPropinsi!,
      kdDati2: wilayah.kdDati2!,
      kdKecamatan: wilayah.kdKecamatan!,
      kdKelurahan: wilayah.kdKelurahan!,
      kdBlok: wilayah.kdBlok!,
      noUrut: nextNoUrutQuery.data?.nextNoUrut ?? '0000', // Default if query hasn't finished
      kdJnsOp,
      subjekPajakId,
      noFormulirSpop: noFormulirSpop || undefined,
      jnsTransaksiOp,
      jalanOp,
      blokKavNoOp: blokKavNoOp || undefined,
      rtOp: rtOp || undefined,
      rwOp: rwOp || undefined,
      kelurahanOp: undefined,
      kdStatusWp,
      luasBumi: parseInt(luasBumi, 10) || 0,
      kdZnt: wilayah.kdZnt || undefined,
      jnsBumi,
      nilaiSistemBumi: 0, // Should be calculated or handled by backend
      nmPendataanOp: nmPendata || undefined,
      nipPendata: nipPendata || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">SPOP Baru</h1>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan SPOP
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lokasi Objek Pajak (NOP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WilayahCascade 
            value={wilayah} 
            onChange={setWilayah} 
            maxLevel="znt"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label>No Urut (Otomatis)</Label>
              <Input 
                value={nextNoUrutQuery.data?.nextNoUrut ?? '....'} 
                readOnly 
                className="bg-muted font-mono"
              />
              <p className="text-[10px] text-muted-foreground">Generated berdasarkan Blok yang dipilih</p>
            </div>
            <div className="space-y-2">
              <Label>Jenis OP *</Label>
              <Select value={kdJnsOp} onValueChange={setKdJnsOp}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 - Tanah</SelectItem>
                  <SelectItem value="7">7 - Jembatan</SelectItem>
                  <SelectItem value="8">8 - Jalan Tol</SelectItem>
                  <SelectItem value="9">9 - Fasilitas Lain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Subjek Pajak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjekPajakId">Subjek Pajak ID (KTP) *</Label>
              <Input 
                id="subjekPajakId"
                value={subjekPajakId}
                onChange={(e) => setSubjekPajakId(e.target.value)}
                placeholder="Contoh: 5171..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noFormulir">No. Formulir SPOP</Label>
              <Input 
                id="noFormulir"
                value={noFormulirSpop}
                onChange={(e) => setNoFormulirSpop(e.target.value)}
                placeholder="Nomor dari berkas fisik"
              />
            </div>
            <div className="space-y-2">
              <Label>Jenis Transaksi</Label>
              <RadioGroup value={jnsTransaksiOp} onValueChange={setJnsTransaksiOp} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="t1" />
                  <Label htmlFor="t1" className="font-normal">Baru</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="t2" />
                  <Label htmlFor="t2" className="font-normal">Mutasi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="t3" />
                  <Label htmlFor="t3" className="font-normal">Pembetulan</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Tanah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jalanOp">Nama Jalan / Alamat OP *</Label>
              <Input 
                id="jalanOp"
                value={jalanOp}
                onChange={(e) => setJalanOp(e.target.value)}
                placeholder="Nama jalan atau lingkungan"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="blokKav">Blok/Kav</Label>
                <Input id="blokKav" value={blokKavNoOp} onChange={(e) => setBlokKavNoOp(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rt">RT</Label>
                <Input id="rt" value={rtOp} onChange={(e) => setRtOp(e.target.value.replace(/\D/g, '').slice(0, 3))} maxLength={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rw">RW</Label>
                <Input id="rw" value={rwOp} onChange={(e) => setRwOp(e.target.value.replace(/\D/g, '').slice(0, 2))} maxLength={2} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="luasBumi">Luas Bumi (m2) *</Label>
                <Input 
                  id="luasBumi"
                  type="number"
                  value={luasBumi}
                  onChange={(e) => setLuasBumi(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Jenis Bumi</Label>
                <Select value={jnsBumi} onValueChange={setJnsBumi}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Tanah + Bangunan</SelectItem>
                    <SelectItem value="2">2 - Kavling Kosong</SelectItem>
                    <SelectItem value="3">3 - Tanah Kosong</SelectItem>
                    <SelectItem value="4">4 - Fasilitas Umum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pendataan & Pemeriksaan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pendataan */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tanggal Pendataan</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !tglPendataan && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tglPendataan ? format(tglPendataan, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={tglPendataan} onSelect={(d) => d && setTglPendataan(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nmPendata">Nama Pendata</Label>
              <Input id="nmPendata" value={nmPendata} onChange={(e) => setNmPendata(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nipPendata">NIP Pendata</Label>
              <Input id="nipPendata" value={nipPendata} onChange={(e) => setNipPendata(e.target.value)} />
            </div>
          </div>

          {/* Pemeriksaan */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tanggal Pemeriksaan</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !tglPemeriksaan && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tglPemeriksaan ? format(tglPemeriksaan, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={tglPemeriksaan} onSelect={(d) => d && setTglPemeriksaan(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nmPemeriksa">Nama Pemeriksa</Label>
              <Input id="nmPemeriksa" value={nmPemeriksa} onChange={(e) => setNmPemeriksa(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nipPemeriksa">NIP Pemeriksa</Label>
              <Input id="nipPemeriksa" value={nipPemeriksa} onChange={(e) => setNipPemeriksa(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
          {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Data SPOP
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/spop">Batal</Link>
        </Button>
      </div>
      {createMutation.isError && (
        <p className="text-sm text-destructive">{String(createMutation.error)}</p>
      )}
    </form>
  )
}
