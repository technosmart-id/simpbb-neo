'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Save, TrendingUp } from 'lucide-react'

const KATEGORI = ['A1', 'A2', 'A3', 'B'] as const

type Row = {
  id: number
  kategori: string
  kodeMaterial: string
  namaMaterial: string
  nilaiAwal: string
  nilaiBaru: string
  thnBerlaku: string
}

export default function DbkbPage() {
  const orpc = useORPC()
  const qc = useQueryClient()
  const currentYear = new Date().getFullYear().toString()
  const [year, setYear] = useState(currentYear)
  const [dirtyValues, setDirtyValues] = useState<Record<number, string>>({})
  const [pctIncrease, setPctIncrease] = useState('')

  const { data: rows = [] } = useQuery(
    orpc.dbkb.list.queryOptions({ input: { thnBerlaku: year } })
  )

  const saveMutation = useMutation({
    ...orpc.dbkb.updateNilaiBaru.mutationOptions(),
    onSuccess: () => {
      toast.success('Nilai baru berhasil disimpan')
      setDirtyValues({})
      qc.invalidateQueries({ queryKey: orpc.dbkb.list.queryOptions({ input: { thnBerlaku: year } }).queryKey })
    },
  })

  const massMutation = useMutation({
    ...orpc.dbkb.updateMasalBangunan.mutationOptions(),
    onSuccess: () => {
      toast.success('Update masal berhasil')
      setDirtyValues({})
      qc.invalidateQueries({ queryKey: orpc.dbkb.list.queryOptions({ input: { thnBerlaku: year } }).queryKey })
    },
  })

  function handleSaveAll() {
    const updates = Object.entries(dirtyValues).map(([id, nilaiBaru]) => ({
      id: Number(id),
      nilaiBaru,
    }))
    if (updates.length === 0) return toast.info('Tidak ada perubahan')
    saveMutation.mutate({ updates })
  }

  function getRowsByKategori(k: string): Row[] {
    return (rows as Row[]).filter((r) => r.kategori === k)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">DBKB — Daftar Biaya Komponen Bangunan</h1>
          <p className="text-sm text-muted-foreground">Referensi biaya komponen untuk kalkulasi NJOP bangunan</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            className="w-24"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Tahun"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Kenaikan %
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Update Masal Kenaikan</AlertDialogTitle>
                <AlertDialogDescription>
                  NILAI_BARU = NILAI_AWAL × (1 + n%). Berlaku untuk semua baris tahun {year}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                type="number"
                min={0}
                max={1000}
                value={pctIncrease}
                onChange={(e) => setPctIncrease(e.target.value)}
                placeholder="Persentase kenaikan (%)"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    massMutation.mutate({
                      pctIncrease: Number(pctIncrease),
                      thnBerlaku: year,
                    })
                  }
                >
                  Terapkan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSaveAll} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Semua
          </Button>
        </div>
      </div>

      <Tabs defaultValue="A1">
        <TabsList>
          {KATEGORI.map((k) => (
            <TabsTrigger key={k} value={k}>
              Kategori {k}
            </TabsTrigger>
          ))}
        </TabsList>
        {KATEGORI.map((k) => (
          <TabsContent key={k} value={k}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Kode</TableHead>
                  <TableHead>Nama Komponen</TableHead>
                  <TableHead className="w-40 text-right">Nilai Awal (Rp)</TableHead>
                  <TableHead className="w-48 text-right">Nilai Baru (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getRowsByKategori(k).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.kodeMaterial}</TableCell>
                    <TableCell>{row.namaMaterial}</TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(row.nilaiAwal).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="text-right font-mono"
                        value={dirtyValues[row.id] ?? row.nilaiBaru}
                        onChange={(e) =>
                          setDirtyValues((prev) => ({ ...prev, [row.id]: e.target.value }))
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
