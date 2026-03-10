import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Media } from '@/types/media';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const publicMediaApi = createApi({
  reducerPath: 'publicMediaApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    getPublicMedia: builder.query<Media[], { ids?: string[] } | undefined>({
      query: (params) => {
        if (params?.ids && params.ids.length > 0) {
          return `/public/media?ids=${params.ids.join(',')}`;
        }
        return '/public/media';
      },
    }),
  }),
});

export const { useGetPublicMediaQuery } = publicMediaApi;
