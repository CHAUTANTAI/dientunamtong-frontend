import { createApi } from '@reduxjs/toolkit/query/react';
import {
  API_PUBLIC_CATEGORIES,
  API_PUBLIC_CATEGORY_DETAIL,
} from '@/constants/api';
import { baseQueryWithoutAuth } from '../api/baseQuery';

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  media_id?: string;
  parent_id?: string;
  is_active: boolean;
  level: number;
  view_count: number;
  product_count?: number;
  image?: string; // Derived from media.file_url
  created_at: string;
  updated_at: string;
  media?: {
    id: string;
    file_url: string;
    alt_text?: string;
  };
}

export const publicCategoryApi = createApi({
  reducerPath: 'publicCategoryApi',
  baseQuery: baseQueryWithoutAuth,
  tagTypes: ['PublicCategories'],
  endpoints: (builder) => ({
    getPublicCategories: builder.query<PublicCategory[], void>({
      query: () => API_PUBLIC_CATEGORIES,
      transformResponse: (response: { data: PublicCategory[] }) => {
        // Map media.file_url to image field for easier access
        return response.data.map(cat => ({
          ...cat,
          image: cat.media?.file_url,
        }));
      },
      providesTags: ['PublicCategories'],
    }),
    getPublicCategoryById: builder.query<PublicCategory, string>({
      query: (id) => API_PUBLIC_CATEGORY_DETAIL(id),
      transformResponse: (response: { data: PublicCategory }) => {
        const cat = response.data;
        return {
          ...cat,
          image: cat.media?.file_url,
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'PublicCategories', id }],
    }),
  }),
});

export const { useGetPublicCategoriesQuery, useGetPublicCategoryByIdQuery } =
  publicCategoryApi;
