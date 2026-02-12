/**
 * Supabase Client Utility
 * Initialize Supabase client with service role key for server-side operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
   
  console.warn('Supabase URL or Service Role Key is missing');
}

/**
 * Create Supabase client with service role key
 * This allows direct uploads without RLS policies
 */
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Get signed URL for a file in Supabase Storage (for private buckets)
 * @param imageUrl - Relative path stored in DB (e.g., "/product/id_filename.jpg")
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise that resolves to signed URL
 */
export const getSupabaseSignedUrl = async (
  imageUrl: string,
  expiresIn: number = 3600,
): Promise<string> => {
  if (!imageUrl) return '';
  
  // If imageUrl already includes http/https, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Remove leading slash if present to get clean path
  const path = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  
  try {
    // Create signed URL for private bucket
    const { data, error } = await supabase.storage
      .from('content')
      .createSignedUrl(path, expiresIn);

    if (error) {
       
      console.error('Error creating signed URL:', error);
      return '';
    }

    return data?.signedUrl || '';
  } catch (error) {
     
    console.error('Error creating signed URL:', error);
    return '';
  }
};

/**
 * Cache for signed URLs to avoid regenerating them too frequently
 */
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Get signed URL with caching (refreshes if expired or about to expire)
 * @param imageUrl - Relative path stored in DB
 * @param expiresIn - Expiration time in seconds (default: 3600)
 * @returns Promise that resolves to signed URL
 */
export const getSupabaseImageUrl = async (
  imageUrl: string,
  expiresIn: number = 3600,
): Promise<string> => {
  if (!imageUrl) return '';

  // Check cache first
  const cached = signedUrlCache.get(imageUrl);
  const now = Date.now();
  
  // Use cached URL if still valid (refresh 5 minutes before expiry)
  if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
    return cached.url;
  }

  // Generate new signed URL
  const signedUrl = await getSupabaseSignedUrl(imageUrl, expiresIn);
  
  if (signedUrl) {
    // Cache the URL
    signedUrlCache.set(imageUrl, {
      url: signedUrl,
      expiresAt: now + expiresIn * 1000,
    });
  }

  return signedUrl;
};

/**
 * Upload result interface
 */
export interface SupabaseUploadResult {
  path: string;
  fullPath: string;
}

/**
 * Upload file to Supabase Storage
 * @param file - File to upload
 * @param folder - Folder name (e.g., 'product', 'category', 'profile')
 * @param options - Upload options
 * @returns Promise that resolves to relative path
 */
export const uploadToSupabase = async (
  file: File,
  folder: string,
  options?: {
    fileName?: string;
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<SupabaseUploadResult> => {
  if (!file) {
    throw new Error('File is required');
  }

  if (!folder) {
    throw new Error('Folder is required');
  }

  // Generate file name if not provided
  const fileName = options?.fileName || `${Date.now()}_${file.name}`;
  const filePath = `${folder}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('content')
    .upload(filePath, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  if (!data) {
    throw new Error('Upload failed: No data returned');
  }

  return {
    path: data.path, // Relative path (e.g., "product/123_image.jpg")
    fullPath: data.fullPath, // Full path with bucket (e.g., "content/product/123_image.jpg")
  };
};

/**
 * Delete file from Supabase Storage
 * @param path - Relative path to delete (e.g., "product/123_image.jpg" or "/product/123_image.jpg")
 * @returns Promise that resolves when deleted
 */
export const deleteFromSupabase = async (path: string): Promise<void> => {
  if (!path) {
    throw new Error('Path is required');
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  const { error } = await supabase.storage
    .from('content')
    .remove([cleanPath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};
