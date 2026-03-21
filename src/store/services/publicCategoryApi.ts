/**
 * Public Category API - RTK Query
 * For client-side category fetching without authentication
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Category } from '@/types/category';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const publicCategoryApi = createApi({
  reducerPath: 'publicCategoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    // GET /public/category - Get all active categories
    getPublicCategories: builder.query<Category[], void>({
      query: () => '/public/category',
      transformResponse: (response: { success: boolean; data: Category[] }) => response.data,
    }),
    
    // GET /public/category/:slug - Get single category by slug
    getPublicCategoryById: builder.query<Category, string>({
      query: (slug) => `/public/category/${slug}`,
      transformResponse: (response: { success: boolean; data: Category }) => response.data,
    }),
  }),
});

export const { 
  useGetPublicCategoriesQuery,
  useGetPublicCategoryByIdQuery,
} = publicCategoryApi;
