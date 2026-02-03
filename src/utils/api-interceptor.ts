/**
 * API Response Interceptor
 * Handles unified API response format at the highest level
 * - Checks HTTP status code
 * - Validates custom status in response data
 * - Returns consistent error format when needed
 */

import type { ApiResponse, ApiErrorResponse } from '@/types/api';

/**
 * Process API response
 * @param response - Fetch response object
 * @param data - Parsed response data
 * @returns Processed response or throws error
 */
export async function processApiResponse<T = unknown>(
  response: Response,
  data: unknown
): Promise<ApiResponse<T>> {
  // Check HTTP status code first
  if (response.status !== 200) {
    // HTTP error - return error format
    let message = 'API request failed';
    let customStatus = response.status;

    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in (data as Record<string, unknown>)
    ) {
      const maybeMsg = (data as Record<string, unknown>).message;
      if (typeof maybeMsg === 'string') {
        message = maybeMsg;
      }
    }

    if (
      typeof data === 'object' &&
      data !== null &&
      'status' in (data as Record<string, unknown>)
    ) {
      const maybeStatus = (data as Record<string, unknown>).status;
      if (typeof maybeStatus === 'number') {
        customStatus = maybeStatus;
      }
    }

    const error: ApiErrorResponse = {
      status: customStatus,
      message,
      data: undefined,
    };

    throw error;
  }

  // HTTP 200 - now check custom status in response data
  const responseData = data as Record<string, unknown>;

  if (
    typeof responseData === 'object' &&
    responseData !== null &&
    'status' in responseData &&
    'message' in responseData
  ) {
    const customStatus = responseData.status as number;
    const message = responseData.message as string;
    const responsePayload = responseData.data;

    // Check if custom status indicates error
    if (customStatus !== 200) {
      const error: ApiErrorResponse = {
        status: customStatus,
        message,
        data: undefined,
      };
      throw error;
    }

    // Success response
    return {
      status: customStatus,
      message,
      data: responsePayload as T,
    };
  }

  // Fallback if response doesn't match expected format
  throw {
    status: 500,
    message: 'Invalid API response format',
    data: undefined,
  };
}

/**
 * Handle API error safely
 * Extracts message from error object following unified format
 */
export function getErrorMessage(error: unknown): string {
  let message = 'An error occurred. Please try again.';

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // Check for unified error format with message property
    if (typeof err.message === 'string') {
      message = err.message;
    }
    // Check for nested data.message
    else if ('data' in err && typeof err.data === 'object' && err.data !== null) {
      const dataObj = err.data as Record<string, unknown>;
      if (typeof dataObj.message === 'string') {
        message = dataObj.message;
      }
    }
  }

  return message;
}
