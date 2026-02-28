'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input, Space, Typography } from 'antd';

const { Text } = Typography;

// Fix Leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange?: (lat: number, lng: number) => void;
}

function LocationMarker({ position, setPosition }: { 
  position: [number, number]; 
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  // Default to Vietnam (Hanoi)
  const defaultLat = 21.0285;
  const defaultLng = 105.8542;
  
  const [position, setPosition] = useState<[number, number]>([
    typeof latitude === 'number' ? latitude : defaultLat,
    typeof longitude === 'number' ? longitude : defaultLng,
  ]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handlePositionChange = (newPosition: [number, number]) => {
    setPosition(newPosition);
    if (onChange) {
      onChange(newPosition[0], newPosition[1]);
    }
  };

  const handleManualInput = (lat: string, lng: string) => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      handlePositionChange([parsedLat, parsedLng]);
    }
  };

  if (!mounted) {
    return <div style={{ height: 400, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading map...
    </div>;
  }

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Text type="secondary">Click on the map to select a location</Text>
        <Space.Compact>
          <Input
            prefix="Lat:"
            value={typeof position[0] === 'number' ? position[0].toFixed(6) : ''}
            onChange={(e) => handleManualInput(e.target.value, position[1]?.toString() || '')}
            style={{ width: 200 }}
          />
          <Input
            prefix="Lng:"
            value={typeof position[1] === 'number' ? position[1].toFixed(6) : ''}
            onChange={(e) => handleManualInput(position[0]?.toString() || '', e.target.value)}
            style={{ width: 200 }}
          />
        </Space.Compact>
      </Space>
      
      <div style={{ height: 400, borderRadius: 8, overflow: 'hidden', border: '1px solid #d9d9d9' }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          key={`${position[0]}-${position[1]}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>
    </div>
  );
}
