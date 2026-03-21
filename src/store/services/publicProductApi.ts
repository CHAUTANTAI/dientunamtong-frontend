/**
 * Public Product API - RTK Query
 * For client-side product fetching without authentication
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// API Response Types
interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
  };
}

interface ProductDetailResponse {
  success: boolean;
  data: Product;
}

type GetProductsParams = {
  limit?: number;
  sort?: string;
} | void;

export const publicProductApi = createApi({
  reducerPath: 'publicProductApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_URL,
    // No auth needed for public endpoints
  }),
  endpoints: (builder) => ({
    // GET /public/product - Get all active products (public, no auth)
    getPublicProducts: builder.query<Product[], GetProductsParams>({
      query: (params) => {
        // Handle void params case
        if (!params) {
          return { url: '/public/product' };
        }
        
        return {
          url: '/public/product',
          params: params as Record<string, string | number>,
        };
      },
      transformResponse: (response: ProductListResponse | Product[]) => {
        // Handle different response formats
        if (!response) return [];
        
        // If response is already an array (direct Product[])
        if (Array.isArray(response)) return response;
        
        // If response is standard API format
        if ('success' in response && response.success === true && response.data) {
          return response.data.products || [];
        }
        
        return [];
      },
    }),
    
    // GET /public/product/:id - Get single product by ID (public, no auth)
    getPublicProductById: builder.query<Product, string>({
      query: (id) => `/public/product/${id}`,
      transformResponse: (response: ProductDetailResponse) => response.data,
    }),
  }),
});

export const { 
  useGetPublicProductsQuery,
  useGetPublicProductByIdQuery,
} = publicProductApi;
