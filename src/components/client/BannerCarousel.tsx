'use client';

import { Carousel, Spin, Empty } from 'antd';
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
          height: '400px',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '400px',
        position: 'relative',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Image
        src={signedUrl}
        alt={alt || 'Banner'}
        fill
        style={{ objectFit: 'cover' }}
        priority
      />
    </div>
  );
};

export default function BannerCarousel() {
  const { data: banners, isLoading } = useGetPublicBannersQuery();

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  // Filter active banners and sort by sort_order
  const activeBanners = banners
    .filter((banner) => banner.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <Carousel autoplay autoplaySpeed={5000} style={{ marginBottom: 48 }}>
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
  );
}
