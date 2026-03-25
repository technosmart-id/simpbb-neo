'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { formatNop } from '@/lib/utils/nop'
import { NopDisplay } from '@/components/nop/nop-display'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

function formatRupiah(value: string | number | null | undefined): string {
  const num = Number(value ?? 0)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

function todayDateString(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function PelayananVerifikasiPage() {
  const params = useParams<{ no: string }>()
  const router = useRouter()
  const orpc = useORPC()
  const qc = useQueryClient()

  const [keterangan, setKeterangan] = React.useState('')
  const [nipPemeriksa, setNipPemeriksa] = React.useState('')
  const [tglPemeriksaan, setTglPemeriksaan] = React.useState(todayDateString())
  const [rekomendasi, setRekomendasi] = React.useState<'setuju' | 'ditunda'>('setuju')

  const berkasQuery = useQuery(
    orpc.pelayanan.getByNo.queryOptions({ input: { noPelayanan: params.no } }),
  )

  const data = berkasQuery.data

  const nopParts = React.useMemo(() => {
    if (!data?.kdPropinsi) return null
    return {
      kdPropinsi: data.kdPropinsi,
      kdDati2: data.kdDati2 ?? '',
      kdKecamatan: data.kdKecamatan ?? '',
      kdKelurahan: data.kdKelurahan ?? '',
      kdBlok: data.kdBlok ?? '',
      noUrut: data.noUrut ?? '',
      kdJnsOp: data.kdJnsOp ?? '4',
    }
  }, [data])

  const spptListQuery = useQuery({
    ...orpc.sppt.listByNop.queryOptions({ input: nopParts! }),
    enabled: !!nopParts,
  })

  const latestSppt = spptListQuery.data?.[0] ?? null

  const updateStatusMutation = useMutation(
    orpc.pelayanan.updateStatus.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['pelayanan'] })
        router.push(`/pelayanan/${params.no}`)
      },
    }),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newStatus = rekomendasi === 'setuju' ? 3 : 6
    updateStatusMutation.mutate({
      noPelayanan: params.no,
      newStatus,
      nipPetugas: nipPemeriksa || undefined,
      catatan: keterangan || undefined,
    })
  }

  const isLoading = berkasQuery.isLoading

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href={`/pelayanan/${params.no}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Penelitian Kantor</h1>
          <p className="text-muted-foreground text-sm font-mono">
            {params.no}
            {nopParts && <span className="ml-2">— NOP {formatNop(nopParts)}</span>}
          </p>
        </div>
      </div>

      {/* Info Berkas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informasi Berkas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : !data ? (
            <p className="text-sm text-destructive">Berkas tidak ditemukan: {params.no}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">No Pelayanan:</span>{' '}
                <span className="font-mono font-medium">{data.noPelayanan}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Jenis Pelayanan:</span>{' '}
                <span className="font-medium">{data.kdJnsPelayanan}</span>
              </div>
              {nopParts && (
                <div className="col-span-2 sm:col-span-2">
                  <span className="text-muted-foreground">NOP: </span>
                  <NopDisplay parts={nopParts} />
                </div>
              )}
              {data.namaPemohon && (
                <div>
                  <span className="text-muted-foreground">Nama Pemohon:</span>{' '}
                  <span className="font-medium">{data.namaPemohon}</span>
                </div>
              )}
              {data.letakOp && (
                <div className="col-span-2 sm:col-span-2">
                  <span className="text-muted-foreground">Letak OP:</span> {data.letakOp}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SPPT Saat Ini */}
      {nopParts && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data SPPT Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            {spptListQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : !latestSppt ? (
              <p className="text-sm text-muted-foreground">Belum ada data SPPT untuk NOP ini.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Tahun Pajak:</span>{' '}
                  <span className="font-medium">{latestSppt.thnPajakSppt}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">NJOP:</span>{' '}
                  <span className="font-medium">{formatRupiah(latestSppt.njopSppt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">PBB Terutang:</span>{' '}
                  <span className="font-medium">{formatRupiah(latestSppt.pbbTerhutangSppt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status Bayar:</span>{' '}
                  <span className="font-medium">
                    {latestSppt.statusPembayaranSppt === '1' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status Cetak:</span>{' '}
                  <span className="font-medium">
                    {latestSppt.statusCetakSppt === '1' ? 'Sudah Dicetak' : 'Belum Dicetak'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Penelitian Kantor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Hasil Penelitian Kantor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="keterangan">Keterangan Hasil Penelitian</Label>
            <Textarea
              id="keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={4}
              placeholder="Uraikan hasil penelitian kantor berdasarkan berkas yang diterima..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="nipPemeriksa">NIP Pemeriksa</Label>
              <Input
                id="nipPemeriksa"
                value={nipPemeriksa}
                onChange={(e) => setNipPemeriksa(e.target.value)}
                placeholder="Opsional"
                className="font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="tglPemeriksaan">Tanggal Pemeriksaan</Label>
              <Input
                id="tglPemeriksaan"
                type="date"
                value={tglPemeriksaan}
                onChange={(e) => setTglPemeriksaan(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="rekomendasi">Rekomendasi</Label>
            <Select
              value={rekomendasi}
              onValueChange={(v) => setRekomendasi(v as 'setuju' | 'ditunda')}
            >
              <SelectTrigger id="rekomendasi">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="setuju">Setuju — Lanjutkan ke Penetapan (Status 3)</SelectItem>
                <SelectItem value="ditunda">Ditunda — Kembalikan untuk Perbaikan (Status 6)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {updateStatusMutation.error && (
        <p className="text-sm text-destructive">{String(updateStatusMutation.error)}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={updateStatusMutation.isPending || isLoading || !data}
        >
          <Save className="w-4 h-4 mr-2" />
          {updateStatusMutation.isPending ? 'Menyimpan...' : 'Simpan Penelitian'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/pelayanan/${params.no}`}>Batal</Link>
        </Button>
      </div>
    </form>
  )
}
