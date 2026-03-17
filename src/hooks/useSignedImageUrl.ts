/**
 * Hook to get signed image URL from Supabase Storage
 * DEPRECATED: For new code, use usePublicImageUrl from useImageUrl hook instead
 * This hook now defaults to public URLs for better performance
 */

import { useState, useEffect } from 'react';
import { getSupabaseImageUrl, getSupabasePublicUrl } from '@/utils/supabase';

/**
 * Hook to get URL for an image
 * @param imageUrl - Relative path stored in DB
 * @param usePublic - Whether to use public bucket (default: true for performance)
 * @returns URL string (empty string while loading for signed URLs)
 */
export const useSignedImageUrl = (
  imageUrl: string | null | undefined,
  usePublic: boolean = true
): string => {
  const [signedUrl, setSignedUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const fetchSignedUrl = async () => {
      if (!imageUrl) {
        setSignedUrl('');
        return;
      }

      // For public bucket, get URL synchronously
      if (usePublic) {
        const publicUrl = getSupabasePublicUrl(imageUrl);
        if (!cancelled) {
          setSignedUrl(publicUrl);
        }
        return;
      }

      // For private bucket (legacy), fetch signed URL
      console.log('useSignedImageUrl: Fetching signed URL for:', imageUrl);

      try {
        const url = await getSupabaseImageUrl(imageUrl, false);
        console.log('useSignedImageUrl: Got signed URL:', url);
        if (!cancelled) {
          setSignedUrl(url);
        }
      } catch (error) {
        console.error('Failed to get signed URL:', error);
        if (!cancelled) {
          setSignedUrl('');
        }
      }
    };

    void fetchSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [imageUrl, usePublic]);

  return signedUrl;
};
