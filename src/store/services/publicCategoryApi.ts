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
  image_url?: string;
  is_active: boolean;
  level: number;
  created_at: string;
  updated_at: string;
}

export const publicCategoryApi = createApi({
  reducerPath: 'publicCategoryApi',
  baseQuery: baseQueryWithoutAuth,
  tagTypes: ['PublicCategories'],
  endpoints: (builder) => ({
    getPublicCategories: builder.query<PublicCategory[], void>({
      query: () => API_PUBLIC_CATEGORIES,
      transformResponse: (response: { data: PublicCategory[] }) => response.data,
      providesTags: ['PublicCategories'],
    }),
    getPublicCategory: builder.query<PublicCategory, string>({
      query: (id) => API_PUBLIC_CATEGORY_DETAIL(id),
      transformResponse: (response: { data: PublicCategory }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'PublicCategories', id }],
    }),
  }),
});

export const { useGetPublicCategoriesQuery, useGetPublicCategoryQuery } =
  publicCategoryApi;
