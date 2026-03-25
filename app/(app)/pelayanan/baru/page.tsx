'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { NopInput } from '@/components/nop/nop-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'


// 15 standard document types for PBB pelayanan
const DOKUMEN_LIST = [
  { id: 1, nama: 'Fotokopi SPPT PBB terakhir' },
  { id: 2, nama: 'Fotokopi KTP Pemohon' },
  { id: 3, nama: 'Fotokopi Sertifikat / Bukti Kepemilikan' },
  { id: 4, nama: 'Surat Kuasa (jika dikuasakan)' },
  { id: 5, nama: 'Fotokopi IMB' },
  { id: 6, nama: 'Fotokopi Kartu Keluarga' },
  { id: 7, nama: 'Akta Jual Beli / Perjanjian' },
  { id: 8, nama: 'Surat Keterangan Lurah/Desa' },
  { id: 9, nama: 'SPOP yang telah diisi' },
  { id: 10, nama: 'LSPOP yang telah diisi' },
  { id: 11, nama: 'Foto Objek Pajak' },
  { id: 12, nama: 'Gambar Situasi/Denah' },
  { id: 13, nama: 'Surat Pernyataan' },
  { id: 14, nama: 'Bukti Pembayaran PBB Lunas' },
  { id: 15, nama: 'Dokumen Lainnya' },
]

