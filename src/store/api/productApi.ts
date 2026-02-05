/**
 * Product API - RTK Query
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/utils/auth';
import type {
  Product,
  ProductWithImages,
  ProductImage,
} from '@/types/product';
import type { ApiResponse } from '@/types/api';
import {
  API_BASE_URL,
  API_PRODUCTS,
  API_PRODUCT_DETAIL,
  API_PRODUCT_IMAGE,
  API_PRODUCT_IMAGES,
  API_PRODUCT_IMAGE_DELETE,
} from '@/constants/api';

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
    // GET /admin/product -> { status, data: ProductWithImages[] }
    getProducts: builder.query<ProductWithImages[], void>({
      query: () => API_PRODUCTS,
      transformResponse: (response: ApiResponse<ProductWithImages[]>): ProductWithImages[] =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: (result) =>
        result && result.length > 0
          ? [
              ...result.map(({ id }) => ({
                type: 'Product' as const,
                id,
              })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // GET /admin/product/:id -> { status, data: ProductWithImages }
    getProduct: builder.query<ProductWithImages, string>({
      query: (id) => API_PRODUCT_DETAIL(id),
      transformResponse: (
        response: ApiResponse<ProductWithImages>,
      ): ProductWithImages => response.data,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // POST /admin/product -> { status, data: Product }
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: API_PRODUCTS, method: 'POST', body }),
      transformResponse: (response: ApiResponse<Product>): Product =>
        response.data,
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // PUT /admin/product/:id -> { status, data: Product }
    updateProduct: builder.mutation<
      Product,
      { id: string; body: Partial<Product> }
    >({
      query: ({ id, body }) => ({
        url: API_PRODUCT_DETAIL(id),
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Product>): Product =>
        response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),

    // DELETE /admin/product/:id -> { status, data: null | undefined }
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: API_PRODUCT_DETAIL(id), method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // Product images
    // GET /admin/product/:productId/images -> { status, data: ProductImage[] }
    getProductImages: builder.query<ProductImage[], string>({
      query: (productId) => API_PRODUCT_IMAGES(productId),
      transformResponse: (
        response: ApiResponse<ProductImage[]>,
      ): ProductImage[] =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: (result, error, productId) =>
        result && result.length > 0
          ? [
              ...result.map(({ id }) => ({
                type: 'ProductImage' as const,
                id,
              })),
              { type: 'ProductImage', id: `PRODUCT_${productId}` },
            ]
          : [{ type: 'ProductImage', id: `PRODUCT_${productId}` }],
    }),

    // POST /admin/product-image -> { status, data: ProductImage }
    addProductImage: builder.mutation<
      ProductImage,
      { productId: string; image_url: string; sort_order?: number }
    >({
      query: ({ productId, image_url, sort_order }) => ({
        url: API_PRODUCT_IMAGE,
        method: 'POST',
        body: {
          product_id: productId,
          image_url,
          sort_order: sort_order ?? 0,
        },
      }),
      transformResponse: (response: ApiResponse<ProductImage>): ProductImage =>
        response.data,
      invalidatesTags: (result, error, { productId }) => [
        { type: 'ProductImage', id: `PRODUCT_${productId}` },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // DELETE /admin/product/:productId/images/:imageId -> { status, data: null | undefined }
    removeProductImage: builder.mutation<
      void,
      { imageId: string }
    >({
      query: ({ imageId }) => ({
        url: API_PRODUCT_IMAGE_DELETE(imageId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { imageId }) => [
        { type: 'ProductImage', id: imageId },
        { type: 'Product', id: 'LIST' },
      ],
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
