/**
 * Media (table: media)
 * Multi-media storage with Supabase
 */

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

export interface Media {
  id: string;
  file_name: string;
  file_url: string;
  media_type: MediaType;
  mime_type?: string | null;
  file_size?: number | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  description?: string | null;
  sort_order: number;
  product_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// DTOs for API requests
export interface CreateMediaDto {
  file_name?: string;
  file_url: string;
  media_type?: MediaType;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  alt_text?: string;
  description?: string;
  sort_order?: number;
  product_id?: string;
  is_active?: boolean;
}

export interface UpdateMediaDto {
  file_name?: string;
  file_url?: string;
  media_type?: MediaType;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  alt_text?: string;
  description?: string;
  sort_order?: number;
  product_id?: string;
  is_active?: boolean;
}

// Upload response from Supabase
export interface SupabaseUploadResponse {
  path: string;
  id: string;
  fullPath: string;
}

