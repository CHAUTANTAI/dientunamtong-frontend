/**
 * Hook to get image URL from Supabase Storage
 * Supports both public and private buckets
 */

import { useState, useEffect } from 'react';
import { getSupabaseImageUrl, getSupabasePublicUrl } from '@/utils/supabase';

/**
 * Hook to get URL for an image (public or signed)
 * @param imageUrl - Relative path stored in DB
 * @param isPublic - Whether image is in public bucket (default: true for performance)
 * @returns URL string (empty string while loading for private buckets)
 */
export const useImageUrl = (imageUrl: string | null | undefined, isPublic: boolean = true): string => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const fetchUrl = async () => {
      if (!imageUrl) {
        setUrl('');
        return;
      }

      // For public bucket, get URL synchronously (no loading state)
      if (isPublic) {
        const publicUrl = getSupabasePublicUrl(imageUrl);
        if (!cancelled) {
          setUrl(publicUrl);
        }
        return;
      }

      // For private bucket, fetch signed URL asynchronously
      try {
        const signedUrl = await getSupabaseImageUrl(imageUrl, false);
        if (!cancelled) {
          setUrl(signedUrl);
        }
      } catch (error) {
        console.error('Failed to get image URL:', error);
        if (!cancelled) {
          setUrl('');
        }
      }
    };

    void fetchUrl();

    return () => {
      cancelled = true;
    };
  }, [imageUrl, isPublic]);

  return url;
};

/**
 * Hook to get public URL for an image (synchronous, no loading)
 * Use this for images in public bucket for better performance
 * @param imageUrl - Relative path stored in DB
 * @returns Public URL string
 */
export const usePublicImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  return getSupabasePublicUrl(imageUrl);
};
