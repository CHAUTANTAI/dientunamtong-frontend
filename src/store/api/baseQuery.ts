/**
 * Custom Base Query for RTK Query
 * Applies unified API response processing to all RTK Query endpoints
 */

import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/constants/api";

/**
 * Create a custom base query that wraps fetchBaseQuery
 * Applies unified response processing to all requests
 */
export const createCustomBaseQuery = () =>
  fetchBaseQuery({
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
    extraOptions: Parameters<typeof baseQuery>[2],
  ) => {
    let result = await baseQuery(args, api, extraOptions);

    // Process response if successful
    if (result.data && typeof result.data === "object") {
      try {
        // Validate the response matches our unified format
        const responseData = result.data as Record<string, unknown>;
        if (
          "status" in responseData &&
          "message" in responseData &&
          typeof responseData.status === "number"
        ) {
          const customStatus = responseData.status as number;
          // If custom status is not 200, convert to error
          if (customStatus !== 200) {
            result = {
              ...result,
              error: {
                status: customStatus,
                data: responseData.message,
              },
              data: undefined,
            };
          }
        }
      } catch {
        // Silently continue if validation fails
      }
    }

    return result;
  };
};
