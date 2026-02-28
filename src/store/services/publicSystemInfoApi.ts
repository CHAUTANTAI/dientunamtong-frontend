import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithoutAuth } from '../api/baseQuery';

export interface SystemInfo {
  company_name: string;
  company_logo?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const publicSystemInfoApi = createApi({
  reducerPath: 'publicSystemInfoApi',
  baseQuery: baseQueryWithoutAuth,
  endpoints: (builder) => ({
    getSystemInfo: builder.query<SystemInfo, void>({
      query: () => '/public/system-info',
      transformResponse: (response: { data: SystemInfo }) => response.data,
    }),
  }),
});

export const { useGetSystemInfoQuery } = publicSystemInfoApi;
