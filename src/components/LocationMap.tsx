import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  lat?: number
  lng?: number
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationMap({ onLocationSelect, lat, lng }: LocationMapProps) {
  const center: [number, number] = [-25.2637, -57.5759] // Asunción, Paraguay
  const position: [number, number] | undefined = lat && lng ? [lat, lng] : undefined

  useEffect(() => {
    // Forzar actualización del tamaño del mapa después de montar
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 100)
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '300px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onLocationSelect={onLocationSelect} />
      {position && <Marker position={position} />}
    </MapContainer>
  )
}
