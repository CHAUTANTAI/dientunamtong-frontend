/**
 * API Client Setup
 * Centralized API configuration and client creation
 * Uses unified response format from api-interceptor
 */

import { processApiResponse } from './api-interceptor';
import type { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const DEFAULT_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
};

/**
 * Fetch wrapper with unified response handling
 * Returns unified ApiResponse or throws ApiErrorResponse
 */
export const apiClient = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  let data: unknown;

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Process response using unified format
  return processApiResponse<T>(response, data);
};

