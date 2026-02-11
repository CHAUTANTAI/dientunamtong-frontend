/**
 * Auth API - RTK Query
 * Centralized API endpoints for authentication
 * Synchronized with backend auth system
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/utils/auth";
import type { LoginRequest, AuthResponseDto, AuthUser } from "@/types/auth";
import type { ApiResponse } from "@/types/api";
import {
  API_BASE_URL,
  API_AUTH_LOGIN,
  API_AUTH_LOGOUT,
  API_AUTH_ME,
} from "@/constants/api";

export const authApi = createApi({
  reducerPath: "authApi",
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
  endpoints: (builder) => ({
    // Login endpoint
    // Backend returns: { success: true, data: AuthResponseDto, statusCode: 200 }
    login: builder.mutation<AuthResponseDto, LoginRequest>({
      query: (credentials) => ({
        url: API_AUTH_LOGIN,
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponseDto>) => response.data,
    }),

    // Logout endpoint
    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_AUTH_LOGOUT,
        method: "POST",
      }),
    }),

    // Get current user (requires auth)
    getCurrentUser: builder.query<AuthUser, void>({
      query: () => ({
        url: API_AUTH_ME,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AuthUser>) => response.data,
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } =
  authApi;
