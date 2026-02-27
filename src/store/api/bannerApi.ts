import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/utils/auth';
import { API_BASE_URL } from '@/constants/api';
import type { Banner, CreateBannerDto, UpdateBannerDto } from '@/types/banner';

export const bannerApi = createApi({
  reducerPath: 'bannerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Banner'],
  endpoints: (builder) => ({
    // Get all banners (Admin)
    getBanners: builder.query<Banner[], void>({
      query: () => '/admin/banner',
      providesTags: ['Banner'],
    }),

    // Get banner by ID
    getBanner: builder.query<Banner, string>({
      query: (id) => `/admin/banner/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Banner', id }],
    }),

    // Get available sort_order values
    getAvailableSortOrders: builder.query<
      { available: number[]; default: number; maxBanners: number },
      { excludeId?: string } | void
    >({
      query: (params) => {
        const queryParams: { excludeId?: string } = {};
        if (params && typeof params === 'object' && 'excludeId' in params && params.excludeId) {
          queryParams.excludeId = params.excludeId;
        }
        return {
          url: '/admin/banner/available-sort-orders',
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: ['Banner'],
    }),

    // Create banner
    createBanner: builder.mutation<Banner, CreateBannerDto>({
      query: (dto) => ({
        url: '/admin/banner',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['Banner'],
    }),

    // Update banner
    updateBanner: builder.mutation<Banner, { id: string; dto: UpdateBannerDto }>({
      query: ({ id, dto }) => ({
        url: `/admin/banner/${id}`,
        method: 'PUT',
        body: dto,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Banner', id }, 'Banner'],
    }),

    // Delete banner
    deleteBanner: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/banner/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetBannerQuery,
  useGetAvailableSortOrdersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
