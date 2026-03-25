'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { parseNop, formatNop } from '@/lib/utils/nop'
import { NopDisplay } from '@/components/nop/nop-display'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Building2, Edit, Save, X, Plus } from 'lucide-react'
import Link from 'next/link'
import { CurrencyInput } from '@/components/forms/currency-input'
import { formatRupiah } from '@/components/data-table/column-helpers'

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

export default function SpopDetailPage() {
  const params = useParams<{ nop: string }>()
  const router = useRouter()
  const orpc = useORPC()
  const qc = useQueryClient()

  const nopParts = React.useMemo(() => parseNop(params.nop), [params.nop])
  const [editing, setEditing] = React.useState(false)

  // Form state for editing
  const [jalanOp, setJalanOp] = React.useState('')
  const [blokKavNoOp, setBlokKavNoOp] = React.useState('')
  const [rtOp, setRtOp] = React.useState('')
  const [rwOp, setRwOp] = React.useState('')
  const [kelurahanOp, setKelurahanOp] = React.useState('')
  const [kdStatusWp, setKdStatusWp] = React.useState('1')
  const [luasBumi, setLuasBumi] = React.useState(0)
  const [jnsBumi, setJnsBumi] = React.useState('2')
  const [kdZnt, setKdZnt] = React.useState('')
  const [nilaiSistemBumi, setNilaiSistemBumi] = React.useState(0)

  const spopQuery = useQuery({
    ...orpc.objekPajak.getByNop.queryOptions({ input: nopParts! }),
    enabled: !!nopParts,
  })

  const wpQuery = useQuery({
    ...orpc.objekPajak.getSubjekPajak.queryOptions({
      input: { subjekPajakId: spopQuery.data?.subjekPajakId ?? '' },
    }),
    enabled: !!spopQuery.data?.subjekPajakId,
  })

  const buildingsQuery = useQuery({
    ...orpc.lspop.listByNop.queryOptions({ input: nopParts! }),
    enabled: !!nopParts,
  })

  // Populate form when data loads
  React.useEffect(() => {
    const d = spopQuery.data
    if (!d) return
    setJalanOp(d.jalanOp ?? '')
    setBlokKavNoOp(d.blokKavNoOp ?? '')
    setRtOp(d.rtOp ?? '')
    setRwOp(d.rwOp ?? '')
    setKelurahanOp(d.kelurahanOp ?? '')
    setKdStatusWp(d.kdStatusWp ?? '1')
    setLuasBumi(d.luasBumi ?? 0)
    setJnsBumi(d.jnsBumi ?? '2')
    setKdZnt(d.kdZnt ?? '')
    setNilaiSistemBumi(d.nilaiSistemBumi ?? 0)
  }, [spopQuery.data])

  const updateMutation = useMutation(
    orpc.objekPajak.update.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['objekPajak'] })
        setEditing(false)
      },
    }),
  )

  function handleSave() {
    if (!nopParts) return
    updateMutation.mutate({
      ...nopParts,
      jalanOp,
      blokKavNoOp: blokKavNoOp || undefined,
      rtOp: rtOp || undefined,
      rwOp: rwOp || undefined,
      kelurahanOp: kelurahanOp || undefined,
      kdStatusWp,
      luasBumi,
      jnsBumi,
      kdZnt: kdZnt || undefined,
      nilaiSistemBumi,
    })
  }

  if (!nopParts) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/spop"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-destructive">NOP tidak valid</h1>
        </div>
        <p className="text-muted-foreground">Format NOP dalam URL tidak dikenali. Kembali ke daftar SPOP.</p>
      </div>
    )
  }

  const spop = spopQuery.data
  const isLoading = spopQuery.isLoading

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/spop"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Detail SPOP</h1>
          <NopDisplay parts={nopParts} />
        </div>
        <div className="ml-auto flex gap-2">
          {editing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                <X className="w-4 h-4 mr-2" />Batal
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />Edit
            </Button>
          )}
        </div>
      </div>

      {updateMutation.isError && (
        <p className="text-sm text-destructive">{String(updateMutation.error)}</p>
      )}

      {/* Subjek Pajak */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Wajib Pajak</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          ) : wpQuery.data ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>{' '}
                <span className="font-mono">{spop?.subjekPajakId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Nama:</span>{' '}
                <span className="font-medium">{wpQuery.data.nmWp}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Alamat WP:</span>{' '}
                {wpQuery.data.jalanWp}
                {wpQuery.data.kotaWp ? `, ${wpQuery.data.kotaWp}` : ''}
              </div>
              {wpQuery.data.telpWp && (
                <div>
                  <span className="text-muted-foreground">Telepon:</span> {wpQuery.data.telpWp}
                </div>
              )}
              {wpQuery.data.npwp && (
                <div>
                  <span className="text-muted-foreground">NPWP:</span>{' '}
                  <span className="font-mono">{wpQuery.data.npwp}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Data WP tidak ditemukan ({spop?.subjekPajakId})</p>
          )}
        </CardContent>
      </Card>

      {/* Lokasi OP */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lokasi Objek Pajak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : editing ? (
            <>
              <div className="space-y-1">
                <Label>Jalan / Alamat OP *</Label>
                <Input value={jalanOp} onChange={(e) => setJalanOp(e.target.value)} maxLength={100} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label>Blok/Kav/No</Label>
                  <Input value={blokKavNoOp} onChange={(e) => setBlokKavNoOp(e.target.value)} maxLength={15} />
                </div>
                <div className="space-y-1">
                  <Label>RT</Label>
                  <Input value={rtOp} onChange={(e) => setRtOp(e.target.value.slice(0, 3))} maxLength={3} />
                </div>
                <div className="space-y-1">
                  <Label>RW</Label>
                  <Input value={rwOp} onChange={(e) => setRwOp(e.target.value.slice(0, 2))} maxLength={2} />
                </div>
                <div className="space-y-1">
                  <Label>Kelurahan OP</Label>
                  <Input value={kelurahanOp} onChange={(e) => setKelurahanOp(e.target.value)} maxLength={30} />
                </div>
              </div>
              <div className="space-y-1 max-w-xs">
                <Label>Status WP</Label>
                <Select value={kdStatusWp} onValueChange={setKdStatusWp}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_WP.map((s) => (
                      <SelectItem key={s.kode} value={s.kode}>{s.kode} – {s.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div className="col-span-2">
                <span className="text-muted-foreground">Alamat:</span>{' '}
                {spop?.jalanOp}
                {spop?.blokKavNoOp ? ` No. ${spop.blokKavNoOp}` : ''}
                {(spop?.rtOp || spop?.rwOp) ? ` RT ${spop?.rtOp ?? '-'}/RW ${spop?.rwOp ?? '-'}` : ''}
                {spop?.kelurahanOp ? `, ${spop.kelurahanOp}` : ''}
              </div>
              <div>
                <span className="text-muted-foreground">Status WP:</span>{' '}
                {STATUS_WP.find((s) => s.kode === spop?.kdStatusWp)?.nama ?? spop?.kdStatusWp}
              </div>
              <div>
                <span className="text-muted-foreground">Jenis OP:</span>{' '}
                {spop?.kdJnsOp === '0' ? 'Bumi (Tanah)' : 'Bangunan & Tanah'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Bumi */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Bumi / Tanah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-4 w-48" />)}
            </div>
          ) : editing ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label>Luas Bumi (m²)</Label>
                <Input
                  type="number"
                  value={luasBumi || ''}
                  onChange={(e) => setLuasBumi(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label>Jenis Bumi</Label>
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
                <Label>NJOP Bumi (Rp)</Label>
                <CurrencyInput value={nilaiSistemBumi} onChange={setNilaiSistemBumi} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Luas:</span>{' '}
                <span className="font-medium">
                  {Number(spop?.luasBumi ?? 0).toLocaleString('id-ID')} m²
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Jenis:</span>{' '}
                {JNS_BUMI.find((j) => j.kode === spop?.jnsBumi)?.nama ?? spop?.jnsBumi}
              </div>
              <div>
                <span className="text-muted-foreground">ZNT:</span>{' '}
                <span className="font-mono">{spop?.kdZnt ?? '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">NJOP Bumi:</span>{' '}
                <span className="font-medium">{formatRupiah(spop?.nilaiSistemBumi ?? 0)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bangunan (LSPOP) */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base">Bangunan (LSPOP)</CardTitle>
          <Button size="sm" asChild>
            <Link href={`/lspop/${params.nop}/baru`}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Bangunan
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {buildingsQuery.isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
            </div>
          ) : (buildingsQuery.data?.length ?? 0) === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Building2 size={36} className="mx-auto mb-2 opacity-10" />
              <p className="text-sm">Belum ada data bangunan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {buildingsQuery.data?.map((bng) => (
                <Link
                  key={bng.noBng}
                  href={`/lspop/${params.nop}/${bng.noBng}`}
                  className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-accent transition-colors text-sm"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="font-mono">Bng #{bng.noBng}</Badge>
                    <div>
                      <span className="font-medium">
                        {Number(bng.luasBng).toLocaleString('id-ID')} m²
                      </span>
                      {bng.kdJpb && (
                        <span className="text-muted-foreground ml-2">JPB {bng.kdJpb}</span>
                      )}
                    </div>
                    {bng.thnDibangunBng && (
                      <span className="text-muted-foreground">Dibangun {bng.thnDibangunBng}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatRupiah(bng.nilaiSistemBng)}</div>
                    {bng.aktif === 0 && (
                      <Badge variant="destructive" className="text-xs">Dihapus</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
