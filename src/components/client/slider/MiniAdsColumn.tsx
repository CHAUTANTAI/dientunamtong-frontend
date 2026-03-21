'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

export interface MiniAdItem {
  id: string | number;
  url: string;
  alt: string;
  link: string;
}

import { useTranslations } from 'next-intl';

interface MiniAdsColumnProps {
  ads: MiniAdItem[];
  height?: number;
  gap?: number;
}

interface MiniAdsColumnProps {
  ads: MiniAdItem[];
  height?: number;
  gap?: number;
}

export default function MiniAdsColumn({
  ads,
  height = 149,
  gap = 2,
}: MiniAdsColumnProps) {
  const t = useTranslations('common');
  // Memoize processed ads
  const processedAds = useMemo(() => {
    return ads.map(ad => ({
      ...ad,
      signedUrl: ad.url, // Will be converted by MiniAdItem component
    }));
  }, [ads]);

  if (!processedAds || processedAds.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${gap}px`,
          height: '100%',
        }}
      >
        <div
          style={{
            width: '100%',
            height: height,
            borderRadius: 8,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#999' }}>No ads</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`,
      }}
    >
      {processedAds.map((ad, index) => (
        <MiniAdItem key={ad.id} ad={ad} height={height} index={index} />
      ))}
    </div>
  );
}

/**
 * MiniAdItem Component - Display individual mini ad with signed URL
 */
interface MiniAdItemProps {
  ad: MiniAdItem & { signedUrl: string };
  height: number;
  index: number;
}

function MiniAdItem({ ad, height, index }: MiniAdItemProps) {
  const t = useTranslations('common');
  const signedUrl = useSignedImageUrl(ad.url);

  return (
    <Link href={ad.link} style={{ textDecoration: 'none' }}>
      <div
        style={{
          width: '100%',
          height,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          backgroundColor: '#e0e0e0',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        {signedUrl ? (
          <Image
            src={signedUrl}
            alt={ad.alt || 'Mini Ad'}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 100vw, 300px"
            priority
          />
        ) : (
          <div
            style={{
              background: `linear-gradient(135deg, ${
                index === 0 ? '#f093fb 0%, #f5576c 100%' : '#4facfe 0%, #00f2fe 100%'
              })`,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 12 }}>{t('loading')}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