export default function PelayananBaruPage() {
  const router = useRouter()
  const orpc = useORPC()
  const qc = useQueryClient()

  const jnsPelayananQuery = useQuery(
    orpc.referensi.listJnsPelayanan.queryOptions(),
  )

  const year = new Date().getFullYear()
  const prefix = `BRK-${year}-`
  const nextNoQuery = useQuery(
    orpc.pelayanan.nextNoPelayanan.queryOptions({ input: { prefix } }),
  )

  // Form state
  const [noPelayanan, setNoPelayanan] = React.useState('')
  const [nopParts, setNopParts] = React.useState<import('@/lib/utils/nop').NopParts | undefined>()
  const [kdJnsPelayanan, setKdJnsPelayanan] = React.useState('')
  const [tanggalPelayanan, setTanggalPelayanan] = React.useState(
    new Date().toISOString().slice(0, 10),
  )
  const [namaPemohon, setNamaPemohon] = React.useState('')
  const [alamatPemohon, setAlamatPemohon] = React.useState('')
  const [letakOp, setLetakOp] = React.useState('')
  const [catatan, setCatatan] = React.useState('')
  const [namaPetugasPenerima, setNamaPetugasPenerima] = React.useState('')
  const [nipPetugasPenerima, setNipPetugasPenerima] = React.useState('')
  const [isKolektif, setIsKolektif] = React.useState(false)
  const [dokumenIds, setDokumenIds] = React.useState<number[]>([])

  // Auto-fill noPelayanan from next number
  React.useEffect(() => {
    if (nextNoQuery.data?.nextNo) {
      setNoPelayanan(nextNoQuery.data.nextNo)
    }
  }, [nextNoQuery.data])

  const createMutation = useMutation(
    orpc.pelayanan.create.mutationOptions({
      onSuccess: (_, vars) => {
        qc.invalidateQueries({ queryKey: ['pelayanan'] })
        router.push(`/pelayanan/${vars.noPelayanan}`)
      },
    }),
  )

  function toggleDokumen(id: number) {
    setDokumenIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!noPelayanan || !kdJnsPelayanan) return
    createMutation.mutate({
      noPelayanan,
      kdJnsPelayanan,
      tanggalPelayanan,
      namaPemohon: namaPemohon || undefined,
      alamatPemohon: alamatPemohon || undefined,
      letakOp: letakOp || undefined,
      catatan: catatan || undefined,
      nipPetugasPenerima: nipPetugasPenerima || undefined,
      namaPetugasPenerima: namaPetugasPenerima || undefined,
      isKolektif: isKolektif ? 1 : 0,
      dokumenIds: dokumenIds.length > 0 ? dokumenIds : undefined,
      ...(nopParts && !isKolektif ? {
        kdPropinsi: nopParts.kdPropinsi,
        kdDati2: nopParts.kdDati2,
        kdKecamatan: nopParts.kdKecamatan,
        kdKelurahan: nopParts.kdKelurahan,
        kdBlok: nopParts.kdBlok,
        noUrut: nopParts.noUrut,
        kdJnsOp: nopParts.kdJnsOp,
      } : {}),
    })
  }

  const isComplete = !!noPelayanan && !!kdJnsPelayanan && !!tanggalPelayanan

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href="/pelayanan"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Registrasi Berkas Pelayanan</h1>
          <p className="text-muted-foreground text-sm">Pendaftaran permohonan / pelayanan PBB</p>
        </div>
      </div>

      {/* Identitas Berkas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Identitas Berkas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>No Pelayanan *</Label>
              <Input
                value={noPelayanan}
                onChange={(e) => setNoPelayanan(e.target.value)}
                placeholder="Auto-generate"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Tanggal Pelayanan *</Label>
              <Input
                type="date"
                value={tanggalPelayanan}
                onChange={(e) => setTanggalPelayanan(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Jenis Pelayanan *</Label>
            <Select value={kdJnsPelayanan} onValueChange={setKdJnsPelayanan} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis pelayanan..." />
              </SelectTrigger>
              <SelectContent>
                {jnsPelayananQuery.data?.map((j) => (
                  <SelectItem key={j.kdJnsPelayanan} value={j.kdJnsPelayanan}>
                    {j.kdJnsPelayanan} – {j.nmJenisPelayanan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="kolektif"
              checked={isKolektif}
              onCheckedChange={setIsKolektif}
            />
            <Label htmlFor="kolektif">Berkas Kolektif (lebih dari 1 NOP)</Label>
          </div>
        </CardContent>
      </Card>

      {/* NOP terkait */}
      {!isKolektif && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">NOP Objek Pajak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>NOP (18 digit)</Label>
              <NopInput value={nopParts} onChange={setNopParts} />
            </div>
            <div className="space-y-1">
              <Label>Letak / Alamat OP</Label>
              <Input
                value={letakOp}
                onChange={(e) => setLetakOp(e.target.value)}
                placeholder="Alamat lokasi objek pajak"
                maxLength={200}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Pemohon */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Pemohon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Nama Pemohon</Label>
            <Input
              value={namaPemohon}
              onChange={(e) => setNamaPemohon(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-1">
            <Label>Alamat Pemohon</Label>
            <Textarea
              value={alamatPemohon}
              onChange={(e) => setAlamatPemohon(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist Dokumen */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Checklist Kelengkapan Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DOKUMEN_LIST.map((dok) => (
              <label
                key={dok.id}
                className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-accent transition-colors text-sm"
              >
                <input
                  type="checkbox"
                  checked={dokumenIds.includes(dok.id)}
                  onChange={() => toggleDokumen(dok.id)}
                  className="accent-primary"
                />
                {dok.nama}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Petugas & Catatan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Petugas &amp; Catatan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Nama Petugas Penerima</Label>
              <Input
                value={namaPetugasPenerima}
                onChange={(e) => setNamaPetugasPenerima(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-1">
              <Label>NIP Petugas</Label>
              <Input
                value={nipPetugasPenerima}
                onChange={(e) => setNipPetugasPenerima(e.target.value)}
                maxLength={40}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Catatan</Label>
            <Textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Catatan tambahan..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={!isComplete || createMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {createMutation.isPending ? 'Menyimpan...' : 'Simpan Berkas'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/pelayanan">Batal</Link>
        </Button>
      </div>
      {createMutation.isError && (
        <p className="text-sm text-destructive">{String(createMutation.error)}</p>
      )}
    </form>
  )
}
