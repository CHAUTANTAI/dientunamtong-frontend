'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Typography, Button, Space } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

// Fix Leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  companyName?: string;
  address?: string;
}

export default function MapDisplay({ latitude, longitude, companyName, address }: MapDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('client.contact');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenInGoogleMaps = () => {
    // Open in Google Maps with coordinates
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (!mounted) {
    return (
      <div
        style={{
          height: 300,
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
        }}
      >
        <Text type="secondary">Loading map...</Text>
      </div>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div style={{ height: 300, borderRadius: 8, overflow: 'hidden', border: '1px solid #d9d9d9' }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            {(companyName || address) && (
              <Popup>
                {companyName && <strong>{companyName}</strong>}
                {companyName && address && <br />}
                {address && <span>{address}</span>}
              </Popup>
            )}
          </Marker>
        </MapContainer>
      </div>
      
      <Button
        type="primary"
        icon={<EnvironmentOutlined />}
        onClick={handleOpenInGoogleMaps}
        block
      >
        {t('openInGoogleMaps')}
      </Button>
    </Space>
  );
}
