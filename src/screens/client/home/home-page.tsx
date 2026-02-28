'use client';

import BannerCarousel from '@/components/client/BannerCarousel';
import HighlightCategories from '@/components/client/HighlightCategories';
import HighlightProducts from '@/components/client/HighlightProducts';

export default function HomePage() {
  return (
    <div>
      <BannerCarousel />
      <HighlightCategories />
      <HighlightProducts />
    </div>
  );
}
