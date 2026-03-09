'use client';

import { Carousel, Spin } from 'antd';
import Image from 'next/image';
import { useGetPublicBannersQuery } from '@/store/services/publicBannerApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

const BannerImage = ({ url, alt }: { url: string; alt?: string }) => {
  const signedUrl = useSignedImageUrl(url);

  if (!signedUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '200px',
          position: 'relative',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Spin />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        position: 'relative',
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
      }}
    >
      <Image
        src={signedUrl}
        alt={alt || 'Banner'}
        fill
        style={{ objectFit: 'cover' }}
        priority
        sizes="(max-width: 768px) 100vw, 1000px"
      />
    </div>
  );
};

export default function BannerCarousel({ bannerIds }: { bannerIds?: string[] }) {
  const { data: banners, isLoading } = useGetPublicBannersQuery();

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '200px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  // Filter banners based on bannerIds if provided, otherwise use all active banners
  let activeBanners = banners.filter((banner) => banner.is_active);

  if (bannerIds && bannerIds.length > 0) {
    // Use specified banners in the configured order
    activeBanners = bannerIds
      .map((id) => banners.find((b) => b.id === id))
      .filter(
        (banner): banner is NonNullable<typeof banner> => banner !== undefined && banner.is_active
      );
  } else {
    // Fallback: sort by sort_order
    activeBanners = activeBanners.sort((a, b) => a.sort_order - b.sort_order);
  }

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: 0, borderRadius: 8, overflow: 'hidden' }}>
      <Carousel autoplay autoplaySpeed={3000} dots={{ className: 'banner-dots' }}>
        {activeBanners.map((banner) => (
          <div key={banner.id}>
            {banner.link_url ? (
              <a
                href={banner.link_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block' }}
              >
                <BannerImage
                  url={banner.media?.file_url || ''}
                  alt={banner.media?.alt_text || banner.title || 'Banner'}
                />
              </a>
            ) : (
              <BannerImage
                url={banner.media?.file_url || ''}
                alt={banner.media?.alt_text || banner.title || 'Banner'}
              />
            )}
          </div>
        ))}
      </Carousel>

      <style jsx global>{`
        .banner-dots li button {
          background: rgba(255, 255, 255, 0.5) !important;
          height: 8px;
        }
        .banner-dots li.slick-active button {
          background: #fff !important;
        }

        @media (max-width: 768px) {
          .banner-dots {
            bottom: 8px !important;
          }
          .banner-dots li {
            margin: 0 4px !important;
          }
          .banner-dots li button {
            width: 8px !important;
            height: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
