// Pending banner for upload (before Save All Changes)
export interface PendingBanner {
  id: string; // Temporary ID (UUID)
  file: File;
  previewUrl: string; // blob:// URL from URL.createObjectURL
  title?: string;
  link_url?: string;
  sort_order: number;
}

// Media response from API (after upload)
export interface BannerMedia {
  id: string;
  file_name: string;
  file_url: string;
  media_type: string;
  mime_type: string;
  file_size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
