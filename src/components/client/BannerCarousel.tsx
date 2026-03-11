'use client';

import { Carousel, Spin } from 'antd';
import Image from 'next/image';
import { useGetPublicMediaQuery } from '@/store/services/publicMediaApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import type { Media } from '@/types/media';

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

export default function BannerCarousel({ mediaIds }: { mediaIds?: string[] }) {
  // MUST call hooks before any conditional returns (Rules of Hooks)
  const shouldFetch = mediaIds && mediaIds.length > 0;
  const { data: mediaList, isLoading } = useGetPublicMediaQuery(
    shouldFetch ? { ids: mediaIds } : undefined,
    { skip: !shouldFetch } // Skip query if no IDs
  );

  // Early return AFTER hooks
  if (!shouldFetch) {
    return null;
  }

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

  if (!mediaList || mediaList.length === 0) {
    return null;
  }

  // Preserve order from mediaIds and filter active media
  const activeMedia = mediaIds
    .map(id => mediaList.find((m: Media) => m.id === id))
    .filter((media): media is Media => media !== undefined && media.is_active);

  if (activeMedia.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: 0, borderRadius: 8, overflow: 'hidden' }}>
      <Carousel autoplay autoplaySpeed={3000} dots={{ className: 'banner-dots' }}>
        {activeMedia.map((media) => (
          <div key={media.id}>
            <BannerImage
              url={media.file_url}
              alt={media.alt_text || 'Banner'}
            />
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
