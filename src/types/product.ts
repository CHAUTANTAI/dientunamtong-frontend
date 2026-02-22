/**
 * Product (table: product)
 */

import { Media } from './media';
import { Category } from './category';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  price?: number | string | null;
  short_description?: string | null;
  description?: string | null;
  specifications?: Record<string, string> | null;
  tags?: string[] | null;
  view_count?: number;
  is_active?: boolean;
  in_stock?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  media?: Media[];
  categories?: Category[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order?: number;
  created_at?: string;
}

export interface ProductWithImages extends Product {
  images?: ProductImage[];
}

// DTOs for API requests
export interface CreateProductDto {
  name: string;
  slug?: string;
  sku?: string;
  price?: number | null;
  short_description?: string | null;
  description?: string | null;
  specifications?: Record<string, string>;
  tags?: string[];
  is_active?: boolean;
  in_stock?: boolean;
  category_ids?: string[];
}

export interface UpdateProductDto {
  name?: string;
  slug?: string;
  sku?: string;
  price?: number | null;
  short_description?: string | null;
  description?: string | null;
  specifications?: Record<string, string>;
  tags?: string[];
  is_active?: boolean;
  in_stock?: boolean;
}

export interface ProductFilterParams {
  category_id?: string;
  category_ids?: string[];
  searchKey?: string;
  is_active?: boolean;
  in_stock?: boolean;
  min_price?: number;
  max_price?: number;
  tags?: string[];
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
  include_descendants?: boolean;
}
