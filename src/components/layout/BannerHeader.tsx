'use client';

import { Space, Typography } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

const { Text } = Typography;

/**
 * BannerHeader Component - Header với logo, banner, hotline
 * Layout: [Logo 110x110] [Banner Image Large] [Hotline]
 * 
 * TODO: Kết nối API để lấy:
 * - Logo từ system_info.company_logo
 * - Banner từ page_sections hoặc media
 * - Hotline từ system_info.phone
 */
export default function BannerHeader() {
  const { data: systemInfo } = useGetSystemInfoQuery();
  const logoUrl = useSignedImageUrl(systemInfo?.company_logo || '');

  // TODO: Replace with API data - Get banner from page_sections or media
  const bannerImageUrl = '/placeholder-banner.png'; // TODO: Get from API
  
  // TODO: Replace with API data - Get from system_info
  const hotlines = [
    systemInfo?.phone || '(0286) 271 3025',
    '0909 60 30 25', // TODO: Add secondary phone to system_info
  ];

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderBottom: '2px solid #f0f0f0',
        padding: '16px 0',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '120px 1fr 200px',
          gap: '24px',
          alignItems: 'center',
        }}
        className="banner-header-grid"
      >
        {/* Logo - Left */}
        <Link href={ROUTES.HOME}>
          <div
            style={{
              width: '110px',
              height: '110px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={systemInfo?.company_name || 'Logo'}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#bfbfbf' }}>Logo</Text>
              </div>
            )}
          </div>
        </Link>

        {/* Banner - Center */}
        <Link href={ROUTES.HOME}>
          <div
            style={{
              width: '100%',
              height: '110px',
              position: 'relative',
              cursor: 'pointer',
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
              transition: 'transform 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* TODO: Replace with actual banner image from API */}
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <Text strong style={{ color: '#fff', fontSize: 24 }}>
                {systemInfo?.company_name || 'COMPANY BANNER'}
              </Text>
            </div>
          </div>
        </Link>

        {/* Hotline - Right */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          {hotlines.map((hotline, index) => (
            <a
              key={index}
              href={`tel:${hotline.replace(/\s/g, '')}`}
              style={{ textDecoration: 'none' }}
            >
              <Space
                size="small"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#fff5f5',
                  border: '1px solid #ffccc7',
                  borderRadius: 6,
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff1f0';
                  e.currentTarget.style.borderColor = '#ff4d4f';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,77,79,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff5f5';
                  e.currentTarget.style.borderColor = '#ffccc7';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <PhoneOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                <Text strong style={{ color: '#ff4d4f', fontSize: 14 }}>
                  {hotline}
                </Text>
              </Space>
            </a>
          ))}
        </div>
      </div>

      {/* Responsive CSS */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .banner-header-grid {
            grid-template-columns: 80px 1fr !important;
            gap: 12px !important;
          }
          .banner-header-grid > div:last-child {
            grid-column: 1 / -1;
            align-items: center !important;
            flex-direction: row !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
