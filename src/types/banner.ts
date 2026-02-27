export interface Banner {
  id: string;
  title: string | null;
  media_id: string;
  media: {
    id: string;
    file_url: string;
    file_name: string;
    file_size: number;
    media_type: 'image' | 'video';
  };
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerDto {
  media_id: string;
  title?: string | null;
  link_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateBannerDto {
  media_id?: string;
  title?: string | null;
  link_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}
