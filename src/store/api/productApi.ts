/**
 * Product API - RTK Query
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/utils/auth';
import type { Product, ProductWithImages, ProductImage } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Product', 'ProductImage'],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProduct: builder.query<ProductWithImages, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: Partial<Product> }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // Product images
    getProductImages: builder.query<ProductImage[], string>({
      query: (productId) => `/products/${productId}/images`,
      providesTags: (result, error, productId) =>
        result
          ? [...result.map(({ id }) => ({ type: 'ProductImage' as const, id })), { type: 'ProductImage', id: `PRODUCT_${productId}` }]
          : [{ type: 'ProductImage', id: `PRODUCT_${productId}` }],
    }),
    addProductImage: builder.mutation<ProductImage, { productId: string; image_url: string; sort_order?: number }>({
      query: ({ productId, ...body }) => ({ url: `/products/${productId}/images`, method: 'POST', body }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'ProductImage', id: `PRODUCT_${productId}` }],
    }),
    removeProductImage: builder.mutation<void, { productId: string; imageId: string }>({
      query: ({ productId, imageId }) => ({ url: `/products/${productId}/images/${imageId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'ProductImage', id: `PRODUCT_${productId}` }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductImagesQuery,
  useAddProductImageMutation,
  useRemoveProductImageMutation,
} = productApi;
