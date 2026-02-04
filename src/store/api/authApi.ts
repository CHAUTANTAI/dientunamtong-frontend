/**
 * Auth API - RTK Query
 * Centralized API endpoints for authentication
 * Uses unified response format with api-interceptor
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginRequest, LoginResponse } from "@/types/auth";
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
  }),
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: API_AUTH_LOGIN,
        method: "POST",
        body: credentials,
      }),
    }),

    // Logout endpoint
    logout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: API_AUTH_LOGOUT,
        method: "POST",
      }),
    }),

    // Get current user
    getCurrentUser: builder.query<
      ApiResponse<{ id: string; username: string }>,
      void
    >({
      query: () => ({
        url: API_AUTH_ME,
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } =
  authApi;
