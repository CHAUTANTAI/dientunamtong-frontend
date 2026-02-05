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
    if (!imageUrl) {
      setSignedUrl('');
      return;
    }

    // Generate signed URL
    getSupabaseImageUrl(imageUrl)
      .then((url) => {
        setSignedUrl(url);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to get signed URL:', error);
        setSignedUrl('');
      });
  }, [imageUrl]);

  return signedUrl;
};
