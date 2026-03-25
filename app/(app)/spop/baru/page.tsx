'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { WilayahCascade, type WilayahValue } from '@/components/wilayah/wilayah-cascade'
import { CurrencyInput } from '@/components/forms/currency-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw, Save, Search, UserPlus } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatNop } from '@/lib/utils/nop'

// ── Status WP options (legacy codes) ────────────────────────────────────────
const STATUS_WP = [
  { kode: '1', nama: 'Pemilik' },
  { kode: '2', nama: 'Penyewa' },
  { kode: '3', nama: 'Pemakai' },
]

const JNS_BUMI = [
  { kode: '1', nama: 'Sawah' },
  { kode: '2', nama: 'Kering' },
  { kode: '3', nama: 'Perkebunan' },
  { kode: '4', nama: 'Hutan' },
  { kode: '5', nama: 'Perairan/Empang' },
  { kode: '6', nama: 'Tambak' },
  { kode: '7', nama: 'Penggembalaan' },
]

const JNS_TRANSAKSI = [
  { kode: '0', nama: 'Data Baru' },
  { kode: '1', nama: 'Perubahan Luas Bumi' },
  { kode: '2', nama: 'Perubahan Subjek Pajak' },
  { kode: '3', nama: 'Perubahan Nilai Bumi' },
  { kode: '4', nama: 'Hapus' },
]

const KD_JNS_OP = [
  { kode: '0', nama: 'Bumi (Tanah saja)' },
  { kode: '4', nama: 'Bangunan & Tanah' },
]

const STATUS_PEKERJAAN = [
  { kode: '0', nama: 'PNS/ABRI/POLRI' },
  { kode: '1', nama: 'Pegawai Swasta' },
  { kode: '2', nama: 'Wiraswasta/Pengusaha' },
  { kode: '3', nama: 'Petani' },
  { kode: '4', nama: 'Pensiunan' },
  { kode: '5', nama: 'Lainnya' },
]

