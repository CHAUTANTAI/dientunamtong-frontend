/**
 * Product (table: product)
 */

export interface Product {
  id: string;
  name: string;
  price?: number | string | null; // DB numeric — handle as number or string depending on API
  short_description?: string | null;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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
