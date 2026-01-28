"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Fix Leaflet default marker icon issue with Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const highlightedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export type PropertyData = {
  nop: string;
  namaWP: string;
  alamatOP: string;
  kelurahan: string;
  kecamatan: string;
  lat: number;
  lng: number;
  luasTanah: number;
  luasBangunan: number;
  njop: number;
  pbbTerutang: number;
  statusBayar: "lunas" | "belum";
};

type PropertyMapProps = {
  properties: PropertyData[];
  center?: [number, number];
  zoom?: number;
  selectedNop?: string | null;
  onMarkerClick?: (nop: string) => void;
};

// Component to handle map view changes
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function PropertyMap({
  properties,
  center = [-6.9175, 107.6191], // Default: Bandung
  zoom = 14,
  selectedNop,
  onMarkerClick,
}: PropertyMapProps) {
  return (
    <MapContainer
      center={center}
      className="h-full w-full rounded-lg"
      scrollWheelZoom
      zoom={zoom}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} zoom={zoom} />

      {properties.map((property) => {
        const isSelected = selectedNop === property.nop;
        return (
          <Marker
            eventHandlers={{
              click: () => onMarkerClick?.(property.nop),
            }}
            // biome-ignore lint/nursery/noLeakedRender: Icons are always defined objects
            icon={isSelected ? highlightedIcon : defaultIcon}
            key={property.nop}
            position={[property.lat, property.lng]}
          >
            <Popup maxWidth={320} minWidth={280}>
              <div className="space-y-2 p-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {property.nop}
                  </code>
                  <Badge
                    variant={
                      property.statusBayar === "lunas"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {property.statusBayar === "lunas" ? "Lunas" : "Belum Bayar"}
                  </Badge>
                </div>

                {/* Wajib Pajak */}
                <div>
                  <p className="font-semibold">{property.namaWP}</p>
                  <p className="text-muted-foreground text-xs">
                    {property.alamatOP}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {property.kelurahan}, {property.kecamatan}
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Luas Tanah</p>
                    <p className="font-medium">
                      {property.luasTanah.toLocaleString()} m²
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Luas Bangunan</p>
                    <p className="font-medium">
                      {property.luasBangunan.toLocaleString()} m²
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">NJOP</p>
                    <p className="font-medium">
                      {formatCurrency(property.njop)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PBB Terutang</p>
                    <p className="font-medium">
                      {formatCurrency(property.pbbTerutang)}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-1">
                  <Link
                    href={`/objek-pajak/${encodeURIComponent(property.nop)}`}
                  >
                    <Button className="w-full" size="sm" variant="outline">
                      Lihat Detail
                    </Button>
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
