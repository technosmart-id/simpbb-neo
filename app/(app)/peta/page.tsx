"use client";

import { Building2, Info, Layers, MapPin, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { BreadcrumbItem } from "@/components/maps/drill-down-map";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dynamic import for Leaflet (SSR incompatible)
const DrillDownMap = dynamic(
  () =>
    import("@/components/maps/drill-down-map").then((mod) => mod.DrillDownMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted">
        <div className="text-center">
          <Layers className="mx-auto size-12 animate-pulse text-muted-foreground" />
          <p className="mt-2 text-muted-foreground text-sm">Memuat peta...</p>
        </div>
      </div>
    ),
  }
);

type SelectedFeature = {
  id: string;
  name: string;
  level: string;
  stats?: {
    totalObjek: number;
    totalNjop: number;
    totalPbb: number;
    lunas: number;
    belum: number;
  };
};

type AdminFeature = {
  properties: {
    id: string;
    name: string;
    level: string;
    stats?: {
      totalObjek: number;
      totalNjop: number;
      totalPbb: number;
      lunas: number;
      belum: number;
    };
  };
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toFixed(2)} T`;
  }
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(2)} jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function PetaPage() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [selectedFeature, setSelectedFeature] =
    useState<SelectedFeature | null>(null);

  const handleBreadcrumbChange = (newBreadcrumbs: BreadcrumbItem[]) => {
    setBreadcrumbs(newBreadcrumbs);
  };

  const handleFeatureSelect = (feature: AdminFeature | null) => {
    if (feature) {
      setSelectedFeature({
        id: feature.properties.id,
        name: feature.properties.name,
        level: feature.properties.level,
        stats: feature.properties.stats,
      });
    } else {
      setSelectedFeature(null);
    }
  };

  // Get current location from breadcrumbs
  const currentLocation =
    breadcrumbs.length > 0 ? breadcrumbs.at(-1)?.name : "Indonesia";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="size-5" />
                Peta Wilayah PBB
              </CardTitle>
              <CardDescription>
                Visualisasi data PBB berdasarkan wilayah administratif. Klik
                pada area untuk melihat detail.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <MapPin className="mr-1 size-3" />
                {currentLocation}
              </Badge>
              {breadcrumbs.length > 0 && (
                <Badge variant="secondary">
                  {breadcrumbs.length} level ke bawah
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-800 text-sm dark:bg-blue-950 dark:text-blue-200">
            <Info className="size-4 shrink-0" />
            <span>
              Klik pada polygon untuk drill-down ke level berikut:{" "}
              <strong>
                Provinsi → Kabupaten/Kota → Kecamatan → Kelurahan → Objek Pajak
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Map and Details */}
      <div className="flex flex-1 gap-4">
        {/* Map */}
        <Card className="flex-1">
          <CardContent className="h-full p-0">
            <DrillDownMap
              onBreadcrumbChange={handleBreadcrumbChange}
              onFeatureSelect={handleFeatureSelect}
            />
          </CardContent>
        </Card>

        {/* Side Panel - Selected Feature Details */}
        {selectedFeature ? (
          <Card className="w-80 shrink-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="size-5" />
                Detail Objek
              </CardTitle>
              <CardDescription>Informasi objek pajak terpilih</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* NOP */}
              <div>
                <p className="text-muted-foreground text-xs">NOP</p>
                <code className="mt-1 block rounded bg-muted px-2 py-1 text-sm">
                  {selectedFeature.id}
                </code>
              </div>

              {/* Nama */}
              <div>
                <p className="text-muted-foreground text-xs">
                  Nama Wajib Pajak
                </p>
                <p className="mt-1 font-semibold">{selectedFeature.name}</p>
              </div>

              {/* Stats */}
              {selectedFeature.stats ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-muted-foreground text-xs">NJOP</p>
                      <p className="mt-1 font-semibold text-sm">
                        {formatCurrency(selectedFeature.stats.totalNjop)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-muted-foreground text-xs">
                        PBB Terutang
                      </p>
                      <p className="mt-1 font-semibold text-primary text-sm">
                        {formatCurrency(selectedFeature.stats.totalPbb)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="flex items-center gap-1 font-medium text-sm">
                      <TrendingUp className="size-4" />
                      Status Pembayaran
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {selectedFeature.stats.lunas > 0 ? (
                        <Badge className="bg-green-600" variant="default">
                          Lunas
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Belum Bayar</Badge>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
