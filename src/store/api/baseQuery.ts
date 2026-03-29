/**
 * Custom Base Query for RTK Query
 * Applies unified API response processing to all RTK Query endpoints
 */

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store';
import { API_BASE_URL, API_AUTH_REFRESH } from '@/constants/api';
import { getAuthToken } from '@/utils/auth';
import { restoreAuth, clearAuth } from '@/store/slices/authSlice';
import type { AuthUser } from '@/types/auth';

/**
 * Create a custom base query that wraps fetchBaseQuery
 * Applies unified response processing to all requests
 */
export const createCustomBaseQuery = () =>
  fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState | undefined;
      const stateToken = state?.auth?.token;
      const token = stateToken ?? getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

/**
 * Base query without authentication for public endpoints
 */
export const baseQueryWithoutAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
});

/**
 * Alternative: Create a middleware-like wrapper for base query
 * Can be used if you need to process all responses uniformly
 */
export const createBaseQueryWithInterceptor = () => {
  const baseQuery = createCustomBaseQuery();

  return async (
    args: Parameters<typeof baseQuery>[0],
    api: Parameters<typeof baseQuery>[1],
    extraOptions: Parameters<typeof baseQuery>[2]
  ) => {
    let result = await baseQuery(args, api, extraOptions);

    // Debug: log request/response for easier debugging during development
    try {
      // avoid noisy logs in production
      if (process.env.NODE_ENV !== 'production') {
         
        console.debug('[baseQuery] request args:', args);
         
        console.debug('[baseQuery] initial result:', result);
      }
    } catch (e) {
      // ignore
    }

    // Convert custom-formatted responses into RTK Query error shape when needed
    if (result.data && typeof result.data === 'object') {
      try {
        const responseData = result.data as Record<string, unknown>;
        if (
          'status' in responseData &&
          'message' in responseData &&
          typeof responseData.status === 'number'
        ) {
          const customStatus = responseData.status as number;
          if (customStatus !== 200) {
            result = {
              ...result,
              error: {
                status: customStatus,
                data: responseData.message as unknown,
              },
              data: undefined,
            };
          }
        }
      } catch {
        // ignore
      }
    }

    // If unauthorized, attempt refresh using HttpOnly cookie
    const _status: number | string | undefined = result.error ? (result.error as { status?: number | string }).status : undefined;
    if (result.error && (_status === 401 || _status === '401')) {
      // debug
      if (process.env.NODE_ENV !== 'production') {
         
        console.debug('[baseQuery] 401 detected, attempting refresh', { args });
      }

      const refreshResult = await baseQuery(
        { url: API_AUTH_REFRESH, method: 'POST', credentials: 'include' },
        api,
        extraOptions
      );

      if (process.env.NODE_ENV !== 'production') {
         
        console.debug('[baseQuery] refreshResult:', refreshResult);
      }

      if (refreshResult.data) {
        try {
          // Support both shapes: plain { token, user } or ApiResponse { data: { token, user } }
          const maybeApiResponse = refreshResult.data as unknown;
          const data = (maybeApiResponse && typeof maybeApiResponse === 'object' && 'data' in (maybeApiResponse as Record<string, unknown>))
            ? (maybeApiResponse as Record<string, unknown>)['data']
            : maybeApiResponse;

          if (data && typeof data === 'object' && 'token' in (data as Record<string, unknown>)) {
            const typedData = data as { token: string; user?: unknown };
            if (isAuthUser(typedData.user)) {
              api.dispatch(restoreAuth({ user: typedData.user, token: typedData.token }));
            } else {
              console.warn('Invalid user object:', typedData.user);
            }
            try {
              localStorage.setItem('auth_token', typedData.token);
            } catch {
              // ignore
            }
            // retry original
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(clearAuth());
          }
        } catch (err) {
          api.dispatch(clearAuth());
        }
      } else {
        api.dispatch(clearAuth());
      }
    }

    return result;
  };
};

// Type guard to validate AuthUser
function isAuthUser(user: unknown): user is AuthUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'username' in user &&
    'role' in user
  );
}

