// Page Section Types

import type { MediaValue } from '@/components/common/MediaUpload';

export interface PageSection {
  id: string;
  page_identifier: string;
  section_identifier: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// LAYOUT COMPONENT SECTIONS (ClientLayout)
// ============================================

// BannerHeader Section (Logo + Banner Image + Hotlines)
// Client version - from API, already processed
export interface BannerHeaderContent {
  logo_media_id?: string;          // Company logo (media path from API)
  banner_media_id?: string;        // Banner image (media path from API)
  primary_hotline?: string;        // Main phone number
  secondary_hotline?: string;      // Secondary phone number
}

// Admin version - includes unsaved pending uploads
export interface BannerHeaderContentDraft extends Omit<BannerHeaderContent, 'logo_media_id' | 'banner_media_id'> {
  logo_media_id?: MediaValue;      // Can be string path or PendingUpload object
  banner_media_id?: MediaValue;    // Can be string path or PendingUpload object
}

// MegaMenu Section (Static menu items like "Bảng giá", "Tem xe", "Video")
export interface MegaMenuContent {
  static_items: Array<{
    id: string;
    label: string;
    href: string;
    sort_order: number;
  }>;
}

// SearchSlogan Section (Marquee slogan text)
export interface SearchSloganContent {
  slogan_text: string;             // Marquee text
}

// ============================================
// HOMEPAGE CONTENT SECTIONS
// ============================================

// LeftSidebar Section (Categories tree)
export interface LeftSidebarContent {
  mode: 'auto' | 'manual';             // auto: top 8 by views, manual: select specific categories
  category_ids?: string[];             // For manual mode (max 8 categories)
  max_items?: number;                  // Max categories to display (default 8)
}

// RightSidebar Section (News items + promotional banners)
export interface RightSidebarContent {
  news_items: Array<{
    id: string;
    title: string;
    link: string;
    date?: string;
    sort_order: number;
  }>;
  promotional_banners?: Array<{
    id: string;
    media_id: string;
    link?: string;
    alt?: string;
    sort_order: number;
  }>;
}

// Slider Section (Main Carousel + Mini Ads)
export interface SliderContent {
  slides: Array<{
    id: string;
    media_id: string;  // Reference to media table
    link?: string;
    alt?: string;
    sort_order: number;
  }>;
  mini_ads: Array<{
    id: string;
    media_id: string;  // Reference to media table
    link?: string;
    alt?: string;
    sort_order: number;
  }>;
  slider_settings?: {
    height?: number;
    autoplay?: boolean;
    autoplay_speed?: number;
  };
  mini_ad_settings?: {
    height?: number;
    gap?: number;
  };
}

// Trending Keywords Section
export interface TrendingKeywordsContent {
  mode: 'auto' | 'manual';  // auto: top 5 categories + top 5 products by views, manual: select specific items
  keywords: Array<{
    id: string;
    text: string;
    link: string;
    source: 'category' | 'product';  // Identify source type
    source_id: string;  // Category ID or Product ID
    sort_order: number;
  }>;
}

// Products Section
export interface ProductsSectionContent {
  categories?: Array<{
    category_id: string;
    mode: 'auto' | 'manual';
    product_ids?: string[]; // For manual mode (max 6 products)
  }>;  // Max 3 categories
}

// Update section request
export interface UpdateSectionRequest {
  sectionIdentifier: string;
  content: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePageSectionsRequest {
  sections: UpdateSectionRequest[];
}

// Page identifiers
export type PageIdentifier = 'homepage' | 'about' | 'contact';

// Section identifiers  
export type SectionIdentifier = 
  // Layout sections (from ClientLayout)
  | 'banner_header'
  | 'mega_menu'
  | 'search_slogan'
  | 'slider_section'
  
  // HomePage content sections
  | 'trending_keywords_section'
  | 'products_section'
  | 'left_sidebar'
  | 'right_sidebar';