// ── SubjekPajak picker dialog ─────────────────────────────────────────────────
function SubjekPajakPicker({
  onSelect,
}: {
  onSelect: (sp: { subjekPajakId: string; nmWp: string }) => void
}) {
  const orpc = useORPC()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const query = useQuery(
    orpc.objekPajak.listSubjekPajak.queryOptions({
      input: { search: search || undefined, limit: 20 },
    }),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Search className="w-4 h-4 mr-2" />
          Cari / Pilih WP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pilih Wajib Pajak</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Cari nama atau ID WP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-72 overflow-y-auto space-y-1">
            {query.isLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">Memuat...</p>
            )}
            {query.data?.map((sp) => (
              <button
                key={sp.subjekPajakId}
                type="button"
                className="w-full text-left px-3 py-2 rounded hover:bg-accent text-sm"
                onClick={() => {
                  onSelect(sp)
                  setOpen(false)
                }}
              >
                <div className="font-medium">{sp.nmWp}</div>
                <div className="text-muted-foreground text-xs">{sp.subjekPajakId} · {sp.jalanWp}</div>
              </button>
            ))}
            {query.data?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tidak ada hasil. Buat WP baru di bawah.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── New SubjekPajak mini-form ─────────────────────────────────────────────────
function NewSubjekPajakForm({
  onCreated,
}: {
  onCreated: (sp: { subjekPajakId: string; nmWp: string }) => void
}) {
  const orpc = useORPC()
  const qc = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    subjekPajakId: '',
    nmWp: '',
    jalanWp: '',
    kotaWp: '',
    telpWp: '',
    npwp: '',
    statusPekerjaanWp: '5',
  })

  const mutation = useMutation(
    orpc.objekPajak.createSubjekPajak.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['objekPajak', 'listSubjekPajak'] })
        onCreated({ subjekPajakId: form.subjekPajakId, nmWp: form.nmWp })
        setOpen(false)
        setForm({ subjekPajakId: '', nmWp: '', jalanWp: '', kotaWp: '', telpWp: '', npwp: '', statusPekerjaanWp: '5' })
      },
    }),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Buat WP Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Wajib Pajak Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>ID Subjek Pajak *</Label>
              <Input
                value={form.subjekPajakId}
                onChange={(e) => setForm((f) => ({ ...f, subjekPajakId: e.target.value }))}
                placeholder="NIK/ID unik"
                maxLength={30}
              />
            </div>
            <div className="space-y-1">
              <Label>Nama WP *</Label>
              <Input
                value={form.nmWp}
                onChange={(e) => setForm((f) => ({ ...f, nmWp: e.target.value }))}
                maxLength={30}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Alamat WP *</Label>
            <Input
              value={form.jalanWp}
              onChange={(e) => setForm((f) => ({ ...f, jalanWp: e.target.value }))}
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Kota</Label>
              <Input
                value={form.kotaWp}
                onChange={(e) => setForm((f) => ({ ...f, kotaWp: e.target.value }))}
                maxLength={30}
              />
            </div>
            <div className="space-y-1">
              <Label>Telepon</Label>
              <Input
                value={form.telpWp}
                onChange={(e) => setForm((f) => ({ ...f, telpWp: e.target.value }))}
                maxLength={20}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>NPWP</Label>
              <Input
                value={form.npwp}
                onChange={(e) => setForm((f) => ({ ...f, npwp: e.target.value }))}
                maxLength={16}
              />
            </div>
            <div className="space-y-1">
              <Label>Pekerjaan *</Label>
              <Select
                value={form.statusPekerjaanWp}
                onValueChange={(v) => setForm((f) => ({ ...f, statusPekerjaanWp: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_PEKERJAAN.map((p) => (
                    <SelectItem key={p.kode} value={p.kode}>{p.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={!form.subjekPajakId || !form.nmWp || !form.jalanWp || mutation.isPending}
            onClick={() => mutation.mutate(form)}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan WP'}
          </Button>
          {mutation.isError && (
            <p className="text-sm text-destructive">{String(mutation.error)}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function SpopBaruPage() {
  const router = useRouter()
  const orpc = useORPC()
  const qc = useQueryClient()

  // Section A: NOP
  const [wilayah, setWilayah] = React.useState<Partial<WilayahValue>>({})
  const [kdBlok, setKdBlok] = React.useState('')
  const [kdJnsOp, setKdJnsOp] = React.useState('4')
  const [noUrut, setNoUrut] = React.useState('')

  // Section B: Subjek Pajak
  const [selectedWp, setSelectedWp] = React.useState<{ subjekPajakId: string; nmWp: string } | null>(null)

  // Section C: Info Dasar
  const [jnsTransaksiOp, setJnsTransaksiOp] = React.useState('0')
  const [noFormulirSpop, setNoFormulirSpop] = React.useState('')

  // Section D: Alamat OP
  const [jalanOp, setJalanOp] = React.useState('')
  const [blokKavNoOp, setBlokKavNoOp] = React.useState('')
  const [rtOp, setRtOp] = React.useState('')
  const [rwOp, setRwOp] = React.useState('')
  const [kelurahanOp, setKelurahanOp] = React.useState('')
  const [kdStatusWp, setKdStatusWp] = React.useState('1')

  // Section E: Data Bumi
  const [luasBumi, setLuasBumi] = React.useState(0)
  const [jnsBumi, setJnsBumi] = React.useState('2')
  const [kdZnt, setKdZnt] = React.useState('')
  const [nilaiSistemBumi, setNilaiSistemBumi] = React.useState(0)

  // Auto-generate noUrut when blok is complete
  const canFetchUrut =
    wilayah.kdPropinsi && wilayah.kdDati2 && wilayah.kdKecamatan && wilayah.kdKelurahan && kdBlok.length === 3

  const nextUrutQuery = useQuery({
    ...orpc.objekPajak.nextNoUrut.queryOptions({
      input: {
        kdPropinsi: wilayah.kdPropinsi ?? '',
        kdDati2: wilayah.kdDati2 ?? '',
        kdKecamatan: wilayah.kdKecamatan ?? '',
        kdKelurahan: wilayah.kdKelurahan ?? '',
        kdBlok,
      },
    }),
    enabled: !!canFetchUrut,
  })

  React.useEffect(() => {
    if (nextUrutQuery.data?.nextNoUrut) {
      setNoUrut(nextUrutQuery.data.nextNoUrut)
    }
  }, [nextUrutQuery.data])

  const createMutation = useMutation(
    orpc.objekPajak.create.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['objekPajak', 'list'] })
        if (wilayah.kdPropinsi && wilayah.kdDati2 && wilayah.kdKecamatan && wilayah.kdKelurahan) {
          const nop = formatNop({
            kdPropinsi: wilayah.kdPropinsi,
            kdDati2: wilayah.kdDati2,
            kdKecamatan: wilayah.kdKecamatan,
            kdKelurahan: wilayah.kdKelurahan,
            kdBlok,
            noUrut,
            kdJnsOp,
          }).replace(/\./g, '')
          router.push(`/spop/${nop}`)
        } else {
          router.push('/spop')
        }
      },
    }),
  )

  const isComplete =
    wilayah.kdPropinsi &&
    wilayah.kdDati2 &&
    wilayah.kdKecamatan &&
    wilayah.kdKelurahan &&
    kdBlok.length === 3 &&
    noUrut.length === 4 &&
    kdJnsOp &&
    selectedWp &&
    jalanOp.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isComplete) return
    createMutation.mutate({
      kdPropinsi: wilayah.kdPropinsi!,
      kdDati2: wilayah.kdDati2!,
      kdKecamatan: wilayah.kdKecamatan!,
      kdKelurahan: wilayah.kdKelurahan!,
      kdBlok,
      noUrut,
      kdJnsOp,
      subjekPajakId: selectedWp!.subjekPajakId,
      noFormulirSpop: noFormulirSpop || undefined,
      jnsTransaksiOp,
      jalanOp,
      blokKavNoOp: blokKavNoOp || undefined,
      rtOp: rtOp || undefined,
      rwOp: rwOp || undefined,
      kelurahanOp: kelurahanOp || undefined,
      kdStatusWp,
      luasBumi,
      kdZnt: kdZnt || undefined,
      jnsBumi,
      nilaiSistemBumi,
    })
  }

  const previewNop =
    wilayah.kdPropinsi && wilayah.kdDati2 && wilayah.kdKecamatan && wilayah.kdKelurahan && kdBlok && noUrut
      ? formatNop({
          kdPropinsi: wilayah.kdPropinsi,
          kdDati2: wilayah.kdDati2,
          kdKecamatan: wilayah.kdKecamatan,
          kdKelurahan: wilayah.kdKelurahan,
          kdBlok: kdBlok.padEnd(3, '_'),
          noUrut: noUrut.padStart(4, '0'),
          kdJnsOp,
        })
      : null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href="/spop"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Tambah SPOP Baru</h1>
          <p className="text-muted-foreground text-sm">Surat Pemberitahuan Objek Pajak</p>
        </div>
        {previewNop && (
          <Badge variant="outline" className="ml-auto font-mono text-sm">
            {previewNop}
          </Badge>
        )}
      </div>

      {/* Section A: NOP */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">A. Nomor Objek Pajak (NOP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WilayahCascade value={wilayah} onChange={setWilayah} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label>Kode Blok (3 digit) *</Label>
              <Input
                value={kdBlok}
                onChange={(e) => setKdBlok(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="001"
                className="font-mono"
                maxLength={3}
              />
            </div>
            <div className="space-y-1">
              <Label>No Urut (4 digit)</Label>
              <div className="flex gap-1">
                <Input
                  value={noUrut}
                  onChange={(e) => setNoUrut(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0001"
                  className="font-mono"
                  maxLength={4}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!canFetchUrut || nextUrutQuery.isFetching}
                  onClick={() => nextUrutQuery.refetch()}
                  title="Generate otomatis"
                >
                  <RefreshCw className={`w-4 h-4 ${nextUrutQuery.isFetching ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Jenis OP *</Label>
              <Select value={kdJnsOp} onValueChange={setKdJnsOp}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KD_JNS_OP.map((j) => (
                    <SelectItem key={j.kode} value={j.kode}>{j.kode} – {j.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>No Formulir SPOP</Label>
              <Input
                value={noFormulirSpop}
                onChange={(e) => setNoFormulirSpop(e.target.value)}
                placeholder="Opsional"
                maxLength={50}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Subjek Pajak */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">B. Subjek Pajak / Wajib Pajak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <SubjekPajakPicker onSelect={setSelectedWp} />
            <NewSubjekPajakForm onCreated={setSelectedWp} />
          </div>
          {selectedWp ? (
            <div className="flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2">
              <div>
                <p className="font-medium text-sm">{selectedWp.nmWp}</p>
                <p className="text-xs text-muted-foreground">{selectedWp.subjekPajakId}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={() => setSelectedWp(null)}
              >
                Hapus
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada WP dipilih.</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Jenis Transaksi OP *</Label>
              <Select value={jnsTransaksiOp} onValueChange={setJnsTransaksiOp}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JNS_TRANSAKSI.map((j) => (
                    <SelectItem key={j.kode} value={j.kode}>{j.kode} – {j.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status WP *</Label>
              <Select value={kdStatusWp} onValueChange={setKdStatusWp}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_WP.map((s) => (
                    <SelectItem key={s.kode} value={s.kode}>{s.kode} – {s.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section C: Alamat OP */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">C. Lokasi Objek Pajak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Jalan / Alamat OP *</Label>
            <Input
              value={jalanOp}
              onChange={(e) => setJalanOp(e.target.value)}
              placeholder="Nama jalan / alamat lokasi"
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label>Blok/Kav/No</Label>
              <Input value={blokKavNoOp} onChange={(e) => setBlokKavNoOp(e.target.value)} maxLength={15} />
            </div>
            <div className="space-y-1">
              <Label>RT</Label>
              <Input
                value={rtOp}
                onChange={(e) => setRtOp(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="001"
                maxLength={3}
              />
            </div>
            <div className="space-y-1">
              <Label>RW</Label>
              <Input
                value={rwOp}
                onChange={(e) => setRwOp(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="01"
                maxLength={2}
              />
            </div>
            <div className="space-y-1">
              <Label>Kelurahan OP</Label>
              <Input value={kelurahanOp} onChange={(e) => setKelurahanOp(e.target.value)} maxLength={30} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section D: Data Bumi */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">D. Data Bumi / Tanah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label>Luas Bumi (m²) *</Label>
              <Input
                type="number"
                value={luasBumi || ''}
                onChange={(e) => setLuasBumi(Number(e.target.value))}
                min={0}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label>Jenis Bumi *</Label>
              <Select value={jnsBumi} onValueChange={setJnsBumi}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JNS_BUMI.map((j) => (
                    <SelectItem key={j.kode} value={j.kode}>{j.kode} – {j.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Kode ZNT</Label>
              <Input
                value={kdZnt}
                onChange={(e) => setKdZnt(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="AA"
                maxLength={2}
                className="font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label>NJOP Bumi (Rp) *</Label>
              <CurrencyInput value={nilaiSistemBumi} onChange={setNilaiSistemBumi} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={!isComplete || createMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {createMutation.isPending ? 'Menyimpan...' : 'Simpan SPOP'}
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
