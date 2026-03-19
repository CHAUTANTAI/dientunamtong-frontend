
import { useMemo } from 'react';
import { useGetPageSectionsQuery } from '@/store/api/pageSectionApi';
import {
  PageSection,
  BannerHeaderContent,
  MegaMenuContent,
  SearchSloganContent,
  SliderContent,
  TrendingKeywordsContent,
  ProductsSectionContent,
  LeftSidebarContent,
  RightSidebarContent,
} from '@/types/pageSection';

// Helper to find a section and return its content, with a default value
function findSectionContent<T>(sections: PageSection[] | undefined, identifier: string, defaultContent: T): T {
  const section = sections?.find(s => s.section_identifier === identifier);
  // Return section content if it exists, otherwise return the default
  return section?.content as T ?? defaultContent;
}

export function usePageSections(pageIdentifier: 'homepage' = 'homepage') {
  const { data: sections, isLoading, isError, isFetching } = useGetPageSectionsQuery(pageIdentifier);

  const memoizedSections = useMemo(() => {
    const bannerHeader = findSectionContent<BannerHeaderContent>(sections, 'banner_header', {
      logo_media_id: undefined,
      banner_media_id: undefined,
      primary_hotline: undefined,
      secondary_hotline: undefined,
    });

    const megaMenu = findSectionContent<MegaMenuContent>(sections, 'mega_menu', {
      static_items: [],
    });

    const searchSlogan = findSectionContent<SearchSloganContent>(sections, 'search_slogan', {
      slogan_text: '',
    });

    const slider = findSectionContent<SliderContent>(sections, 'slider_section', {
      slides: [],
      mini_ads: [],
      slider_settings: {},
      mini_ad_settings: {},
    });

    const trendingKeywords = findSectionContent<TrendingKeywordsContent>(sections, 'trending_keywords_section', {
      mode: 'manual',
      keywords: [],
    });

    const productsSection = findSectionContent<ProductsSectionContent>(sections, 'products_section', {
      categories: [],
    });

    const leftSidebar = findSectionContent<LeftSidebarContent>(sections, 'left_sidebar', {
      mode: 'auto',
      max_items: 8,
    });

    const rightSidebar = findSectionContent<RightSidebarContent>(sections, 'right_sidebar', {
      news_items: [],
      promotional_banners: [],
    });

    return {
      bannerHeader,
      megaMenu,
      searchSlogan,
      slider,
      trendingKeywords,
      productsSection,
      leftSidebar,
      rightSidebar,
    };
  }, [sections]);

  return {
    ...memoizedSections,
    isLoading,
    isError,
    isFetching,
    // Provide the raw sections array if needed
    rawSections: sections,
  };
}
