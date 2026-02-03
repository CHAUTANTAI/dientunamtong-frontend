/**
 * API Response Types
 * Unified response format for all API calls
 */

/**
 * Unified API response format
 * - status: Custom status code (200 for success, other values for errors)
 * - data: Response data (unknown type for flexibility)
 * - message: Human-readable message
 */
export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  message: string;
}

/**
 * API Error response
 * - status: Custom error status code
 * - message: Error message
 * - data: undefined (no data on error)
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  data: undefined;
}
