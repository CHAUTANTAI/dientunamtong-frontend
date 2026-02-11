/**
 * Media API - RTK Query
 * Handles media upload, create, update, delete operations
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/utils/auth';
import type { Media, CreateMediaDto, UpdateMediaDto } from '@/types/media';
import type { ApiResponse } from '@/types/api';
import {
  API_BASE_URL,
  API_MEDIA,
  API_MEDIA_DETAIL,
} from '@/constants/api';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Media'],
  endpoints: (builder) => ({
    // GET /admin/media -> { success, data: Media[] }
    getMediaList: builder.query<Media[], void>({
      query: () => API_MEDIA,
      transformResponse: (response: ApiResponse<Media[]>): Media[] =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: (result) =>
        result && result.length > 0
          ? [
              ...result.map(({ id }) => ({
                type: 'Media' as const,
                id,
              })),
              { type: 'Media', id: 'LIST' },
            ]
          : [{ type: 'Media', id: 'LIST' }],
    }),

    // GET /admin/media/:id -> { success, data: Media }
    getMedia: builder.query<Media, string>({
      query: (id) => API_MEDIA_DETAIL(id),
      transformResponse: (response: ApiResponse<Media>): Media =>
        response.data,
      providesTags: (result, error, id) => [{ type: 'Media', id }],
    }),

    // POST /admin/media -> { success, data: Media }
    createMedia: builder.mutation<Media, CreateMediaDto>({
      query: (body) => ({
        url: API_MEDIA,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Media>): Media =>
        response.data,
      invalidatesTags: [{ type: 'Media', id: 'LIST' }],
    }),

    // PUT /admin/media/:id -> { success, data: Media }
    updateMedia: builder.mutation<
      Media,
      { id: string; body: UpdateMediaDto }
    >({
      query: ({ id, body }) => ({
        url: API_MEDIA_DETAIL(id),
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Media>): Media =>
        response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Media', id },
        { type: 'Media', id: 'LIST' },
      ],
    }),

    // DELETE /admin/media/:id -> { success }
    deleteMedia: builder.mutation<void, string>({
      query: (id) => ({
        url: API_MEDIA_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Media', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetMediaListQuery,
  useGetMediaQuery,
  useCreateMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} = mediaApi;

