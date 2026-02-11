/**
 * Category (table: category)
 * Tree structure with closure-table pattern
 */

import { Media } from './media';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  media_id?: string | null;
  sort_order: number;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations (populated when requested)
  parent?: Category | null;
  children?: Category[];
  media?: Media | null;
}

export interface ProductCategory {
  product_id: string;
  category_id: string;
}

// DTOs for API requests
export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string | null;
  parent_id?: string | null;
  media_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string | null;
  parent_id?: string | null;
  media_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

// Tree-specific types
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
  level: number;
}
