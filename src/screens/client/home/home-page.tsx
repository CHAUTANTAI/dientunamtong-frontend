'use client';

import { Spin } from 'antd';
import BannerCarousel from '@/components/client/BannerCarousel';
import IntroSection from '@/components/client/IntroSection';
import HighlightCategories from '@/components/client/HighlightCategories';
import HighlightProducts from '@/components/client/HighlightProducts';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import type { IntroContent, BannerContent } from '@/types/pageSection';

export default function HomePage() {
  const { data: sections, isLoading, error } = useGetActivePageSectionsQuery('homepage');

  // Extract section data (even if still loading or error)
  const introSection = sections?.find(s => s.section_identifier === 'intro');
  const bannerSection = sections?.find(s => s.section_identifier === 'banner');

  const introContent = introSection?.content as IntroContent;
  const bannerContent = bannerSection?.content as BannerContent;

  return (
    <div>
      {/* Banner - always shown, uses banner_ids from config or falls back to all banners */}
      <BannerCarousel bannerIds={bannerContent?.banner_ids} />
      
      {/* Intro Section - conditionally shown */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="Loading content..." />
        </div>
      )}
      
      {!isLoading && introContent && <IntroSection content={introContent} />}
      
      {/* Highlight sections - always shown */}
      <HighlightCategories />
      <HighlightProducts />
    </div>
  );
}
