"use client";

import "leaflet/dist/leaflet.css";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import L from "leaflet";
import { useCallback, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";

// Types for administrative boundaries
type AdminLevel =
  | "provinsi"
  | "kabupaten"
  | "kecamatan"
  | "kelurahan"
  | "objek";

type AdminProperties = {
  id: string;
  name: string;
  level: AdminLevel;
  parentId?: string;
  stats?: {
    totalObjek: number;
    totalNjop: number;
    totalPbb: number;
    lunas: number;
    belum: number;
  };
};

export type AdminFeature = Feature<Geometry, AdminProperties>;
export type AdminFeatureCollection = FeatureCollection<
  Geometry,
  AdminProperties
>;

// Color scheme for different levels
const levelColors: Record<AdminLevel, string> = {
  provinsi: "#3b82f6",
  kabupaten: "#22c55e",
  kecamatan: "#f59e0b",
  kelurahan: "#ec4899",
  objek: "#8b5cf6",
};

const levelLabels: Record<AdminLevel, string> = {
  provinsi: "Provinsi",
  kabupaten: "Kabupaten/Kota",
  kecamatan: "Kecamatan",
  kelurahan: "Kelurahan",
  objek: "Objek Pajak",
};

// Mock GeoJSON data for Jawa Barat region
const mockProvinsiData: AdminFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "32",
        name: "Jawa Barat",
        level: "provinsi",
        stats: {
          totalObjek: 2_500_000,
          totalNjop: 850_000_000_000_000,
          totalPbb: 1_700_000_000_000,
          lunas: 1_800_000,
          belum: 700_000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.4, -7.8],
            [108.3, -7.8],
            [108.3, -6.2],
            [106.4, -6.2],
            [106.4, -7.8],
          ],
        ],
      },
    },
  ],
};

const mockKabupatenData: AdminFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "3273",
        name: "Kota Bandung",
        level: "kabupaten",
        parentId: "32",
        stats: {
          totalObjek: 450_000,
          totalNjop: 180_000_000_000_000,
          totalPbb: 360_000_000_000,
          lunas: 350_000,
          belum: 100_000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.55, -6.97],
            [107.7, -6.97],
            [107.7, -6.85],
            [107.55, -6.85],
            [107.55, -6.97],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "3204",
        name: "Kabupaten Bandung",
        level: "kabupaten",
        parentId: "32",
        stats: {
          totalObjek: 380_000,
          totalNjop: 95_000_000_000_000,
          totalPbb: 190_000_000_000,
          lunas: 280_000,
          belum: 100_000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.3, -7.2],
            [107.8, -7.2],
            [107.8, -6.9],
            [107.3, -6.9],
            [107.3, -7.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "3217",
        name: "Kabupaten Bandung Barat",
        level: "kabupaten",
        parentId: "32",
        stats: {
          totalObjek: 220_000,
          totalNjop: 55_000_000_000_000,
          totalPbb: 110_000_000_000,
          lunas: 160_000,
          belum: 60_000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.2, -7.0],
            [107.55, -7.0],
            [107.55, -6.75],
            [107.2, -6.75],
            [107.2, -7.0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "3277",
        name: "Kota Cimahi",
        level: "kabupaten",
        parentId: "32",
        stats: {
          totalObjek: 85_000,
          totalNjop: 25_000_000_000_000,
          totalPbb: 50_000_000_000,
          lunas: 65_000,
          belum: 20_000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.5, -6.92],
            [107.57, -6.92],
            [107.57, -6.85],
            [107.5, -6.85],
            [107.5, -6.92],
          ],
        ],
      },
    },
  ],
};

