/**
 * Resolve image URL for stored object keys (R2 public URL).
 * Uses NEXT_PUBLIC_R2_PUBLIC_URL and/or GET /public/system-info `storage_public_base_url`.
 */

import { useState, useEffect, useMemo } from 'react';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import {
  getDefaultStoragePublicBaseFromApiUrl,
  getStorageImageUrl,
  resolveStoragePublicUrl,
} from '@/utils/objectStorage';
import { storageDebug } from '@/utils/storageDebug';

const ENV_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/+$/, '');

/**
 * @param imageUrl - Relative path or full URL
 * @param usePublic - Whether to use public URL resolution (default: true)
 */
export const useSignedImageUrl = (
  imageUrl: string | null | undefined,
  usePublic: boolean = true
): string => {
  const { data: systemInfo } = useGetSystemInfoQuery();

  const storageBase = useMemo(() => {
    const fromApi = (systemInfo?.storage_public_base_url || '').replace(/\/+$/, '');
    if (fromApi) return fromApi;
    if (ENV_BASE) return ENV_BASE;
    return getDefaultStoragePublicBaseFromApiUrl();
  }, [systemInfo?.storage_public_base_url]);

  const [signedUrl, setSignedUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const fetchSignedUrl = async () => {
      if (!imageUrl) {
        setSignedUrl('');
        return;
      }

      if (usePublic) {
        const publicUrl = resolveStoragePublicUrl(imageUrl, storageBase);
        storageDebug('useSignedImageUrl', 'resolved public URL', {
          mediaKey: imageUrl,
          storageBase: storageBase || '(empty)',
          nextPublicR2: ENV_BASE ? '(set)' : '(empty)',
          result: publicUrl || '(empty — no base URL)',
        });
        if (!cancelled) {
          setSignedUrl(publicUrl);
        }
        return;
      }

      try {
        const url = await getStorageImageUrl(imageUrl, false);
        if (!cancelled) {
          setSignedUrl(url);
        }
      } catch (error) {
        console.error('Failed to get image URL:', error);
        if (!cancelled) {
          setSignedUrl('');
        }
      }
    };

    void fetchSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [imageUrl, usePublic, storageBase]);

  return signedUrl;
};
