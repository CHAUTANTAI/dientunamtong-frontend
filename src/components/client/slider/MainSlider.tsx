'use client';

import { useMemo } from 'react';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

export interface SliderItem {
  id: string | number;
  url: string;
  alt: string;
  link: string;
}

import { useTranslations } from 'next-intl';

interface MainSliderProps {
  slides: SliderItem[];
  height?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

interface MainSliderProps {
  slides: SliderItem[];
  height?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

const CustomArrow = ({ direction, onClick }: { direction: 'left' | 'right'; onClick?: () => void }) => (
  <div
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '50%',
      [direction]: '20px',
      transform: 'translateY(-50%)',
      zIndex: 10,
      cursor: 'pointer',
      backgroundColor: 'rgba(0,0,0,0.5)',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.8)';
      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)';
      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
    }}
  >
    {direction === 'left' ? (
      <LeftOutlined style={{ color: '#fff', fontSize: 16 }} />
    ) : (
      <RightOutlined style={{ color: '#fff', fontSize: 16 }} />
    )}
  </div>
);

export default function MainSlider({
  slides,
  height = 300,
  autoplay = true,
  autoplaySpeed = 5000,
}: MainSliderProps) {
  const t = useTranslations('common');
  // Transform slides to include signed URLs
  const processedSlides = useMemo(() => {
    return slides.map(slide => ({
      ...slide,
      signedUrl: slide.url, // Will be converted by SlideImage component
    }));
  }, [slides]);

  if (!processedSlides || processedSlides.length === 0) {
    return (
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          height,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#999' }}>No slides available</span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Carousel
        autoplay={autoplay}
        autoplaySpeed={autoplaySpeed}
        arrows
        prevArrow={<CustomArrow direction="left" />}
        nextArrow={<CustomArrow direction="right" />}
        dotPosition="bottom"
        style={{ height }}
      >
        {processedSlides.map((slide) => (
          <SlideImage key={slide.id} slide={slide} height={height} />
        ))}
      </Carousel>

      {/* Custom Carousel Dots Styling */}
      <style jsx global>{`
        .ant-carousel .slick-dots li button {
          background: rgba(255, 255, 255, 0.5) !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
        }
        
        .ant-carousel .slick-dots li.slick-active button {
          background: #fff !important;
          width: 24px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
}
/**
 * SlideImage Component - Display individual slide with signed URL
 */
interface SlideImageProps {
  slide: SliderItem & { signedUrl: string };
  height: number;
}

function SlideImage({ slide, height }: SlideImageProps) {
  const t = useTranslations('common');
  const signedUrl = useSignedImageUrl(slide.url);

  return (
    <Link href={slide.link} style={{ textDecoration: 'none' }}>
      <div
        style={{
          width: '100%',
          height,
          position: 'relative',
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {signedUrl ? (
          <Image
            src={signedUrl}
            alt={slide.alt || 'Slide'}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1000px"
            priority
          />
        ) : (
          <div
            style={{
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 18 }}>{t('loading')}</span>
          </div>
        )}
      </div>
    </Link>
  );
}