const mockKecamatanData: AdminFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "327301",
        name: "Bandung Wetan",
        level: "kecamatan",
        parentId: "3273",
        stats: {
          totalObjek: 15_000,
          totalNjop: 12_000_000_000_000,
          totalPbb: 24_000_000_000,
          lunas: 12_000,
          belum: 3000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.61, -6.92],
            [107.64, -6.92],
            [107.64, -6.89],
            [107.61, -6.89],
            [107.61, -6.92],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "327302",
        name: "Sumur Bandung",
        level: "kecamatan",
        parentId: "3273",
        stats: {
          totalObjek: 12_000,
          totalNjop: 15_000_000_000_000,
          totalPbb: 30_000_000_000,
          lunas: 10_000,
          belum: 2000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.6, -6.93],
            [107.63, -6.93],
            [107.63, -6.91],
            [107.6, -6.91],
            [107.6, -6.93],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "327303",
        name: "Coblong",
        level: "kecamatan",
        parentId: "3273",
        stats: {
          totalObjek: 18_000,
          totalNjop: 20_000_000_000_000,
          totalPbb: 40_000_000_000,
          lunas: 14_000,
          belum: 4000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.6, -6.9],
            [107.64, -6.9],
            [107.64, -6.86],
            [107.6, -6.86],
            [107.6, -6.9],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "327304",
        name: "Sukajadi",
        level: "kecamatan",
        parentId: "3273",
        stats: {
          totalObjek: 16_000,
          totalNjop: 10_000_000_000_000,
          totalPbb: 20_000_000_000,
          lunas: 13_000,
          belum: 3000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.58, -6.9],
            [107.62, -6.9],
            [107.62, -6.87],
            [107.58, -6.87],
            [107.58, -6.9],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "327305",
        name: "Cicendo",
        level: "kecamatan",
        parentId: "3273",
        stats: {
          totalObjek: 14_000,
          totalNjop: 8_000_000_000_000,
          totalPbb: 16_000_000_000,
          lunas: 11_000,
          belum: 3000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.58, -6.92],
            [107.61, -6.92],
            [107.61, -6.89],
            [107.58, -6.89],
            [107.58, -6.92],
          ],
        ],
      },
    },
  ],
};

const mockKelurahanData: AdminFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "3273010001",
        name: "Citarum",
        level: "kelurahan",
        parentId: "327301",
        stats: {
          totalObjek: 3500,
          totalNjop: 3_000_000_000_000,
          totalPbb: 6_000_000_000,
          lunas: 2800,
          belum: 700,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.615, -6.915],
            [107.625, -6.915],
            [107.625, -6.905],
            [107.615, -6.905],
            [107.615, -6.915],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "3273010002",
        name: "Tamansari",
        level: "kelurahan",
        parentId: "327301",
        stats: {
          totalObjek: 4200,
          totalNjop: 3_500_000_000_000,
          totalPbb: 7_000_000_000,
          lunas: 3400,
          belum: 800,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.625, -6.915],
            [107.635, -6.915],
            [107.635, -6.905],
            [107.625, -6.905],
            [107.625, -6.915],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "3273010003",
        name: "Cihapit",
        level: "kelurahan",
        parentId: "327301",
        stats: {
          totalObjek: 3800,
          totalNjop: 2_800_000_000_000,
          totalPbb: 5_600_000_000,
          lunas: 3000,
          belum: 800,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.615, -6.905],
            [107.625, -6.905],
            [107.625, -6.895],
            [107.615, -6.895],
            [107.615, -6.905],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "3273010004",
        name: "Ciateul",
        level: "kelurahan",
        parentId: "327301",
        stats: {
          totalObjek: 3500,
          totalNjop: 2_700_000_000_000,
          totalPbb: 5_400_000_000,
          lunas: 2800,
          belum: 700,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.625, -6.905],
            [107.635, -6.905],
            [107.635, -6.895],
            [107.625, -6.895],
            [107.625, -6.905],
          ],
        ],
      },
    },
  ],
};

// Mock objek pajak polygons (property boundaries)
const mockObjekData: AdminFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "32.71.010.001.001.0001.0",
        name: "PT ABADI JAYA",
        level: "objek",
        parentId: "3273010001",
        stats: {
          totalObjek: 1,
          totalNjop: 2_500_000_000,
          totalPbb: 5_000_000,
          lunas: 1,
          belum: 0,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.617, -6.912],
            [107.619, -6.912],
            [107.619, -6.91],
            [107.617, -6.91],
            [107.617, -6.912],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "32.71.010.001.001.0002.0",
        name: "CV SENTOSA MAKMUR",
        level: "objek",
        parentId: "3273010001",
        stats: {
          totalObjek: 1,
          totalNjop: 1_800_000_000,
          totalPbb: 3_600_000,
          lunas: 0,
          belum: 1,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.619, -6.912],
            [107.621, -6.912],
            [107.621, -6.91],
            [107.619, -6.91],
            [107.619, -6.912],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "32.71.010.001.001.0003.0",
        name: "BUDI SANTOSO",
        level: "objek",
        parentId: "3273010001",
        stats: {
          totalObjek: 1,
          totalNjop: 1_200_000_000,
          totalPbb: 2_400_000,
          lunas: 1,
          belum: 0,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.621, -6.912],
            [107.623, -6.912],
            [107.623, -6.91],
            [107.621, -6.91],
            [107.621, -6.912],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "32.71.010.001.001.0004.0",
        name: "SITI RAHAYU",
        level: "objek",
        parentId: "3273010001",
        stats: {
          totalObjek: 1,
          totalNjop: 950_000_000,
          totalPbb: 1_900_000,
          lunas: 0,
          belum: 1,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.617, -6.91],
            [107.619, -6.91],
            [107.619, -6.908],
            [107.617, -6.908],
            [107.617, -6.91],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "32.71.010.001.001.0005.0",
        name: "TOKO SEJAHTERA",
        level: "objek",
        parentId: "3273010001",
        stats: {
          totalObjek: 1,
          totalNjop: 1_600_000_000,
          totalPbb: 3_200_000,
          lunas: 1,
          belum: 0,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.619, -6.91],
            [107.621, -6.91],
            [107.621, -6.908],
            [107.619, -6.908],
            [107.619, -6.91],
          ],
        ],
      },
    },
  ],
};

