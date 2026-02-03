/**
 * Auth API - RTK Query
 * Centralized API endpoints for authentication
 * Uses unified response format with api-interceptor
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginRequest } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<ApiResponse<{ success: boolean }>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Logout endpoint
    logout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // Get current user
    getCurrentUser: builder.query<ApiResponse<{ id: string; username: string }>, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } = authApi;

