/**
 * Resolve image URL from stored object keys (R2 public URL).
 */

import { useState, useEffect, useMemo } from 'react';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import {
  getDefaultStoragePublicBaseFromApiUrl,
  getStorageImageUrl,
  resolveStoragePublicUrl,
} from '@/utils/objectStorage';

const ENV_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/+$/, '');

export const useImageUrl = (
  imageUrl: string | null | undefined,
  isPublic: boolean = true
): string => {
  const { data: systemInfo } = useGetSystemInfoQuery();

  const storageBase = useMemo(() => {
    const fromApi = (systemInfo?.storage_public_base_url || '').replace(/\/+$/, '');
    return fromApi || ENV_BASE;
  }, [systemInfo?.storage_public_base_url]);

  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const fetchUrl = async () => {
      if (!imageUrl) {
        setUrl('');
        return;
      }

      if (isPublic) {
        const publicUrl = resolveStoragePublicUrl(imageUrl, storageBase);
        if (!cancelled) {
          setUrl(publicUrl);
        }
        return;
      }

      try {
        const signedUrl = await getStorageImageUrl(imageUrl, false);
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
  }, [imageUrl, isPublic, storageBase]);

  return url;
};

/**
 * Synchronous public URL using system-info base + env (for previews).
 */
export const usePublicImageUrl = (imageUrl: string | null | undefined): string => {
  const { data: systemInfo } = useGetSystemInfoQuery();
  const base =
    (systemInfo?.storage_public_base_url || '').replace(/\/+$/, '') ||
    ENV_BASE ||
    getDefaultStoragePublicBaseFromApiUrl();
  if (!imageUrl) return '';
  return resolveStoragePublicUrl(imageUrl, base);
};
