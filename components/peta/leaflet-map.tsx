'use client'

/**
 * Leaflet map component — dynamically imported (ssr: false) from peta/page.tsx
 * because leaflet requires the browser window object.
 */

import * as React from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet's default icon path issue with webpack/Next.js
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

fixLeafletIcons()

interface MapMarker {
  position: [number, number]
  popup?: string
}

interface Props {
  center: [number, number]
  zoom: number
  markers?: MapMarker[]
}

function MapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  React.useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

export default function LeafletMap({ center, zoom, markers = [] }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '500px', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapView center={center} zoom={zoom} />
      {markers.map((m, i) => (
        <Marker key={i} position={m.position}>
          {m.popup && <Popup>{m.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  )
}
