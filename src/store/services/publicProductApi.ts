/**
 * Public Product API - RTK Query
 * For client-side and admin product fetching without requiring full auth
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/utils/auth';
import type { Product } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const publicProductApi = createApi({
  reducerPath: 'publicProductApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // GET /admin/product - Get all products (with auth for admin usage)
    getPublicProducts: builder.query<Product[], { limit?: number; sort?: string } | void>({
      query: (params) => ({
        url: '/admin/product',
        params: params as Record<string, string | number | undefined>,
      }),
      transformResponse: (response: { success: boolean; data: { products: Product[] } }) => 
        response.data.products || [],
    }),
    
    // GET /admin/product/:id - Get single product by ID
    getPublicProductById: builder.query<Product, string>({
      query: (id) => `/admin/product/${id}`,
      transformResponse: (response: { success: boolean; data: Product }) => response.data,
    }),
  }),
});

export const { 
  useGetPublicProductsQuery,
  useGetPublicProductByIdQuery,
} = publicProductApi;
