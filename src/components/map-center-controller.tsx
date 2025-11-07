'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapCenterControllerProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

export function MapCenterController({ latitude, longitude, zoom = 15 }: MapCenterControllerProps) {
  const map = useMap();

  useEffect(() => {
    // Center the map on the apartment location
    map.setView([latitude, longitude], zoom, {
      animate: true,
    });
  }, [latitude, longitude, zoom, map]);

  return null;
}
