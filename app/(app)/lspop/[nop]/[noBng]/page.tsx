'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { parseNop, NopParts } from '@/lib/utils/nop'
import { NopDisplay } from '@/components/nop/nop-display'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatRupiah } from '@/components/data-table/column-helpers'

// Reference data for dropdowns
const KD_JPB = [
  { kode: '01', nama: 'Perumahan' },
  { kode: '02', nama: 'Perdagangan' },
  { kode: '03', nama: 'Industri / Gudang' },
  { kode: '04', nama: 'Apartemen' },
  { kode: '05', nama: 'Hotel' },
  { kode: '06', nama: 'Parkir' },
  { kode: '07', nama: 'Hotel Berbintang' },
  { kode: '08', nama: 'Bangunan Khusus' },
  { kode: '09', nama: 'Kantor' },
  { kode: '10', nama: 'Toko/Ruko' },
  { kode: '11', nama: 'Sosial/Ibadah' },
  { kode: '12', nama: 'Pendidikan' },
  { kode: '13', nama: 'Olahraga' },
  { kode: '14', nama: 'Rumah Sakit' },
  { kode: '15', nama: 'Telekomunikasi' },
  { kode: '16', nama: 'Olahraga (stadion)' },
]

const KONDISI = [
  { kode: '1', nama: 'Baik' },
  { kode: '2', nama: 'Sedang' },
  { kode: '3', nama: 'Jelek' },
]

const JNS_KONSTRUKSI = [
  { kode: '1', nama: 'Permanen' },
  { kode: '2', nama: 'Semi Permanen' },
  { kode: '3', nama: 'Tidak Permanen' },
]

const JNS_ATAP = [
  { kode: '1', nama: 'Beton' },
  { kode: '2', nama: 'Genteng' },
  { kode: '3', nama: 'Asbes' },
  { kode: '4', nama: 'Seng/Zink' },
  { kode: '5', nama: 'Sirap' },
  { kode: '6', nama: 'Ijuk/Rumbia' },
]

const KD_DINDING = [
  { kode: '1', nama: 'Beton' },
  { kode: '2', nama: 'Bata Plester' },
  { kode: '3', nama: 'Bata Exposed' },
  { kode: '4', nama: 'Kayu' },
  { kode: '5', nama: 'Bambu' },
]

const KD_LANTAI = [
  { kode: '1', nama: 'Marmer/Granit' },
  { kode: '2', nama: 'Keramik' },
  { kode: '3', nama: 'Tegel/Teraso' },
  { kode: '4', nama: 'Kayu/Parket' },
  { kode: '5', nama: 'Semen/Bata' },
  { kode: '6', nama: 'Tanah' },
]

const KD_LANGIT = [
  { kode: '1', nama: 'Beton' },
  { kode: '2', nama: 'Gipsum/Akustik' },
  { kode: '3', nama: 'Triplek/Asbes' },
  { kode: '4', nama: 'Kayu' },
  { kode: '5', nama: 'Tanpa Langit-langit' },
]

type FormState = {
  kdJpb: string
  luasBng: number
  jmlLantaiBng: number
  thnDibangunBng: string
  thnRenovasiBng: string
  kondisiBng: string
  jnsKonstruksiBng: string
  jnsAtapBng: string
  kdDinding: string
  kdLantai: string
  kdLangitLangit: string
  nilaiSistemBng: number
}

