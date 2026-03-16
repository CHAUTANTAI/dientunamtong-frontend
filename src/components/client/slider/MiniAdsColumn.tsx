'use client';

import Link from 'next/link';

export interface MiniAdItem {
  id: string | number;
  url: string;
  alt: string;
  link: string;
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
  if (!ads || ads.length === 0) {
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
      {ads.map((ad, index) => (
        <Link key={ad.id} href={ad.link}>
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
            {/* TODO: Replace placeholder with actual Image component when connected to API */}
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${
                  index === 0 ? '#f093fb 0%, #f5576c 100%' : '#4facfe 0%, #00f2fe 100%'
                })`,
              }}
            >
              <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                {ad.alt}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
