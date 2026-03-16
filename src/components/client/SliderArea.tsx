'use client';

import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import type { SliderContent } from '@/types/pageSection';
import MainSlider, { type SliderItem } from './slider/MainSlider';
import MiniAdsColumn, { type MiniAdItem } from './slider/MiniAdsColumn';

/**
 * SliderArea Component - Main carousel + Mini ads
 * Layout: [Main Slider 70%] [Mini Ads 30%]
 * 
 * Fetches slider configuration from page_sections API (slider_section)
 */

interface SliderAreaProps {
  slides?: SliderItem[];
  miniAds?: MiniAdItem[];
  sliderHeight?: number;
  miniAdHeight?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

export default function SliderArea({
  slides: propSlides,
  miniAds: propMiniAds,
  sliderHeight: propSliderHeight,
  miniAdHeight: propMiniAdHeight,
  autoplay: propAutoplay,
  autoplaySpeed: propAutoplaySpeed,
}: SliderAreaProps = {}) {
  // Fetch slider section from API
  const { data: sections } = useGetActivePageSectionsQuery('homepage');
  const sliderSection = sections?.find(s => s.section_identifier === 'slider_section');
  const sliderContent = sliderSection?.content as unknown as SliderContent;

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

  // Transform API data to component props format
  const apiSlides: SliderItem[] = sliderContent?.slides?.map(slide => ({
    id: slide.id,
    url: slide.media_id, // TODO: Transform media_id to actual URL
    alt: slide.alt || '',
    link: slide.link || '#',
  })) || [];

  const apiMiniAds: MiniAdItem[] = sliderContent?.mini_ads?.map(ad => ({
    id: ad.id,
    url: ad.media_id, // TODO: Transform media_id to actual URL
    alt: ad.alt || '',
    link: ad.link || '#',
  })) || [];

  // Use props > API > defaults
  const slides = propSlides || (apiSlides.length > 0 ? apiSlides : defaultSlides);
  const miniAds = propMiniAds || (apiMiniAds.length > 0 ? apiMiniAds : defaultMiniAds);
  
  const sliderHeight = propSliderHeight || sliderContent?.slider_settings?.height || 300;
  const miniAdHeight = propMiniAdHeight || sliderContent?.mini_ad_settings?.height || 149;
  const autoplay = propAutoplay ?? sliderContent?.slider_settings?.autoplay ?? true;
  const autoplaySpeed = propAutoplaySpeed || sliderContent?.slider_settings?.autoplay_speed || 5000;

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
