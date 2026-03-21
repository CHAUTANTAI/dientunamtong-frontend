'use client';

import { List, Typography, Spin, Empty } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import type { RightSidebarContent } from '@/types/pageSection';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const { Text, Title } = Typography;

/**
 * RightSidebar Component - News list + promotional banners
 * Fetches news_items and promotional_banners from API via props
 */
export default function RightSidebar({ content }: { content?: RightSidebarContent }) {
  const t = useTranslations('homepage.rightSidebar');
  const isLoading = false;
  
  // Use content from props, fallback to empty arrays
  const newsItems = content?.news_items || [];
  const banners = content?.promotional_banners || [];

  if (!newsItems.length && !banners.length) {
    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <Empty description={t('empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#001529',
          padding: '12px 16px',
          borderBottom: '2px solid #ff4d4f',
        }}
      >
        <Title
          level={5}
          style={{
            margin: 0,
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {t('title')}
        </Title>
      </div>

      {/* News List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : newsItems.length > 0 ? (
        <List
          dataSource={newsItems}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 16px',
                border: 'none',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Link
                href={item.link || '#'}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  width: '100%',
                }}
              >
                <RightOutlined
                  style={{
                    fontSize: 10,
                    color: '#ff4d4f',
                    marginTop: '4px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#595959',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </Text>
                  {item.date && (
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: '4px' }}>
                      {new Date(item.date).toLocaleDateString('vi-VN')}
                    </Text>
                  )}
                </div>
              </Link>
            </List.Item>
          )}
        />
      ) : null}

      {/* Promotional Banners */}
      {banners && banners.length > 0 && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#fafafa',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {banners.slice(0, 3).map((banner) => (
            <BannerItem key={banner.id} banner={banner} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * BannerItem - Single promotional banner image
 */
interface BannerItemProps {
  banner: {
    id: string;
    media_id: string;
    link?: string;
    alt?: string;
    sort_order: number;
  };
}

function BannerItem({ banner }: BannerItemProps) {
  const t = useTranslations('homepage.rightSidebar');
  const signedUrl = useSignedImageUrl(banner.media_id);

  const content = (
    <div
      style={{
        width: '100%',
        height: '100px',
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {signedUrl ? (
        <Image
          src={signedUrl}
          alt={banner.alt || t('bannerAlt')}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
        />
      ) : (
        <Text type="secondary">{t('loading')}</Text>
      )}
    </div>
  );

  if (banner.link) {
    return (
      <Link href={banner.link} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
}
