"use client";

import { Filter, Layers, Map as MapIcon, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { PropertyData } from "@/components/maps/property-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dynamic import for Leaflet (SSR incompatible)
const PropertyMap = dynamic(
  () => import("@/components/maps/property-map").then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted">
        <div className="text-center">
          <MapIcon className="mx-auto size-12 animate-pulse text-muted-foreground" />
          <p className="mt-2 text-muted-foreground text-sm">Memuat peta...</p>
        </div>
      </div>
    ),
  }
);

// Mock data - in production this would come from oRPC
const mockProperties: PropertyData[] = [
  {
    nop: "32.71.010.001.001.0001.0",
    namaWP: "PT ABADI JAYA",
    alamatOP: "Jl. Asia Afrika No. 123",
    kelurahan: "Braga",
    kecamatan: "Sumur Bandung",
    lat: -6.9215,
    lng: 107.6081,
    luasTanah: 500,
    luasBangunan: 350,
    njop: 2_500_000_000,
    pbbTerutang: 5_000_000,
    statusBayar: "lunas",
  },
  {
    nop: "32.71.010.001.001.0002.0",
    namaWP: "CV SENTOSA MAKMUR",
    alamatOP: "Jl. Braga No. 45",
    kelurahan: "Braga",
    kecamatan: "Sumur Bandung",
    lat: -6.9189,
    lng: 107.6095,
    luasTanah: 300,
    luasBangunan: 200,
    njop: 1_800_000_000,
    pbbTerutang: 3_600_000,
    statusBayar: "belum",
  },
  {
    nop: "32.71.010.001.002.0001.0",
    namaWP: "BUDI SANTOSO",
    alamatOP: "Jl. Merdeka No. 78",
    kelurahan: "Citarum",
    kecamatan: "Bandung Wetan",
    lat: -6.9135,
    lng: 107.6185,
    luasTanah: 250,
    luasBangunan: 180,
    njop: 1_200_000_000,
    pbbTerutang: 2_400_000,
    statusBayar: "lunas",
  },
  {
    nop: "32.71.010.001.002.0002.0",
    namaWP: "SITI RAHAYU",
    alamatOP: "Jl. Diponegoro No. 55",
    kelurahan: "Citarum",
    kecamatan: "Bandung Wetan",
    lat: -6.9055,
    lng: 107.6155,
    luasTanah: 400,
    luasBangunan: 280,
    njop: 2_100_000_000,
    pbbTerutang: 4_200_000,
    statusBayar: "belum",
  },
  {
    nop: "32.71.010.002.001.0001.0",
    namaWP: "H. AHMAD YANI",
    alamatOP: "Jl. Dago No. 100",
    kelurahan: "Dago",
    kecamatan: "Coblong",
    lat: -6.8845,
    lng: 107.6175,
    luasTanah: 600,
    luasBangunan: 400,
    njop: 3_500_000_000,
    pbbTerutang: 7_000_000,
    statusBayar: "lunas",
  },
  {
    nop: "32.71.010.002.001.0002.0",
    namaWP: "TOKO SEJAHTERA",
    alamatOP: "Jl. Ir. H. Juanda No. 88",
    kelurahan: "Dago",
    kecamatan: "Coblong",
    lat: -6.8925,
    lng: 107.6125,
    luasTanah: 200,
    luasBangunan: 150,
    njop: 950_000_000,
    pbbTerutang: 1_900_000,
    statusBayar: "belum",
  },
  {
    nop: "32.71.010.002.002.0001.0",
    namaWP: "UD MAJU BERSAMA",
    alamatOP: "Jl. Cihampelas No. 150",
    kelurahan: "Cipaganti",
    kecamatan: "Coblong",
    lat: -6.8935,
    lng: 107.6025,
    luasTanah: 350,
    luasBangunan: 250,
    njop: 1_600_000_000,
    pbbTerutang: 3_200_000,
    statusBayar: "lunas",
  },
  {
    nop: "32.71.010.003.001.0001.0",
    namaWP: "PT BANDUNG INDAH",
    alamatOP: "Jl. Sukajadi No. 200",
    kelurahan: "Sukajadi",
    kecamatan: "Sukajadi",
    lat: -6.8875,
    lng: 107.5935,
    luasTanah: 450,
    luasBangunan: 320,
    njop: 2_200_000_000,
    pbbTerutang: 4_400_000,
    statusBayar: "belum",
  },
  {
    nop: "32.71.010.003.001.0002.0",
    namaWP: "HOTEL GRAND ROYAL",
    alamatOP: "Jl. Setiabudi No. 88",
    kelurahan: "Setiabudi",
    kecamatan: "Sukasari",
    lat: -6.8655,
    lng: 107.5985,
    luasTanah: 2000,
    luasBangunan: 1500,
    njop: 15_000_000_000,
    pbbTerutang: 30_000_000,
    statusBayar: "lunas",
  },
  {
    nop: "32.71.010.003.002.0001.0",
    namaWP: "RESTORAN SUNDA ASLI",
    alamatOP: "Jl. Riau No. 45",
    kelurahan: "Citarum",
    kecamatan: "Bandung Wetan",
    lat: -6.9085,
    lng: 107.6215,
    luasTanah: 280,
    luasBangunan: 200,
    njop: 1_400_000_000,
    pbbTerutang: 2_800_000,
    statusBayar: "belum",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

export default function ObjekPajakPetaPage() {
  const [kecamatan, setKecamatan] = useState("semua");
  const [kelurahan, setKelurahan] = useState("semua");
  const [statusBayar, setStatusBayar] = useState("semua");
  const [selectedNop, setSelectedNop] = useState<string | null>(null);

  // Filter properties based on selected filters
  const filteredProperties = mockProperties.filter((p) => {
    if (kecamatan !== "semua" && p.kecamatan !== kecamatan) {
      return false;
    }
    if (kelurahan !== "semua" && p.kelurahan !== kelurahan) {
      return false;
    }
    if (statusBayar !== "semua" && p.statusBayar !== statusBayar) {
      return false;
    }
    return true;
  });

  // Calculate summary
  const summary = {
    total: filteredProperties.length,
    lunas: filteredProperties.filter((p) => p.statusBayar === "lunas").length,
    belum: filteredProperties.filter((p) => p.statusBayar === "belum").length,
    totalNjop: filteredProperties.reduce((sum, p) => sum + p.njop, 0),
    totalPbb: filteredProperties.reduce((sum, p) => sum + p.pbbTerutang, 0),
  };

  // Get unique kecamatan and kelurahan for filter options
  const kecamatanList = [...new Set(mockProperties.map((p) => p.kecamatan))];
  const kelurahanList = [
    ...new Set(
      mockProperties
        .filter((p) => kecamatan === "semua" || p.kecamatan === kecamatan)
        .map((p) => p.kelurahan)
    ),
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 pt-0">
      {/* Header & Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="size-5" />
                Peta Objek Pajak
              </CardTitle>
              <CardDescription>
                Visualisasi lokasi objek pajak di wilayah Kota Bandung
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <MapPin className="mr-1 size-3" />
                {summary.total} objek
              </Badge>
              <Badge variant="default">{summary.lunas} lunas</Badge>
              <Badge variant="destructive">{summary.belum} belum bayar</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <FieldGroup className="w-40">
              <Field>
                <FieldLabel htmlFor="kecamatan">Kecamatan</FieldLabel>
                <Select
                  onValueChange={(v) => {
                    setKecamatan(v);
                    setKelurahan("semua");
                  }}
                  value={kecamatan}
                >
                  <SelectTrigger id="kecamatan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    {kecamatanList.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup className="w-40">
              <Field>
                <FieldLabel htmlFor="kelurahan">Kelurahan</FieldLabel>
                <Select onValueChange={setKelurahan} value={kelurahan}>
                  <SelectTrigger id="kelurahan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    {kelurahanList.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup className="w-40">
              <Field>
                <FieldLabel htmlFor="status">Status Bayar</FieldLabel>
                <Select onValueChange={setStatusBayar} value={statusBayar}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="belum">Belum Bayar</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <Button
              onClick={() => {
                setKecamatan("semua");
                setKelurahan("semua");
                setStatusBayar("semua");
              }}
              variant="outline"
            >
              <Filter className="mr-2 size-4" />
              Reset Filter
            </Button>

            <div className="ml-auto flex gap-4 text-sm">
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Total NJOP</p>
                <p className="font-semibold">
                  {formatCurrency(summary.totalNjop)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Total PBB</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(summary.totalPbb)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="flex-1">
        <CardContent className="h-full p-0">
          <PropertyMap
            center={[-6.9034, 107.6082]} // Bandung center
            onMarkerClick={setSelectedNop}
            properties={filteredProperties}
            selectedNop={selectedNop}
            zoom={13}
          />
        </CardContent>
      </Card>
    </div>
  );
}
