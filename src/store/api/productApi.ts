/**
 * Product API - RTK Query
 * Full CRUD + Media management + Categories
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/utils/auth';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterParams,
} from '@/types/product';
import type { Media } from '@/types/media';
import type { ApiResponse } from '@/types/api';
import { API_BASE_URL } from '@/constants/api';

const API_PRODUCT = '/admin/product';
const API_PRODUCT_DETAIL = (id: string) => `/admin/product/${id}`;
const API_PRODUCT_MEDIA = (id: string) => `/admin/product/${id}/media`;
const API_PRODUCT_MEDIA_REMOVE = (mediaId: string) => `/admin/product/media/${mediaId}`;
const API_PRODUCT_MEDIA_SORT = (mediaId: string) => `/admin/product/media/${mediaId}/sort-order`;
const API_PRODUCT_CATEGORIES = (id: string) => `/admin/product/${id}/category`;

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
  tagTypes: ['Product', 'ProductMedia'],
  endpoints: (builder) => ({
    // ============= Product CRUD =============

    getProducts: builder.query<Product[], ProductFilterParams | void>({
      query: (params) => {
        if (!params) {
          return API_PRODUCT;
        }
        return {
          url: API_PRODUCT,
          params: params as Record<string, string | number | boolean | undefined>,
        };
      },
      transformResponse: (response: ApiResponse<{ products: Product[] }>): Product[] =>
        response.data.products || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProduct: builder.query<Product, string>({
      query: (id) => API_PRODUCT_DETAIL(id),
      transformResponse: (response: ApiResponse<Product>): Product => response.data,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<Product, CreateProductDto>({
      query: (body) => ({
        url: API_PRODUCT,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Product>): Product => response.data,
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, { id: string; body: UpdateProductDto }>({
      query: ({ id, body }) => ({
        url: API_PRODUCT_DETAIL(id),
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Product>): Product => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: API_PRODUCT_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    deleteProductPermanent: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_PRODUCT_DETAIL(id)}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // ============= Media Management =============

    getProductMedia: builder.query<Media[], string>({
      query: (productId) => API_PRODUCT_MEDIA(productId),
      transformResponse: (response: ApiResponse<Media[]>): Media[] => response.data,
      providesTags: (result, error, productId) => [
        { type: 'ProductMedia', id: productId },
      ],
    }),

    addProductMedia: builder.mutation<
      Media,
      {
        productId: string;
        file_url: string;
        file_name: string;
        media_type: 'image' | 'video';
        mime_type?: string;
        file_size?: number;
        sort_order?: number;
      }
    >({
      query: ({ productId, ...body }) => ({
        url: API_PRODUCT_MEDIA(productId),
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Media>): Media => response.data,
      invalidatesTags: (result, error, { productId }) => [
        { type: 'ProductMedia', id: productId },
        { type: 'Product', id: productId },
      ],
    }),

    removeProductMedia: builder.mutation<void, { mediaId: string; productId: string }>({
      query: ({ mediaId }) => ({
        url: API_PRODUCT_MEDIA_REMOVE(mediaId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'ProductMedia', id: productId },
        { type: 'Product', id: productId },
      ],
    }),

    removeAllProductMedia: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/admin/product/${productId}/media/all`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, productId) => [
        { type: 'ProductMedia', id: productId },
        { type: 'Product', id: productId },
      ],
    }),

    updateMediaSortOrder: builder.mutation<
      Media,
      { mediaId: string; sort_order: number; productId: string }
    >({
      query: ({ mediaId, sort_order }) => ({
        url: API_PRODUCT_MEDIA_SORT(mediaId),
        method: 'PATCH',
        body: { sort_order },
      }),
      transformResponse: (response: ApiResponse<Media>): Media => response.data,
      invalidatesTags: (result, error, { productId }) => [
        { type: 'ProductMedia', id: productId },
      ],
    }),

    // ============= Category Management =============

    updateProductCategories: builder.mutation<
      void,
      { productId: string; category_ids: string[] }
    >({
      query: ({ productId, category_ids }) => ({
        url: API_PRODUCT_CATEGORIES(productId),
        method: 'PUT',
        body: { category_ids },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
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
  useDeleteProductPermanentMutation,
  useGetProductMediaQuery,
  useAddProductMediaMutation,
  useRemoveProductMediaMutation,
  useRemoveAllProductMediaMutation,
  useUpdateMediaSortOrderMutation,
  useUpdateProductCategoriesMutation,
} = productApi;
