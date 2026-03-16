// Page Section Types

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
export interface BannerHeaderContent {
  logo_media_id?: string;          // Company logo
  banner_media_id?: string;        // Banner image
  primary_hotline?: string;        // Main phone number
  secondary_hotline?: string;      // Secondary phone number
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

// LeftSidebar Section (Categories tree - mostly auto from DB)
export interface LeftSidebarContent {
  category_ids?: string[];         // Optional: manually select categories to show
  max_items?: number;              // Max categories to display
  show_all?: boolean;              // Show all categories from DB
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
  title?: string;
  show_icon?: boolean;
  limit?: number;
  keywords: Array<{
    id: string;
    text: string;
    link: string;
    sort_order: number;
  }>;
}

// Products Section (replaces HighlightProducts for main content area)
export interface ProductsSectionContent {
  title: string;
  limit: number;
  mode: 'auto' | 'manual';  // auto: fetch latest/popular, manual: select specific products
  filter_by?: 'latest' | 'most_viewed' | 'popular' | 'random';
  product_ids?: string[];  // Used when mode = 'manual'
  category_filter?: string;  // Optional: filter by category_id
  show_price?: boolean;
  layout?: 'grid';  // Future: can add 'list', 'carousel'
}

// News Section
export interface NewsSectionContent {
  title: string;
  limit: number;
  mode: 'auto' | 'manual';
  news_ids?: string[];  // Used when mode = 'manual'
  display_mode?: 'grid' | 'list';
  show_thumbnail?: boolean;
  show_excerpt?: boolean;
}

// Video Section
export interface VideoSectionContent {
  title: string;
  videos: Array<{
    id: string;
    title: string;
    url: string;  // YouTube, Vimeo, or direct video URL
    thumbnail?: string;
    duration?: string;
    sort_order: number;
  }>;
  layout_mode?: 'carousel' | 'grid';
  videos_per_row?: number;
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
  | 'news_section'
  | 'video_section'
  | 'left_sidebar'
  | 'right_sidebar';
