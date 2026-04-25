'use client'

import * as React from 'react'
import { Save, RotateCcw, Wand2 } from 'lucide-react'
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
import { withMask } from 'use-mask-input'
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

interface SpopFormProps {
  mockData: any
}

export function SpopForm({ mockData }: SpopFormProps) {
  const [mounted, setMounted] = React.useState(false)
  const [nopBersama, setNopBersama] = React.useState('')
  const [noFormulir, setNoFormulir] = React.useState('')

  React.useEffect(() => {
    setMounted(true)
    handleAutoNoFormulir()
  }, [])

  const handleAutoNoFormulir = async () => {
    try {
      const res = await orpcClient.objekPajak.getNextNoFormulir({})
      setNoFormulir(res.nextNoFormulir)
    } catch (err) {
      console.error("Failed to generate No. Formulir:", err)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-10">
        {/* 2.1 Informasi Umum */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-base font-bold text-foreground uppercase">Informasi Umum</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Jenis Transaksi:</span>
              <Badge variant="secondary" className="text-[10px] font-bold uppercase rounded-sm px-2">1. PEREKAMAN DATA</Badge>
            </div>
          </div>

          {/* Content: Identification, Metadata & Location */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left: NOPs */}
              <div className="space-y-4">
                <FieldGroup className="flex flex-col gap-2.5">
                  <Field className="gap-0.5">
                    <FieldLabel className="text-xs">NOP (Nomor Objek Pajak)</FieldLabel>
                    <FieldContent>
                      <NopInput value={mockData.nop} lockRegion />
                    </FieldContent>
                  </Field>
                  <Field className="gap-0.5">
                    <FieldLabel className="text-xs">NOP Asal</FieldLabel>
                    <FieldContent>
                      <NopInput />
                    </FieldContent>
                  </Field>
                  <Field className="gap-0.5">
                    <FieldLabel className="text-xs">NOP Bersama</FieldLabel>
                    <FieldContent>
                      <NopInput value={nopBersama} onChange={setNopBersama} />
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
                        value={noFormulir}
                        onChange={(e) => setNoFormulir(e.target.value)}
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
                  <Field className="gap-0.5">
                    <FieldLabel className="text-xs">Peruntukan</FieldLabel>
                    <FieldContent>
                      <Select defaultValue="permukiman">
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permukiman">Permukiman</SelectItem>
                          <SelectItem value="perdagangan">Perdagangan/Jasa</SelectItem>
                          <SelectItem value="industri">Industri</SelectItem>
                          <SelectItem value="pertanian">Pertanian</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>
                  <Field className="gap-0.5">
                    <FieldLabel className="text-xs">No. Persil</FieldLabel>
                    <FieldContent>
                      <Input placeholder="5 digit" maxLength={5} className="font-mono" />
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              <Field className="md:col-span-6 gap-0.5">
                <FieldLabel className="text-xs">Jalan</FieldLabel>
                <FieldContent>
                  <Input defaultValue={mockData.alamatOp} className="uppercase" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-1 gap-0.5">
                <FieldLabel className="text-xs">RW</FieldLabel>
                <FieldContent>
                  <Input maxLength={2} className="font-mono text-center" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-1 gap-0.5">
                <FieldLabel className="text-xs">RT</FieldLabel>
                <FieldContent>
                  <Input maxLength={3} className="font-mono text-center" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Blok/Kav/No</FieldLabel>
                <FieldContent>
                  <Input className="uppercase" />
                </FieldContent>
              </Field>

              <Field className="md:col-span-12 gap-0.5">
                <FieldLabel className="text-xs">Kelurahan/Desa</FieldLabel>
                <FieldContent>
                  <Input defaultValue={mockData.kelurahan} className="uppercase" />
                </FieldContent>
              </Field>

              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Luas Bumi</FieldLabel>
                <FieldContent>
                  <Input type="number" defaultValue={mockData.luasBumi} className="font-mono" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Kode ZNT</FieldLabel>
                <FieldContent>
                  <Input maxLength={2} className="font-mono uppercase" placeholder="AA" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Jenis Bumi</FieldLabel>
                <FieldContent>
                  <Select defaultValue="1">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tanah + Bangunan</SelectItem>
                      <SelectItem value="2">Kavling Siap Bangun</SelectItem>
                      <SelectItem value="3">Tanah Kosong</SelectItem>
                      <SelectItem value="4">Fasilitas Umum</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Nilai Sistem Bumi</FieldLabel>
                <FieldContent>
                  <Input type="number" placeholder="0" className="font-mono" />
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">Kelas Bumi</FieldLabel>
                <FieldContent className="flex items-center h-10 px-3 bg-muted/30 rounded-md border border-input text-sm font-semibold">
                  A12
                </FieldContent>
              </Field>
              <Field className="md:col-span-4 gap-0.5">
                <FieldLabel className="text-xs">NJOP Bumi</FieldLabel>
                <FieldContent className="flex items-center h-10 px-3 bg-primary/5 text-primary rounded-md border border-primary/20 text-sm font-bold">
                  {formatRupiah(mockData.njopBumi)}
                </FieldContent>
              </Field>

              {nopBersama && (
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-4 border-t border-dashed mt-2">
                  <Field className="gap-0.5">
                    <FieldLabel className="text-xs">Luas Bumi Beban</FieldLabel>
                    <FieldContent>
                      <Input type="number" placeholder="0" className="font-mono" />
                    </FieldContent>
                  </Field>
                  <Field className="gap-0.5">
                    <FieldLabel className="text-xs">Luas Bangunan Beban</FieldLabel>
                    <FieldContent>
                      <Input type="number" placeholder="0" className="font-mono" />
                    </FieldContent>
                  </Field>
                  <Field className="gap-0.5">
                    <FieldLabel className="text-xs">NJOP Bumi Beban</FieldLabel>
                    <FieldContent>
                      <Input type="number" placeholder="0" className="font-mono" />
                    </FieldContent>
                  </Field>
                  <Field className="gap-0.5">
                    <FieldLabel className="text-xs">NJOP Bangunan Beban</FieldLabel>
                    <FieldContent>
                      <Input type="number" placeholder="0" className="font-mono" />
                    </FieldContent>
                  </Field>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2.2 Subjek Pajak */}
        <div className="space-y-6">
          <h3 className="text-base font-bold border-b pb-2 uppercase">
            Subjek Pajak
          </h3>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* Row 1 */}
            <Field className="md:col-span-6 gap-0.5">
              <FieldLabel className="text-xs">No. KTP</FieldLabel>
              <FieldContent>
                <Input maxLength={16} className="font-mono" />
              </FieldContent>
            </Field>
            <Field className="md:col-span-6 gap-0.5">
              <FieldLabel className="text-xs">Status</FieldLabel>
              <FieldContent>
                <Select defaultValue="1">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Pemilik</SelectItem>
                    <SelectItem value="2">Penyewa</SelectItem>
                    <SelectItem value="3">Pengelola</SelectItem>
                    <SelectItem value="4">Pemakai</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            {/* Row 2 */}
            <Field className="md:col-span-6 gap-0.5">
              <FieldLabel className="text-xs">Nama</FieldLabel>
              <FieldContent>
                <Input defaultValue={mockData.namaWp} className="uppercase" />
              </FieldContent>
            </Field>
            <Field className="md:col-span-6 gap-0.5">
              <FieldLabel className="text-xs">Pekerjaan</FieldLabel>
              <FieldContent>
                <Select defaultValue="1">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">PNS</SelectItem>
                    <SelectItem value="2">TNI/Polri</SelectItem>
                    <SelectItem value="3">Swasta</SelectItem>
                    <SelectItem value="4">Wiraswasta</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            {/* Row 3 */}
            <Field className="md:col-span-6 gap-0.5">
              <FieldLabel className="text-xs">Jalan</FieldLabel>
              <FieldContent>
                <Input className="uppercase" />
              </FieldContent>
            </Field>
            <Field className="md:col-span-1 gap-0.5">
              <FieldLabel className="text-xs">RW</FieldLabel>
              <FieldContent>
                <Input maxLength={2} className="font-mono text-center" />
              </FieldContent>
            </Field>
            <Field className="md:col-span-1 gap-0.5">
              <FieldLabel className="text-xs">RT</FieldLabel>
              <FieldContent>
                <Input maxLength={3} className="font-mono text-center" />
              </FieldContent>
            </Field>
            <Field className="md:col-span-4 gap-0.5">
              <FieldLabel className="text-xs">Blok/Kav/No</FieldLabel>
              <FieldContent>
                <Input className="uppercase" />
              </FieldContent>
            </Field>

            {/* Row 4 */}
            <Field className="md:col-span-4 gap-0.5">
              <FieldLabel className="text-xs">Telepon</FieldLabel>
              <FieldContent>
                <Input type="tel" />
              </FieldContent>
            </Field>
            <Field className="md:col-span-4 gap-0.5">
              <FieldLabel className="text-xs">Kode Pos</FieldLabel>
              <FieldContent>
                <Input maxLength={5} className="font-mono" />
              </FieldContent>
            </Field>
            <Field className="md:col-span-4 gap-0.5">
              <FieldLabel className="text-xs">NPWP</FieldLabel>
              <FieldContent>
                <Input maxLength={15} className="font-mono" />
              </FieldContent>
            </Field>

            {/* Row 5 */}
            <Field className="md:col-span-4 gap-0.5">
              <FieldLabel className="text-xs">Kota/Kab</FieldLabel>
              <FieldContent>
                <Input defaultValue="DENPASAR" className="uppercase" />
              </FieldContent>
            </Field>
            <Field className="md:col-span-4 gap-0.5">
              <FieldLabel className="text-xs">Kelurahan/Desa</FieldLabel>
              <FieldContent>
                <Input className="uppercase" />
              </FieldContent>
            </Field>
            <Field className="md:col-span-4 gap-0.5">
              <FieldLabel className="text-xs">Email</FieldLabel>
              <FieldContent>
                <Input type="email" placeholder="example@domain.com" />
              </FieldContent>
            </Field>
          </FieldGroup>
        </div>

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
                  <Input type="date" />
                </FieldContent>
              </Field>
              <Field className="gap-0.5">
                <FieldLabel className="text-xs">Nama Pendata</FieldLabel>
                <FieldContent>
                  <Input className="uppercase" />
                </FieldContent>
              </Field>
              <Field className="gap-0.5">
                <FieldLabel className="text-xs">NIP Pendata</FieldLabel>
                <FieldContent>
                  <Input className="font-mono" />
                </FieldContent>
              </Field>
            </FieldGroup>

            {/* Pejabat Berwenang */}
            <FieldGroup className="gap-2.5">
              <Field className="gap-0.5">
                <FieldLabel className="text-xs">Tanggal Pemeriksaan</FieldLabel>
                <FieldContent>
                  <Input type="date" />
                </FieldContent>
              </Field>
              <Field className="gap-0.5">
                <FieldLabel className="text-xs">Nama Pemeriksa</FieldLabel>
                <FieldContent>
                  <Input className="uppercase" />
                </FieldContent>
              </Field>
              <Field className="gap-0.5">
                <FieldLabel className="text-xs">NIP Pemeriksa</FieldLabel>
                <FieldContent>
                  <Input className="font-mono" />
                </FieldContent>
              </Field>
            </FieldGroup>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" className="px-6 font-bold">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Form
          </Button>
          <Button className="px-10 font-bold flex items-center gap-2 shadow-lg">
            <Save className="h-4 w-4" />
            Simpan SPOP
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