const DEFAULT_FORM: FormState = {
  kdJpb: '01',
  luasBng: 0,
  jmlLantaiBng: 1,
  thnDibangunBng: '',
  thnRenovasiBng: '',
  kondisiBng: '1',
  jnsKonstruksiBng: '1',
  jnsAtapBng: '2',
  kdDinding: '2',
  kdLantai: '2',
  kdLangitLangit: '2',
  nilaiSistemBng: 0,
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { kode: string; nama: string }[]
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.kode} value={o.kode}>{o.kode} – {o.nama}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function FasilitasBangunanCard({
  nopParts,
  noBng,
}: {
  nopParts: NopParts
  noBng: number
}) {
  const orpc = useORPC()
  const qc = useQueryClient()

  const masterQuery = useQuery(
    orpc.klasifikasi.listFasilitas.queryOptions(),
  )

  const existingQuery = useQuery(
    orpc.lspop.listFasilitas.queryOptions({
      input: { ...nopParts, noBng },
    }),
  )

  const [quantities, setQuantities] = React.useState<Record<string, number>>({})
  const [initialized, setInitialized] = React.useState(false)

  React.useEffect(() => {
    if (!existingQuery.data || initialized) return
    const map: Record<string, number> = {}
    for (const item of existingQuery.data) {
      map[item.kdFasilitas] = item.jmlSatuan
    }
    setQuantities(map)
    setInitialized(true)
  }, [existingQuery.data, initialized])

  const setFasilitasMutation = useMutation(
    orpc.lspop.setFasilitas.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['lspop'] })
      },
    }),
  )

  function handleSimpanFasilitas() {
    const fasilitas = Object.entries(quantities)
      .filter(([, jml]) => jml > 0)
      .map(([kdFasilitas, jmlSatuan]) => ({ kdFasilitas, jmlSatuan }))
    setFasilitasMutation.mutate({ ...nopParts, noBng, fasilitas })
  }

  const isLoading = masterQuery.isLoading || existingQuery.isLoading
  const master = masterQuery.data ?? []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Fasilitas Bangunan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : master.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada data fasilitas master.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {master.map((fas) => (
                <div key={fas.kdFasilitas} className="flex items-center gap-3 rounded-md border px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground font-mono">{fas.kdFasilitas}</Label>
                    <div className="text-sm font-medium truncate">{fas.nmFasilitas}</div>
                    <div className="text-xs text-muted-foreground">{fas.satuanFasilitas}</div>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    className="w-20 text-right"
                    value={quantities[fas.kdFasilitas] ?? 0}
                    onChange={(e) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [fas.kdFasilitas]: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            {setFasilitasMutation.error && (
              <p className="text-sm text-destructive">{String(setFasilitasMutation.error)}</p>
            )}
            <Button
              type="button"
              size="sm"
              disabled={setFasilitasMutation.isPending}
              onClick={handleSimpanFasilitas}
            >
              <Save className="w-4 h-4 mr-2" />
              {setFasilitasMutation.isPending ? 'Menyimpan...' : 'Simpan Fasilitas'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function LspopBangunanPage() {
  const params = useParams<{ nop: string; noBng: string }>()
  const router = useRouter()
  const orpc = useORPC()
  const qc = useQueryClient()

  const nopParts = React.useMemo(() => parseNop(params.nop), [params.nop])
  const noBng = Number(params.noBng)
  const isNew = params.noBng === 'baru'

  const [form, setForm] = React.useState<FormState>(DEFAULT_FORM)
  const set = (field: keyof FormState) => (value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }))

  const buildingQuery = useQuery({
    ...orpc.lspop.getBuilding.queryOptions({
      input: { ...nopParts!, noBng },
    }),
    enabled: !!nopParts && !isNew,
  })

  const nextNoBngQuery = useQuery({
    ...orpc.lspop.nextNoBng.queryOptions({ input: nopParts! }),
    enabled: !!nopParts && isNew,
  })

  // Populate form when editing
  React.useEffect(() => {
    const d = buildingQuery.data
    if (!d) return
    setForm({
      kdJpb: d.kdJpb ?? '01',
      luasBng: d.luasBng ?? 0,
      jmlLantaiBng: d.jmlLantaiBng ?? 1,
      thnDibangunBng: d.thnDibangunBng ?? '',
      thnRenovasiBng: d.thnRenovasiBng ?? '',
      kondisiBng: d.kondisiBng ?? '1',
      jnsKonstruksiBng: d.jnsKonstruksiBng ?? '1',
      jnsAtapBng: d.jnsAtapBng ?? '2',
      kdDinding: d.kdDinding ?? '2',
      kdLantai: d.kdLantai ?? '2',
      kdLangitLangit: d.kdLangitLangit ?? '2',
      nilaiSistemBng: d.nilaiSistemBng ?? 0,
    })
  }, [buildingQuery.data])

  const createMutation = useMutation(
    orpc.lspop.create.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['lspop'] })
        router.push(`/spop/${params.nop}`)
      },
    }),
  )

  const updateMutation = useMutation(
    orpc.lspop.update.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['lspop'] })
      },
    }),
  )

  const softDeleteMutation = useMutation(
    orpc.lspop.softDelete.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['lspop'] })
        router.push(`/spop/${params.nop}`)
      },
    }),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nopParts) return
    if (isNew) {
      const nextNo = nextNoBngQuery.data?.nextNoBng ?? 1
      createMutation.mutate({ ...nopParts, noBng: nextNo, ...form })
    } else {
      updateMutation.mutate({ ...nopParts, noBng, ...form })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error ?? updateMutation.error

  if (!nopParts) {
    return <p className="text-destructive">NOP tidak valid: {params.nop}</p>
  }

  const building = buildingQuery.data
  const isLoading = !isNew && buildingQuery.isLoading

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href={`/spop/${params.nop}`}><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? 'Tambah Bangunan' : `Bangunan #${noBng}`}
          </h1>
          <NopDisplay parts={nopParts} />
        </div>
        {!isNew && building?.aktif === 0 && (
          <Badge variant="destructive" className="ml-auto">Dihapus</Badge>
        )}
        {!isNew && building?.aktif !== 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="ml-auto text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Bangunan #{noBng}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bangunan akan ditandai sebagai dihapus (soft delete). Data tidak akan benar-benar dihapus dari database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => softDeleteMutation.mutate({ ...nopParts, noBng })}
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {mutationError && (
        <p className="text-sm text-destructive">{String(mutationError)}</p>
      )}

      {/* Data Dasar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Dasar Bangunan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SelectField label="Jenis Penggunaan Bangunan (JPB)" value={form.kdJpb} onChange={set('kdJpb')} options={KD_JPB} />
                <div className="space-y-1">
                  <Label>Luas Bangunan (m²) *</Label>
                  <Input
                    type="number"
                    value={form.luasBng || ''}
                    onChange={(e) => set('luasBng')(Number(e.target.value))}
                    min={0}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Jumlah Lantai</Label>
                  <Input
                    type="number"
                    value={form.jmlLantaiBng}
                    onChange={(e) => set('jmlLantaiBng')(Number(e.target.value))}
                    min={1}
                    max={200}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label>Tahun Dibangun</Label>
                  <Input
                    value={form.thnDibangunBng}
                    onChange={(e) => set('thnDibangunBng')(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1990"
                    maxLength={4}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Tahun Renovasi</Label>
                  <Input
                    value={form.thnRenovasiBng}
                    onChange={(e) => set('thnRenovasiBng')(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Opsional"
                    maxLength={4}
                    className="font-mono"
                  />
                </div>
                <SelectField label="Kondisi" value={form.kondisiBng} onChange={set('kondisiBng')} options={KONDISI} />
                <SelectField label="Jenis Konstruksi" value={form.jnsKonstruksiBng} onChange={set('jnsKonstruksiBng')} options={JNS_KONSTRUKSI} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Komponen Material */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Komponen Material</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SelectField label="Atap" value={form.jnsAtapBng} onChange={set('jnsAtapBng')} options={JNS_ATAP} />
              <SelectField label="Dinding" value={form.kdDinding} onChange={set('kdDinding')} options={KD_DINDING} />
              <SelectField label="Lantai" value={form.kdLantai} onChange={set('kdLantai')} options={KD_LANTAI} />
              <SelectField label="Langit-langit" value={form.kdLangitLangit} onChange={set('kdLangitLangit')} options={KD_LANGIT} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nilai */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nilai Bangunan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-1">
                <Label>NJOP Bangunan (Rp)</Label>
                <CurrencyInput value={form.nilaiSistemBng} onChange={(v) => set('nilaiSistemBng')(v)} />
              </div>
              {!isNew && building && (
                <div className="text-sm text-muted-foreground pb-2">
                  Tersimpan: <span className="font-medium text-foreground">{formatRupiah(building.nilaiSistemBng)}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fasilitas Bangunan */}
      {!isNew && (
        <FasilitasBangunanCard nopParts={nopParts} noBng={noBng} />
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || isLoading || form.luasBng === 0}>
          <Save className="w-4 h-4 mr-2" />
          {isPending ? 'Menyimpan...' : isNew ? 'Simpan Bangunan' : 'Update Bangunan'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/spop/${params.nop}`}>Batal</Link>
        </Button>
      </div>
    </form>
  )
}