// Get data for current level and parent
function getDataForLevel(
  level: AdminLevel,
  parentId?: string
): AdminFeatureCollection {
  switch (level) {
    case "provinsi":
      return mockProvinsiData;
    case "kabupaten":
      return {
        ...mockKabupatenData,
        features: mockKabupatenData.features.filter(
          (f) => !parentId || f.properties.parentId === parentId
        ),
      };
    case "kecamatan":
      return {
        ...mockKecamatanData,
        features: mockKecamatanData.features.filter(
          (f) => !parentId || f.properties.parentId === parentId
        ),
      };
    case "kelurahan":
      return {
        ...mockKelurahanData,
        features: mockKelurahanData.features.filter(
          (f) => !parentId || f.properties.parentId === parentId
        ),
      };
    case "objek":
      return {
        ...mockObjekData,
        features: mockObjekData.features.filter(
          (f) => !parentId || f.properties.parentId === parentId
        ),
      };
    default:
      return { type: "FeatureCollection", features: [] };
  }
}

// Get next level
function getNextLevel(currentLevel: AdminLevel): AdminLevel | null {
  const levels: AdminLevel[] = [
    "provinsi",
    "kabupaten",
    "kecamatan",
    "kelurahan",
    "objek",
  ];
  const currentIndex = levels.indexOf(currentLevel);
  if (currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  return null;
}

// Format currency
function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toFixed(1)} T`;
  }
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

// Map bounds adjuster
function MapBoundsAdjuster({ data }: { data: AdminFeatureCollection }) {
  const map = useMap();

  useMemo(() => {
    if (data.features.length > 0) {
      const geoJsonLayer = L.geoJSON(data);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [data, map]);

  return null;
}

export type BreadcrumbItem = {
  id: string;
  name: string;
  level: AdminLevel;
};

type DrillDownMapProps = {
  onBreadcrumbChange?: (breadcrumbs: BreadcrumbItem[]) => void;
  onFeatureSelect?: (feature: AdminFeature | null) => void;
};

export function DrillDownMap({
  onBreadcrumbChange,
  onFeatureSelect,
}: DrillDownMapProps) {
  const [currentLevel, setCurrentLevel] = useState<AdminLevel>("provinsi");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [hoveredFeature, setHoveredFeature] = useState<AdminFeature | null>(
    null
  );

  const currentData = useMemo(
    () => getDataForLevel(currentLevel, parentId),
    [currentLevel, parentId]
  );

  const handleFeatureClick = useCallback(
    (feature: AdminFeature) => {
      const nextLevel = getNextLevel(feature.properties.level);

      if (nextLevel) {
        // Add to breadcrumbs
        const newBreadcrumb: BreadcrumbItem = {
          id: feature.properties.id,
          name: feature.properties.name,
          level: feature.properties.level,
        };
        const newBreadcrumbs = [...breadcrumbs, newBreadcrumb];
        setBreadcrumbs(newBreadcrumbs);
        onBreadcrumbChange?.(newBreadcrumbs);

        // Drill down
        setCurrentLevel(nextLevel);
        setParentId(feature.properties.id);
        onFeatureSelect?.(null);
      } else {
        // At objek level, select the feature
        onFeatureSelect?.(feature);
      }
    },
    [breadcrumbs, onBreadcrumbChange, onFeatureSelect]
  );

  const handleBreadcrumbClick = useCallback(
    (index: number) => {
      if (index < 0) {
        // Go back to root (provinsi)
        setCurrentLevel("provinsi");
        setParentId(undefined);
        setBreadcrumbs([]);
        onBreadcrumbChange?.([]);
      } else {
        // Go to specific level
        const targetBreadcrumb = breadcrumbs[index];
        const nextLevel = getNextLevel(targetBreadcrumb.level);
        if (nextLevel) {
          setCurrentLevel(nextLevel);
          setParentId(targetBreadcrumb.id);
          const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
          setBreadcrumbs(newBreadcrumbs);
          onBreadcrumbChange?.(newBreadcrumbs);
        }
      }
      onFeatureSelect?.(null);
    },
    [breadcrumbs, onBreadcrumbChange, onFeatureSelect]
  );

  const geoJsonStyle = useCallback(
    (feature?: AdminFeature) => {
      const isHovered =
        hoveredFeature?.properties.id === feature?.properties.id;
      const level = feature?.properties.level || currentLevel;
      const baseColor = levelColors[level];

      // For objek level, color based on payment status
      if (level === "objek" && feature?.properties.stats) {
        const isPaid = feature.properties.stats.lunas > 0;
        return {
          fillColor: isPaid ? "#22c55e" : "#ef4444",
          weight: isHovered ? 3 : 2,
          opacity: 1,
          color: isHovered ? "#1e40af" : "#ffffff",
          fillOpacity: isHovered ? 0.8 : 0.6,
        };
      }

      return {
        fillColor: baseColor,
        weight: isHovered ? 3 : 2,
        opacity: 1,
        color: isHovered ? "#1e40af" : "#ffffff",
        fillOpacity: isHovered ? 0.7 : 0.5,
      };
    },
    [hoveredFeature, currentLevel]
  );

  const onEachFeature = useCallback(
    (feature: AdminFeature, layer: L.Layer) => {
      layer.on({
        mouseover: () => setHoveredFeature(feature),
        mouseout: () => setHoveredFeature(null),
        click: () => handleFeatureClick(feature),
      });

      // Bind tooltip
      const props = feature.properties;
      const stats = props.stats;
      const tooltipContent = `
        <div class="p-2">
          <div class="font-bold">${props.name}</div>
          <div class="text-xs text-gray-500">${levelLabels[props.level]}</div>
          ${
            stats
              ? `
            <hr class="my-1"/>
            <div class="text-xs">
              <div>Objek: ${stats.totalObjek.toLocaleString()}</div>
              <div>NJOP: ${formatCurrency(stats.totalNjop)}</div>
              <div>PBB: ${formatCurrency(stats.totalPbb)}</div>
              <div class="flex gap-2 mt-1">
                <span class="text-green-600">✓ ${stats.lunas.toLocaleString()}</span>
                <span class="text-red-600">✗ ${stats.belum.toLocaleString()}</span>
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;
      layer.bindTooltip(tooltipContent, { sticky: true });
    },
    [handleFeatureClick]
  );

  return (
    <div className="relative h-full w-full">
      {/* Breadcrumb Navigation */}
      <div className="absolute top-4 left-4 z-[1000] rounded-lg bg-white/95 p-2 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-1 text-sm">
          <button
            className="rounded px-2 py-1 font-medium text-blue-600 hover:bg-blue-50"
            onClick={() => handleBreadcrumbClick(-1)}
            type="button"
          >
            Indonesia
          </button>
          {breadcrumbs.map((item, index) => (
            <div className="flex items-center" key={item.id}>
              <span className="mx-1 text-gray-400">/</span>
              <button
                className="rounded px-2 py-1 hover:bg-blue-50"
                onClick={() => handleBreadcrumbClick(index)}
                type="button"
              >
                {item.name}
              </button>
            </div>
          ))}
          <span className="mx-1 text-gray-400">/</span>
          <span className="px-2 py-1 font-medium text-gray-900">
            {levelLabels[currentLevel]}
          </span>
        </div>
      </div>

      {/* Level indicator */}
      <div className="absolute top-4 right-4 z-[1000] rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm">
        <div className="text-gray-500 text-xs">Level saat ini</div>
        <div
          className="mt-1 flex items-center gap-2 font-semibold"
          style={{ color: levelColors[currentLevel] }}
        >
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: levelColors[currentLevel] }}
          />
          {levelLabels[currentLevel]}
        </div>
        <div className="mt-2 text-gray-500 text-xs">
          {currentData.features.length} area
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[-6.9, 107.6]}
        className="h-full w-full"
        scrollWheelZoom
        zoom={9}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsAdjuster data={currentData} />
        <GeoJSON
          data={currentData}
          key={`${currentLevel}-${parentId || "root"}`}
          onEachFeature={onEachFeature}
          style={geoJsonStyle}
        />
      </MapContainer>

      {/* Legend for objek level */}
      {currentLevel === "objek" ? (
        <div className="absolute right-4 bottom-4 z-[1000] rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <div className="font-medium text-gray-700 text-xs">Status Bayar</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3 rounded bg-green-500" />
              <span>Lunas</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3 rounded bg-red-500" />
              <span>Belum Bayar</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
