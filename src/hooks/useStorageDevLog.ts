'use client';

import { useEffect, useRef } from 'react';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { getDefaultStoragePublicBaseFromApiUrl } from '@/utils/objectStorage';

/**
 * In development only: one console summary after `/public/system-info` settles.
 * Filter DevTools console by: `[storage]`
 */
export function useStorageDevLog(): void {
  const { data, isError, error, isLoading } = useGetSystemInfoQuery();
  const logged = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (isLoading) return;
    if (logged.current) return;

    logged.current = true;

    if (isError) {
      console.warn('[storage] GET /public/system-info failed', error);
      return;
    }

    const fromApi = data?.storage_public_base_url?.trim() || '';
    const envR2 = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').trim();
    const fallback = getDefaultStoragePublicBaseFromApiUrl();
    const effective = fromApi || envR2 || fallback;

    console.info('[storage] dev summary — image base URL', {
      storage_public_base_url_from_api: fromApi || '(empty)',
      NEXT_PUBLIC_R2_PUBLIC_URL: envR2 || '(empty)',
      fallback_from_NEXT_PUBLIC_API_URL: fallback,
      effective_base_used: effective,
    });

    if (!fromApi && !envR2) {
      console.info(
        '[storage] API did not send storage_public_base_url (or parse failed); using fallback from NEXT_PUBLIC_API_URL. Ensure backend is latest and R2 S3 keys are set for /api/public/storage proxy.'
      );
    }
  }, [data, isError, error, isLoading]);
}
