'use client';

import { useMemo } from 'react';
import type { SliderContent } from '@/types/pageSection';
import MainSlider, { type SliderItem } from './slider/MainSlider';
import MiniAdsColumn, { type MiniAdItem } from './slider/MiniAdsColumn';

/**
 * SliderArea Component - Main carousel + Mini ads
 * Layout: [Main Slider 70%] [Mini Ads 30%]
 * 
 * Receives slider configuration from the `content` prop.
 */
interface SliderAreaProps {
  content?: SliderContent;
}

export default function SliderArea({ content }: SliderAreaProps) {
  // Use content from props
  const sliderContent = content;

  // Default fallback data
  const defaultSlides: SliderItem[] = [
    {
      id: 1,
      url: '/placeholder-slide-1.jpg',
      alt: 'Slide 1',
      link: '#',
    },
    {
      id: 2,
      url: '/placeholder-slide-2.jpg',
      alt: 'Slide 2',
      link: '#',
    },
    {
      id: 3,
      url: '/placeholder-slide-3.jpg',
      alt: 'Slide 3',
      link: '#',
    },
  ];

  const defaultMiniAds: MiniAdItem[] = [
    {
      id: 1,
      url: '/placeholder-ad-1.jpg',
      alt: 'Mini Ad 1',
      link: '#',
    },
    {
      id: 2,
      url: '/placeholder-ad-2.jpg',
      alt: 'Mini Ad 2',
      link: '#',
    },
  ];

  // Transform API data (from props) to component props format with signed URLs
  const apiSlides: SliderItem[] = useMemo(() => {
    if (!sliderContent?.slides?.length) return [];
    return sliderContent.slides.map(slide => {
      // Hook must be outside the map for proper usage
      // We'll handle signed URL in the MainSlider component instead
      return {
        id: slide.id,
        url: slide.media_id, // Pass media_id, MainSlider will convert to signed URL
        alt: slide.alt || '',
        link: slide.link || '#',
      };
    });
  }, [sliderContent?.slides]);

  const apiMiniAds: MiniAdItem[] = useMemo(() => {
    if (!sliderContent?.mini_ads?.length) return [];
    return sliderContent.mini_ads.map(ad => {
      return {
        id: ad.id,
        url: ad.media_id, // Pass media_id, MiniAdsColumn will convert to signed URL
        alt: ad.alt || '',
        link: ad.link || '#',
      };
    });
  }, [sliderContent?.mini_ads]);

  // Use API data (from props) > defaults
  const slides = apiSlides.length > 0 ? apiSlides : defaultSlides;
  const miniAds = apiMiniAds.length > 0 ? apiMiniAds : defaultMiniAds;
  
  const sliderHeight = sliderContent?.slider_settings?.height || 300;
  const miniAdHeight = sliderContent?.mini_ad_settings?.height || 149;
  const autoplay = sliderContent?.slider_settings?.autoplay ?? true;
  const autoplaySpeed = sliderContent?.slider_settings?.autoplay_speed || 5000;

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        padding: '24px 0',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 260px',
          gap: '2px',
        }}
        className="slider-area-grid"
      >
        {/* Main Slider - Left */}
        <MainSlider
          slides={slides}
          height={sliderHeight}
          autoplay={autoplay}
          autoplaySpeed={autoplaySpeed}
        />

        {/* Mini Ads - Right */}
        <MiniAdsColumn
          ads={miniAds}
          height={miniAdHeight}
          gap={2}
        />
      </div>

      {/* Responsive CSS */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .slider-area-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
