import { createApi } from '@reduxjs/toolkit/query/react';
import {
  API_PUBLIC_PRODUCTS,
  API_PUBLIC_PRODUCT_DETAIL,
} from '@/constants/api';
import { baseQueryWithoutAuth } from '../api/baseQuery';

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number | null;
  short_description?: string;
  description?: string;
  specifications?: Record<string, string>;
  tags?: string[];
  is_active: boolean;
  in_stock: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  media?: Array<{
    id: string;
    file_url: string;
    media_type: string;
    alt_text?: string;
    sort_order: number;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface PublicProductsResponse {
  products: PublicProduct[];
  total: number;
}

export const publicProductApi = createApi({
  reducerPath: 'publicProductApi',
  baseQuery: baseQueryWithoutAuth,
  tagTypes: ['PublicProducts'],
  endpoints: (builder) => ({
    getPublicProducts: builder.query<PublicProductsResponse, void>({
      query: () => API_PUBLIC_PRODUCTS,
      transformResponse: (response: { data: PublicProductsResponse }) => response.data,
      providesTags: ['PublicProducts'],
    }),
    getPublicProductById: builder.query<PublicProduct, string>({
      query: (id) => API_PUBLIC_PRODUCT_DETAIL(id),
      transformResponse: (response: { data: PublicProduct }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'PublicProducts', id }],
    }),
  }),
});

export const { useGetPublicProductsQuery, useGetPublicProductByIdQuery } =
  publicProductApi;
