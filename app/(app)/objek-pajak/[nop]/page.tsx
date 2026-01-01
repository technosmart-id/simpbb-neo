"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building,
  CreditCard,
  FileText,
  History,
  LandPlot,
  Loader2,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type definitions for API response
type BumiData = {
  noBumi: number;
  kdZnt: string;
  luasBumi: number;
  jnsBumi: string;
  nilaiSistemBumi: number;
};

type BangunanData = {
  noBng: number;
  kdJpb: string;
  nmJpb: string;
  noFormulirLspop: string;
  thnDibangunBng: string;
  thnRenovasiBng: string | null;
  luasBng: number;
  jmlLantaiBng: number;
  kondisiBng: string;
  jnsKonstruksiBng: string | null;
  jnsAtapBng: string | null;
  kdDinding: string | null;
  kdLantai: string | null;
  kdLangitLangit: string | null;
  nilaiSistemBng: number;
};

type ObjekPajakResponse = {
  nop: string;
  objekPajak: {
    jalanOp: string;
    blokKavNoOp: string | null;
    rwOp: string | null;
    rtOp: string | null;
    totalLuasBumi: number;
    totalLuasBng: number;
    njopBumi: number;
    njopBng: number;
  };
  subjekPajak: {
    nmWp: string;
    jalanWp: string;
    blokKavNoWp: string | null;
    rwWp: string | null;
    rtWp: string | null;
    kelurahanWp: string | null;
    kotaWp: string | null;
    kdPosWp: string | null;
  } | null;
  wilayah: {
    propinsi: string | null;
    dati2: string | null;
    kecamatan: string | null;
    kelurahan: string | null;
  };
  bumi: BumiData[];
  bangunan: BangunanData[];
  summary: {
    totalLuasBumi: number;
    totalLuasBng: number;
    njopBumi: number;
    njopBng: number;
    njopTotal: number;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function getKondisiLabel(kondisi: string): string {
  const kondisiMap: Record<string, string> = {
    "1": "Sangat Baik",
    "2": "Baik",
    "3": "Sedang",
    "4": "Jelek",
  };
  return kondisiMap[kondisi] || kondisi;
}

function getJenisBumiLabel(jenis: string): string {
  const jenisMap: Record<string, string> = {
    "1": "Tanah",
    "2": "Sawah",
    "3": "Tambak",
    "4": "Kebun",
  };
  return jenisMap[jenis] || jenis;
}

async function fetchObjekPajak(nop: string): Promise<ObjekPajakResponse> {
  const res = await fetch(`/api/objek-pajak/${encodeURIComponent(nop)}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch data");
  }
  return res.json();
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-6">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-100 w-full" />
    </div>
  );
}

export default function ObjekPajakDetailPage() {
  const params = useParams();
  const nop = params.nop as string;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["objek-pajak", nop],
    queryFn: () => fetchObjekPajak(decodeURIComponent(nop)),
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Failed to load data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-muted-foreground text-sm">
              NOP: {decodeURIComponent(nop)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const alamatWP = [
    data.subjekPajak?.jalanWp,
    data.subjekPajak?.blokKavNoWp,
    data.subjekPajak?.rtWp && data.subjekPajak?.rwWp
      ? `RT ${data.subjekPajak.rtWp}/RW ${data.subjekPajak.rwWp}`
      : null,
    data.subjekPajak?.kelurahanWp,
    data.subjekPajak?.kotaWp,
  ]
    .filter(Boolean)
    .join(", ");

  const alamatOP = [
    data.objekPajak.jalanOp,
    data.objekPajak.blokKavNoOp,
    data.objekPajak.rtOp && data.objekPajak.rwOp
      ? `RT ${data.objekPajak.rtOp}/RW ${data.objekPajak.rwOp}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  // Calculate NJOP per m2 for bumi
  const njopBumiPerM2 =
    data.summary.totalLuasBumi > 0
      ? data.summary.njopBumi / data.summary.totalLuasBumi
      : 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* WP Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: Profile Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="font-mono" variant="default">
                  {data.nop}
                </Badge>
                <Badge variant="outline">Aktif</Badge>
              </div>

              <div>
                <h2 className="font-semibold text-xl">
                  {data.subjekPajak?.nmWp || "Tidak ada data WP"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {alamatWP || "-"}
                </p>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p>{alamatOP || "-"}</p>
                  <p className="text-muted-foreground">
                    {[
                      data.wilayah.kelurahan,
                      data.wilayah.kecamatan,
                      data.wilayah.dati2,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick Stats & Actions */}
            <div className="flex flex-col gap-4">
              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Total NJOP</p>
                  <p className="font-semibold text-lg">
                    {formatCurrency(data.summary.njopTotal)}
                  </p>
                </div>
                <Separator className="h-auto" orientation="vertical" />
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Luas Bumi</p>
                  <p className="font-semibold text-lg">
                    {data.summary.totalLuasBumi.toLocaleString()} m²
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
            Tanah ({data.bumi.length})
          </TabsTrigger>
          <TabsTrigger value="bangunan">
            <Building className="mr-2 size-4" />
            Bangunan ({data.bangunan.length})
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
              <CardTitle>Data Tanah/Bumi</CardTitle>
              <CardDescription>
                Informasi tanah objek pajak ({data.bumi.length} bidang)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.bumi.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Kode ZNT</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead className="text-right">Luas (m²)</TableHead>
                        <TableHead className="text-right">
                          Nilai Sistem
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.bumi.map((b) => (
                        <TableRow key={b.noBumi}>
                          <TableCell>{b.noBumi}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{b.kdZnt}</Badge>
                          </TableCell>
                          <TableCell>{getJenisBumiLabel(b.jnsBumi)}</TableCell>
                          <TableCell className="text-right">
                            {b.luasBumi.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(b.nilaiSistemBumi)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Separator className="my-4" />
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">
                        Total Luas
                      </p>
                      <p className="font-medium text-lg">
                        {data.summary.totalLuasBumi.toLocaleString()} m²
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">
                        NJOP Bumi/m²
                      </p>
                      <p className="font-medium text-lg">
                        {formatCurrency(njopBumiPerM2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">
                        Total NJOP Bumi
                      </p>
                      <p className="font-medium text-lg">
                        {formatCurrency(data.summary.njopBumi)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">
                  Tidak ada data tanah
                </p>
              )}
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
              {data.bangunan.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Jenis Bangunan</TableHead>
                        <TableHead className="text-right">Luas (m²)</TableHead>
                        <TableHead className="text-right">Lantai</TableHead>
                        <TableHead>Tahun</TableHead>
                        <TableHead>Kondisi</TableHead>
                        <TableHead className="text-right">
                          Nilai Sistem
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.bangunan.map((b) => (
                        <TableRow key={b.noBng}>
                          <TableCell>{b.noBng}</TableCell>
                          <TableCell>
                            <div>
                              <p>{b.nmJpb}</p>
                              <p className="font-mono text-muted-foreground text-xs">
                                {b.kdJpb}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {b.luasBng.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {b.jmlLantaiBng}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{b.thnDibangunBng}</p>
                              {b.thnRenovasiBng ? (
                                <p className="text-muted-foreground text-xs">
                                  Renovasi: {b.thnRenovasiBng}
                                </p>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getKondisiLabel(b.kondisiBng)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(b.nilaiSistemBng)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Separator className="my-4" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Luas Bangunan
                    </span>
                    <span className="font-semibold">
                      {data.summary.totalLuasBng.toLocaleString()} m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total NJOP Bangunan
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(data.summary.njopBng)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">
                  Tidak ada data bangunan
                </p>
              )}
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
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Coming soon - SPPT data integration
              </div>
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
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Coming soon - Payment data integration
              </div>
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
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Coming soon - History data integration
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
