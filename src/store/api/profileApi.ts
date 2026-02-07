/**
 * Profile API - RTK Query
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Profile } from "@/types/profile";
import { ApiResponse } from "@/types/api";
import { API_BASE_URL, API_PROFILE } from "@/constants/api";
import { getAuthToken } from "@/utils/auth";

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, void>({
      query: () => API_PROFILE,
      transformResponse: (response: ApiResponse<Profile>) => response.data,
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<Profile, Partial<Profile>>({
      query: (body) => ({
        url: API_PROFILE,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Profile>) => response.data,
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
