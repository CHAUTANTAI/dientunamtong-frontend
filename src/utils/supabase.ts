/**
 * Supabase Client Utility
 * Initialize Supabase client with service role key for server-side operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
 * Bucket Configuration
 * - 'content': Private bucket (requires signed URLs)
 * - 'public-content': Public bucket (direct public URLs, faster, no auth needed)
 */
export const BUCKET_PRIVATE = 'content';
export const BUCKET_PUBLIC = 'public-content';

/**
 * Get public URL for a file in Supabase Storage (for public buckets)
 * @param imageUrl - Relative path stored in DB (e.g., "product/id_filename.jpg")
 * @param bucketName - Bucket name (default: 'public-content')
 * @returns Public URL string
 */
export const getSupabasePublicUrl = (imageUrl: string, bucketName: string = BUCKET_PUBLIC): string => {
  if (!imageUrl) return '';

  // If imageUrl already includes http/https, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Remove leading slash if present to get clean path
  const path = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;

  // Get public URL from Supabase Storage
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  
  return data?.publicUrl || '';
};

/**
 * Get signed URL for a file in Supabase Storage (for private buckets)
 * @param imageUrl - Relative path stored in DB (e.g., "product/id_filename.jpg")
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @param bucketName - Bucket name (default: 'content' for private)
 * @returns Promise that resolves to signed URL
 */
export const getSupabaseSignedUrl = async (
  imageUrl: string,
  expiresIn: number = 3600,
  bucketName: string = BUCKET_PRIVATE
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
    const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(path, expiresIn);

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
 * Get image URL with caching
 * - For public bucket: Returns public URL directly (no caching needed)
 * - For private bucket: Returns signed URL with caching (refreshes if expired)
 * 
 * @param imageUrl - Relative path stored in DB
 * @param isPublic - Whether to use public bucket (default: true - CHANGED for system-wide migration)
 * @param expiresIn - Expiration time in seconds for signed URLs (default: 3600)
 * @returns Promise that resolves to URL string (public or signed)
 */
export const getSupabaseImageUrl = async (
  imageUrl: string,
  isPublic: boolean = true,
  expiresIn: number = 3600
): Promise<string> => {
  if (!imageUrl) return '';

  // If using public bucket, return public URL directly (no async needed, no caching)
  if (isPublic) {
    return getSupabasePublicUrl(imageUrl, BUCKET_PUBLIC);
  }

  // For private bucket, use signed URL with caching
  const cached = signedUrlCache.get(imageUrl);
  const now = Date.now();

  // Use cached URL if still valid (refresh 5 minutes before expiry)
  if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
    return cached.url;
  }

  // Generate new signed URL
  const signedUrl = await getSupabaseSignedUrl(imageUrl, expiresIn, BUCKET_PRIVATE);

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
 * Sanitize filename to remove invalid characters
 * @param filename - Original filename
 * @returns Sanitized filename safe for storage
 */
const sanitizeFilename = (filename: string): string => {
  // Replace spaces with underscores
  let sanitized = filename.replace(/\s+/g, '_');
  
  // Remove or replace special characters that might cause issues
  // Keep: letters, numbers, dots, hyphens, underscores
  sanitized = sanitized.replace(/[^\w\-._]/g, '');
  
  // Remove consecutive underscores
  sanitized = sanitized.replace(/_+/g, '_');
  
  // Remove leading/trailing underscores
  sanitized = sanitized.replace(/^_+|_+$/g, '');
  
  return sanitized;
};

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
    bucketName?: string; // Default: 'public-content' (public bucket)
  }
): Promise<SupabaseUploadResult> => {
  if (!file) {
    throw new Error('File is required');
  }

  if (!folder) {
    throw new Error('Folder is required');
  }

  const bucketName = options?.bucketName || BUCKET_PUBLIC;

  // Generate file name if not provided, and sanitize it
  const originalFileName = options?.fileName || `${Date.now()}_${file.name}`;
  const sanitizedFileName = sanitizeFilename(originalFileName);
  const filePath = `${folder}/${sanitizedFileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
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
    fullPath: data.fullPath, // Full path with bucket (e.g., "public-content/product/123_image.jpg")
  };
};

/**
 * Upload to private bucket (content) - requires signed URLs
 */
export const uploadToPrivateBucket = async (
  file: File,
  folder: string,
  options?: {
    fileName?: string;
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<SupabaseUploadResult> => {
  return uploadToSupabase(file, folder, { ...options, bucketName: BUCKET_PRIVATE });
};

/**
 * Upload to public bucket (public-content) - direct public URLs
 */
export const uploadToPublicBucket = async (
  file: File,
  folder: string,
  options?: {
    fileName?: string;
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<SupabaseUploadResult> => {
  return uploadToSupabase(file, folder, { ...options, bucketName: BUCKET_PUBLIC });
};

/**
 * Delete file from Supabase Storage
 * @param path - Relative path to delete (e.g., "product/123_image.jpg" or "/product/123_image.jpg")
 * @param bucketName - Bucket name (default: 'public-content')
 * @returns Promise that resolves when deleted
 */
export const deleteFromSupabase = async (path: string, bucketName: string = BUCKET_PUBLIC): Promise<void> => {
  if (!path) {
    throw new Error('Path is required');
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  const { error } = await supabase.storage.from(bucketName).remove([cleanPath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Delete from private bucket
 */
export const deleteFromPrivateBucket = async (path: string): Promise<void> => {
  return deleteFromSupabase(path, BUCKET_PRIVATE);
};

/**
 * Delete from public bucket
 */
export const deleteFromPublicBucket = async (path: string): Promise<void> => {
  return deleteFromSupabase(path, BUCKET_PUBLIC);
};
