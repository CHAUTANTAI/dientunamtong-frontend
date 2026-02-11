/**
 * Category API - RTK Query
 * Supports tree structure operations
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/utils/auth';
import type { 
  Category, 
  CreateCategoryDto, 
  UpdateCategoryDto,
  CategoryTreeNode,
  CategoryBreadcrumb,
} from '@/types/category';
import type { ApiResponse } from '@/types/api';
import {
  API_BASE_URL,
  API_CATEGORY,
  API_CATEGORY_DETAIL,
  API_CATEGORY_TREE,
  API_CATEGORY_ROOTS,
  API_CATEGORY_CHILDREN,
  API_CATEGORY_BREADCRUMB,
  API_CATEGORY_SEARCH,
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

    // POST /admin/category -> { success, data: Category }
    createCategory: builder.mutation<Category, CreateCategoryDto>({
      query: (body) => ({ url: API_CATEGORY, method: 'POST', body }),
      transformResponse: (response: ApiResponse<Category>): Category =>
        response.data,
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'TREE' },
        { type: 'Category', id: 'ROOTS' },
      ],
    }),

    // PUT /admin/category/:id -> { success, data: Category }
    updateCategory: builder.mutation<
      Category,
      { id: string; body: UpdateCategoryDto }
    >({
      query: ({ id, body }) => ({
        url: API_CATEGORY_DETAIL(id),
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Category>): Category =>
        response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'TREE' },
      ],
    }),

    // DELETE /admin/category/:id -> { success }
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: API_CATEGORY_DETAIL(id), method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'TREE' },
        { type: 'Category', id: 'ROOTS' },
      ],
    }),

    // GET /admin/category/tree -> { success, data: CategoryTreeNode[] }
    getCategoryTree: builder.query<CategoryTreeNode[], void>({
      query: () => API_CATEGORY_TREE,
      transformResponse: (response: ApiResponse<CategoryTreeNode[]>): CategoryTreeNode[] =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: [{ type: 'Category', id: 'TREE' }],
    }),

    // GET /admin/category/roots -> { success, data: Category[] }
    getRootCategories: builder.query<Category[], void>({
      query: () => API_CATEGORY_ROOTS,
      transformResponse: (response: ApiResponse<Category[]>): Category[] =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: [{ type: 'Category', id: 'ROOTS' }],
    }),

    // GET /admin/category/:id/children -> { success, data: Category[] }
    getCategoryChildren: builder.query<Category[], string>({
      query: (id) => API_CATEGORY_CHILDREN(id),
      transformResponse: (response: ApiResponse<Category[]>): Category[] =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: (result, error, id) => [{ type: 'Category', id: `CHILDREN_${id}` }],
    }),

    // GET /admin/category/:id/breadcrumb -> { success, data: CategoryBreadcrumb[] }
    getCategoryBreadcrumb: builder.query<CategoryBreadcrumb[], string>({
      query: (id) => API_CATEGORY_BREADCRUMB(id),
      transformResponse: (response: ApiResponse<CategoryBreadcrumb[]>): CategoryBreadcrumb[] =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: (result, error, id) => [{ type: 'Category', id: `BREADCRUMB_${id}` }],
    }),

    // GET /admin/category/search?q=keyword -> { success, data: Category[] }
    searchCategories: builder.query<Category[], string>({
      query: (searchKey) => `${API_CATEGORY_SEARCH}?q=${encodeURIComponent(searchKey)}`,
      transformResponse: (response: ApiResponse<Category[]>): Category[] =>
        Array.isArray(response.data) ? response.data : [],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryTreeQuery,
  useGetRootCategoriesQuery,
  useGetCategoryChildrenQuery,
  useGetCategoryBreadcrumbQuery,
  useSearchCategoriesQuery,
} = categoryApi;
