'use client';

import { Space, Typography, Skeleton } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { isValidNextImageSrc } from '@/utils/objectStorage';
import type { BannerHeaderContent } from '@/types/pageSection';

const { Text } = Typography;

/**
 * BannerHeader Component - Header with logo, banner, hotline
 * Layout: [Logo 110x110] [Banner Image Large] [Hotline]
 * 
 * Config from the `content` prop.
 */
interface BannerHeaderProps {
  content?: BannerHeaderContent;
}

export default function BannerHeader({ content }: BannerHeaderProps) {
  const { data: systemInfo, isLoading: systemInfoLoading } = useGetSystemInfoQuery();
  
  // Get banner header config from props
  const config = content;

  // Fallback chain: API config (from prop) > system_info
  const logoMediaId = config?.logo_media_id || systemInfo?.company_logo || '';
  const bannerMediaId = config?.banner_media_id || '';
  const primaryHotline = config?.primary_hotline || systemInfo?.phone || '';
  const secondaryHotline = config?.secondary_hotline || '';
  
  const logoUrl = useSignedImageUrl(logoMediaId);
  const bannerUrl = useSignedImageUrl(bannerMediaId);

  const hotlines = [primaryHotline, secondaryHotline].filter(Boolean);

  const logoSrcOk = Boolean(logoUrl && isValidNextImageSrc(logoUrl));
  const bannerSrcOk = Boolean(bannerUrl && isValidNextImageSrc(bannerUrl));

  // Skeleton only while system info is loading (avoid stuck state when R2 URL is missing)
  const isLoading = systemInfoLoading;

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
            {isLoading ? (
              <Skeleton.Avatar active size={110} shape="square" />
            ) : logoSrcOk ? (
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
            {isLoading ? (
              <Skeleton.Image active style={{ width: '100%', height: '110px' }} />
            ) : bannerSrcOk ? (
              <Image
                src={bannerUrl}
                alt="Banner"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
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
            )}
          </div>
        </Link>

        {/* Hotline - Right */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          {isLoading ? (
            <>
              <Skeleton.Button active size="large" style={{ width: 180 }} />
              <Skeleton.Button active size="large" style={{ width: 180 }} />
            </>
          ) : (
            hotlines.map((hotline, index) => (
            <a
              key={index}
              href={`tel:${hotline.replace(/\s/g, '')}`}
              style={{ textDecoration: 'none' }}
            >
              <Space
                size="middle"
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#fff5f5',
                  border: '2px solid #ff4d4f',
                  borderRadius: 8,
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255,77,79,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff4d4f';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,77,79,0.4)';
                  const icon = e.currentTarget.querySelector('.phone-icon');
                  const text = e.currentTarget.querySelector('.phone-text');
                  if (icon) (icon as HTMLElement).style.color = '#fff';
                  if (text) (text as HTMLElement).style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff5f5';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,77,79,0.2)';
                  const icon = e.currentTarget.querySelector('.phone-icon');
                  const text = e.currentTarget.querySelector('.phone-text');
                  if (icon) (icon as HTMLElement).style.color = '#ff4d4f';
                  if (text) (text as HTMLElement).style.color = '#ff4d4f';
                }}
              >
                <PhoneOutlined 
                  className="phone-icon"
                  style={{ 
                    color: '#ff4d4f', 
                    fontSize: 24,
                    transition: 'color 0.3s'
                  }} 
                />
                <Text 
                  className="phone-text"
                  strong 
                  style={{ 
                    color: '#ff4d4f', 
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    transition: 'color 0.3s'
                  }}
                >
                  {hotline}
                </Text>
              </Space>
            </a>
          ))
          )}
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
