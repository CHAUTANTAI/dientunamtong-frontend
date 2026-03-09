// Page Section Types

export interface PageSection {
  id: string;
  page_identifier: string;
  section_identifier: string;
  content: Record<string, any>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Content types for each section
export interface IntroContent {
  title?: string;
  subtitle?: string;
  text: string;
}

export interface BannerContent {
  banner_ids: string[];
  auto_play?: boolean;
  interval?: number;
  show_arrows?: boolean;
  show_dots?: boolean;
}

export interface HighlightCategoriesContent {
  title: string;
  limit: number;
  mode: 'auto' | 'manual';
  category_ids?: string[];
  layout?: 'grid' | 'carousel';
  show_description?: boolean;
}

export interface HighlightProductsContent {
  title: string;
  limit: number;
  mode: 'auto' | 'manual';
  filter_by?: 'latest' | 'most_viewed' | 'random';
  product_ids?: string[];
  layout?: 'grid' | 'carousel';
  show_price?: boolean;
}

// Update section request
export interface UpdateSectionRequest {
  sectionIdentifier: string;
  content: Record<string, any>;
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
  | 'intro'
  | 'banner'
  | 'highlight_categories'
  | 'highlight_products';
