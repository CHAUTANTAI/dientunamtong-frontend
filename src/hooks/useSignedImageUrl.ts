/**
 * Hook to get signed image URL from Supabase Storage
 */

import { useState, useEffect } from 'react';
import { getSupabaseImageUrl } from '@/utils/supabase';

/**
 * Hook to get signed URL for an image
 * @param imageUrl - Relative path stored in DB
 * @returns Signed URL string (empty string while loading)
 */
export const useSignedImageUrl = (imageUrl: string | null | undefined): string => {
  const [signedUrl, setSignedUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const fetchSignedUrl = async () => {
      if (!imageUrl) {
        setSignedUrl('');
        return;
      }

      try {
        const url = await getSupabaseImageUrl(imageUrl);
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
  }, [imageUrl]);

  return signedUrl;
};
