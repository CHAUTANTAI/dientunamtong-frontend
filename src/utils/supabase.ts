/**
 * Supabase Client Utility
 * Initialize Supabase client with service role key for server-side operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error('Error creating signed URL:', error);
      return '';
    }

    return data?.signedUrl || '';
  } catch (error) {
    // eslint-disable-next-line no-console
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
