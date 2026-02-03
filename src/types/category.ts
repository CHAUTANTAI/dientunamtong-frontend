/**
 * Category (table: category)
 */

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  product_id: string;
  category_id: string;
}
