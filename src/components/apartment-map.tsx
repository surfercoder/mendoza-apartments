'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icon in Next.js
// Create a custom icon using a data URL
const customIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="#e74c3c" stroke="#c0392b" stroke-width="1" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 1.996.471 3.882 1.305 5.547l10.39 21.844a1.5 1.5 0 0 0 2.61 0l10.39-21.844A12.451 12.451 0 0 0 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 41 41">
      <ellipse fill="#000" opacity="0.2" cx="20.5" cy="37" rx="18" ry="4"/>
    </svg>
  `),
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const MapCenterController = dynamic(
  () => import('./map-center-controller').then((mod) => mod.MapCenterController),
  { ssr: false }
);

interface ApartmentMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  googleMapsUrl?: string;
}

export function ApartmentMap({ latitude, longitude, title, address, googleMapsUrl }: ApartmentMapProps) {
  const [isClient] = useState(() => typeof window !== 'undefined');

  if (!isClient) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <MapCenterController latitude={latitude} longitude={longitude} zoom={16} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={customIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{title}</p>
              <p className="text-muted-foreground">{address}</p>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mt-1 inline-block"
                >
                  View in Google Maps
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
