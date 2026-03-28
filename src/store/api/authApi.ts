/**
 * Auth API - RTK Query
 * Centralized API endpoints for authentication
 * Synchronized with backend auth system
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithInterceptor } from '@/store/api/baseQuery';
import type { LoginRequest, AuthResponseDto, AuthUser } from '@/types/auth';
import type { ApiResponse } from '@/types/api';
import { API_AUTH_LOGIN, API_AUTH_LOGOUT, API_AUTH_ME } from '@/constants/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: createBaseQueryWithInterceptor(),
  endpoints: (builder) => ({
    // Login endpoint - NO auth required
    // Backend returns: { success: true, data: AuthResponseDto, statusCode: 200 }
    login: builder.mutation<AuthResponseDto, LoginRequest>({
      query: (credentials) => ({
        url: API_AUTH_LOGIN,
        method: 'POST',
        body: credentials,
        credentials: 'include',
      }),
      transformResponse: (response: ApiResponse<AuthResponseDto>) => response.data,
    }),

    // Logout endpoint - requires auth token
    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_AUTH_LOGOUT,
        method: 'POST',
        credentials: 'include',
      }),
    }),

    // Get current user (requires auth)
    getCurrentUser: builder.query<AuthUser, void>({
      query: () => ({
        url: API_AUTH_ME,
        method: 'GET',
        credentials: 'include',
      }),
      transformResponse: (response: ApiResponse<AuthUser>) => response.data,
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } = authApi;
