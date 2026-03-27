import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithoutAuth } from '../api/baseQuery';

export interface SystemInfo {
  company_name: string;
  company_logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  about_us?: string;
  google_maps_embed?: string;
  business_hours?: string;
  facebook_url?: string;
  tiktok_url?: string;
  /** R2 public bucket base URL from backend (fallback when NEXT_PUBLIC_R2_PUBLIC_URL is unset) */
  storage_public_base_url?: string;
}

export const publicSystemInfoApi = createApi({
  reducerPath: 'publicSystemInfoApi',
  baseQuery: baseQueryWithoutAuth,
  endpoints: (builder) => ({
    getSystemInfo: builder.query<SystemInfo, void>({
      query: () => '/public/system-info',
      transformResponse: (response: unknown): SystemInfo => {
        if (response && typeof response === 'object') {
          const r = response as Record<string, unknown>;
          if (r.data && typeof r.data === 'object') {
            return r.data as SystemInfo;
          }
          if ('company_name' in r) {
            return response as SystemInfo;
          }
        }
        return response as SystemInfo;
      },
    }),
  }),
});

export const { useGetSystemInfoQuery } = publicSystemInfoApi;
