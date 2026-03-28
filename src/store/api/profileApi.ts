/**
 * Profile API - RTK Query
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithInterceptor } from '@/store/api/baseQuery';

import { Profile } from '@/types/profile';
import { ApiResponse } from '@/types/api';
import { API_PROFILE } from '@/constants/api';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: createBaseQueryWithInterceptor(),
  tagTypes: ['Profile', 'MaxBanners'],
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, void>({
      query: () => API_PROFILE,
      transformResponse: (response: ApiResponse<Profile>) => response.data,
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<Profile, Partial<Profile>>({
      query: (body) => ({
        url: API_PROFILE,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Profile>) => response.data,
      invalidatesTags: ['Profile'],
    }),
    getMaxBanners: builder.query<{ max_banners: number }, void>({
      query: () => `${API_PROFILE}/max-banners`,
      transformResponse: (response: ApiResponse<{ max_banners: number }>) => response.data,
      providesTags: ['MaxBanners'],
    }),
    updateMaxBanners: builder.mutation<{ max_banners: number; current_count: number }, { max_banners: number }>({
      query: (body) => ({
        url: `${API_PROFILE}/max-banners`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<{ max_banners: number; current_count: number }>) => response.data,
      invalidatesTags: ['MaxBanners'],
    }),
  }),
});

export const { 
  useGetProfileQuery, 
  useUpdateProfileMutation,
  useGetMaxBannersQuery,
  useUpdateMaxBannersMutation 
} = profileApi;
