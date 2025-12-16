"use client";

import {
  Building,
  CreditCard,
  FileText,
  History,
  LandPlot,
  MapPin,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data - in real app this would come from API based on NOP
const mockObjekPajak = {
  nop: "32.71.010.001.001.0001.0",
  namaWP: "PT ABADI JAYA",
  alamatWP: "Jl. Gatot Subroto No. 123, Jakarta Selatan",
  alamatOP: "Jl. Sudirman No. 456, Sukajadi, Cicendo, Bandung",
  kelurahan: "Sukajadi",
  kecamatan: "Cicendo",
  kabupaten: "Kota Bandung",
  provinsi: "Jawa Barat",
  statusPajak: "aktif",
  // Tanah
  tanah: {
    luasTanah: 500,
    kelasJalan: "I",
    njopTanah: 2_500_000,
    zonaWilayah: "A1",
  },
  // Bangunan (bisa multiple)
  bangunan: [
    {
      noBangunan: 1,
      jenisBangunan: "Rumah Tinggal",
      luasBangunan: 250,
      tahunDibangun: 2015,
      kondisi: "Baik",
      njopBangunan: 3_500_000,
    },
    {
      noBangunan: 2,
      jenisBangunan: "Gudang",
      luasBangunan: 100,
      tahunDibangun: 2018,
      kondisi: "Baik",
      njopBangunan: 2_000_000,
    },
  ],
  // SPPT History
  sppt: [
    {
      tahun: 2024,
      njop: 2_125_000_000,
      pbb: 4_250_000,
      status: "belum",
      jatuhTempo: "2024-09-30",
    },
    {
      tahun: 2023,
      njop: 2_000_000_000,
      pbb: 4_000_000,
      status: "lunas",
      tanggalBayar: "2023-08-15",
    },
    {
      tahun: 2022,
      njop: 1_850_000_000,
      pbb: 3_700_000,
      status: "lunas",
      tanggalBayar: "2022-07-20",
    },
  ],
  // Pembayaran History
  pembayaran: [
    {
      id: "PAY-2023-001",
      tahunPajak: 2023,
      jumlah: 4_000_000,
      tanggal: "2023-08-15",
      channel: "Bank BJB",
      status: "verified",
    },
    {
      id: "PAY-2022-001",
      tahunPajak: 2022,
      jumlah: 3_700_000,
      tanggal: "2022-07-20",
      channel: "Tokopedia",
      status: "verified",
    },
  ],
  // Riwayat Mutasi
  riwayat: [
    {
      id: "MT-2020-001",
      jenis: "Balik Nama",
      dari: "CV SENTOSA",
      ke: "PT ABADI JAYA",
      tanggal: "2020-03-15",
      status: "selesai",
    },
    {
      id: "MT-2015-001",
      jenis: "Pendataan Baru",
      dari: "-",
      ke: "CV SENTOSA",
      tanggal: "2015-01-10",
      status: "selesai",
    },
  ],
  // Quick stats
  totalTunggakan: 4_250_000,
  tahunTerakhirLunas: 2023,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function ObjekPajakDetailPage() {
  const params = useParams();
  const nop = params.nop as string;

  // In real app, fetch data based on NOP
  const data = mockObjekPajak;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* WP Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: Profile Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  className="font-mono"
                  variant={
                    data.statusPajak === "aktif" ? "default" : "secondary"
                  }
                >
                  {decodeURIComponent(nop)}
                </Badge>
                <Badge variant="outline">
                  {data.statusPajak === "aktif" ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>

              <div>
                <h2 className="font-semibold text-xl">{data.namaWP}</h2>
                <p className="text-muted-foreground text-sm">{data.alamatWP}</p>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p>{data.alamatOP}</p>
                  <p className="text-muted-foreground">
                    {data.kelurahan}, {data.kecamatan}, {data.kabupaten}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick Stats & Actions */}
            <div className="flex flex-col gap-4">
              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Tunggakan</p>
                  <p className="font-semibold text-destructive text-lg">
                    {formatCurrency(data.totalTunggakan)}
                  </p>
                </div>
                <Separator className="h-auto" orientation="vertical" />
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">
                    Terakhir Lunas
                  </p>
                  <p className="font-semibold text-lg">
                    {data.tahunTerakhirLunas}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  <Printer className="mr-2 size-4" />
                  Cetak SPPT
                </Button>
                <Button size="sm" variant="outline">
                  <CreditCard className="mr-2 size-4" />
                  Input Bayar
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="mr-2 size-4" />
                  Mutasi
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs className="flex-1" defaultValue="tanah">
        <TabsList>
          <TabsTrigger value="tanah">
            <LandPlot className="mr-2 size-4" />
            Tanah
          </TabsTrigger>
          <TabsTrigger value="bangunan">
            <Building className="mr-2 size-4" />
            Bangunan
          </TabsTrigger>
          <TabsTrigger value="sppt">
            <FileText className="mr-2 size-4" />
            SPPT
          </TabsTrigger>
          <TabsTrigger value="pembayaran">
            <CreditCard className="mr-2 size-4" />
            Pembayaran
          </TabsTrigger>
          <TabsTrigger value="riwayat">
            <History className="mr-2 size-4" />
            Riwayat
          </TabsTrigger>
        </TabsList>

        {/* Tab: Tanah */}
        <TabsContent value="tanah">
          <Card>
            <CardHeader>
              <CardTitle>Data Tanah</CardTitle>
              <CardDescription>
                Informasi tanah objek pajak berdasarkan SPOP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Luas Tanah</p>
                  <p className="font-medium text-lg">
                    {data.tanah.luasTanah.toLocaleString()} m²
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Kelas Jalan</p>
                  <p className="font-medium text-lg">{data.tanah.kelasJalan}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Zona Wilayah</p>
                  <p className="font-medium text-lg">
                    {data.tanah.zonaWilayah}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">NJOP Tanah/m²</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(data.tanah.njopTanah)}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total NJOP Tanah</span>
                <span className="font-semibold">
                  {formatCurrency(data.tanah.luasTanah * data.tanah.njopTanah)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Bangunan */}
        <TabsContent value="bangunan">
          <Card>
            <CardHeader>
              <CardTitle>Data Bangunan</CardTitle>
              <CardDescription>
                Daftar bangunan pada objek pajak ({data.bangunan.length} unit)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Jenis Bangunan</TableHead>
                    <TableHead className="text-right">Luas</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Kondisi</TableHead>
                    <TableHead className="text-right">NJOP/m²</TableHead>
                    <TableHead className="text-right">Total NJOP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.bangunan.map((b) => (
                    <TableRow key={b.noBangunan}>
                      <TableCell>{b.noBangunan}</TableCell>
                      <TableCell>{b.jenisBangunan}</TableCell>
                      <TableCell className="text-right">
                        {b.luasBangunan.toLocaleString()} m²
                      </TableCell>
                      <TableCell>{b.tahunDibangun}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{b.kondisi}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(b.njopBangunan)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(b.luasBangunan * b.njopBangunan)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total NJOP Bangunan
                </span>
                <span className="font-semibold">
                  {formatCurrency(
                    data.bangunan.reduce(
                      (sum, b) => sum + b.luasBangunan * b.njopBangunan,
                      0
                    )
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: SPPT */}
        <TabsContent value="sppt">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat SPPT</CardTitle>
              <CardDescription>
                Surat Pemberitahuan Pajak Terutang per tahun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tahun</TableHead>
                    <TableHead className="text-right">NJOP</TableHead>
                    <TableHead className="text-right">PBB Terutang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sppt.map((s) => (
                    <TableRow key={s.tahun}>
                      <TableCell className="font-medium">{s.tahun}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(s.njop)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(s.pbb)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            s.status === "lunas" ? "default" : "destructive"
                          }
                        >
                          {s.status === "lunas" ? "Lunas" : "Belum Bayar"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {s.status === "lunas"
                          ? `Dibayar ${s.tanggalBayar}`
                          : `Jatuh tempo ${s.jatuhTempo}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pembayaran */}
        <TabsContent value="pembayaran">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pembayaran</CardTitle>
              <CardDescription>
                Transaksi pembayaran PBB yang tercatat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Tahun Pajak</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pembayaran.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">
                        {p.id}
                      </TableCell>
                      <TableCell>{p.tahunPajak}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(p.jumlah)}
                      </TableCell>
                      <TableCell>{p.tanggal}</TableCell>
                      <TableCell>{p.channel}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Riwayat */}
        <TabsContent value="riwayat">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Mutasi</CardTitle>
              <CardDescription>
                Perubahan data objek pajak dari waktu ke waktu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Dari</TableHead>
                    <TableHead>Ke</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.riwayat.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">
                        {r.id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.jenis}</Badge>
                      </TableCell>
                      <TableCell>{r.dari}</TableCell>
                      <TableCell>{r.ke}</TableCell>
                      <TableCell>{r.tanggal}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
