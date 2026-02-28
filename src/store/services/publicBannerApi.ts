import { createApi } from '@reduxjs/toolkit/query/react';
import { API_PUBLIC_BANNERS } from '@/constants/api';
import { baseQueryWithoutAuth } from '../api/baseQuery';

export interface Banner {
  id: string;
  media_id: string;
  title: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  media?: {
    id: string;
    file_url: string;
    alt_text?: string;
  };
}

export const publicBannerApi = createApi({
  reducerPath: 'publicBannerApi',
  baseQuery: baseQueryWithoutAuth,
  tagTypes: ['PublicBanners'],
  endpoints: (builder) => ({
    getPublicBanners: builder.query<Banner[], void>({
      query: () => API_PUBLIC_BANNERS,
      transformResponse: (response: { data: Banner[] }) => response.data,
      providesTags: ['PublicBanners'],
    }),
  }),
});

export const { useGetPublicBannersQuery } = publicBannerApi;
