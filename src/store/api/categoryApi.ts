/**
 * Category API - RTK Query
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/utils/auth';
import type { Category } from '@/types/category';
import type { ApiResponse } from '@/types/api';
import {
  API_BASE_URL,
  API_CATEGORY,
  API_CATEGORY_DETAIL,
} from '@/constants/api';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // GET /category -> { status, data: Category[] }
    getCategories: builder.query<Category[], void>({
      query: () => API_CATEGORY,
      transformResponse: (response: ApiResponse<Category[]>): Category[] =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: (result) =>
        result && result.length > 0
          ? [
            ...result.map(({ id }) => ({
              type: 'Category' as const,
              id,
            })),
            { type: 'Category', id: 'LIST' },
          ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    // GET /category/:id -> { status, data: Category }
    getCategory: builder.query<Category, string>({
      query: (id) => API_CATEGORY_DETAIL(id),
      transformResponse: (response: ApiResponse<Category>): Category =>
        response.data,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // POST /category -> { status, data: Category }
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (body) => ({ url: API_CATEGORY, method: 'POST', body }),
      transformResponse: (response: ApiResponse<Category>): Category =>
        response.data,
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // PUT /category/:id -> { status, data: Category }
    updateCategory: builder.mutation<
      Category,
      { id: string; body: Partial<Category> }
    >({
      query: ({ id, body }) => ({
        url: API_CATEGORY_DETAIL(id),
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Category>): Category =>
        response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }],
    }),

    // DELETE /category/:id -> { status, data: null | undefined }
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: API_CATEGORY_DETAIL(id), method: 'DELETE' }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
