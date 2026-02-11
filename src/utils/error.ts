/**
 * Error Handling Utilities
 * Common utilities for handling API errors consistently
 */

/**
 * API Error structure from backend
 */
export interface ApiError {
  data?: {
    error?: string;
    message?: string;
    statusCode?: number;
  };
  message?: string;
  status?: number;
}

/**
 * Extract error message from various error types
 * Works with RTK Query errors, Axios errors, and generic errors
 * 
 * @param error - Error object from catch block
 * @param fallbackMessage - Default message if no specific error found
 * @returns User-friendly error message
 */
export const getErrorMessage = (
  error: unknown,
  fallbackMessage = 'An error occurred'
): string => {
  // RTK Query error format
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    
    // Try data.error first (backend format)
    if (apiError.data?.error) {
      return apiError.data.error;
    }
    
    // Try data.message
    if (apiError.data?.message) {
      return apiError.data.message;
    }
    
    // Try top-level message
    if (apiError.message) {
      return apiError.message;
    }
  }
  
  // Error is a string
  if (typeof error === 'string') {
    return error;
  }
  
  // Error has toString
  if (error instanceof Error) {
    return error.message;
  }
  
  return fallbackMessage;
};

/**
 * Check if error is an API error with specific status code
 */
export const isApiError = (
  error: unknown,
  statusCode?: number
): error is ApiError => {
  if (!error || typeof error !== 'object') return false;
  
  const apiError = error as ApiError;
  
  if (statusCode) {
    return (
      apiError.data?.statusCode === statusCode ||
      apiError.status === statusCode
    );
  }
  
  return !!(apiError.data?.error || apiError.data?.message || apiError.message);
};

/**
 * Check if error is a validation error (400)
 */
export const isValidationError = (error: unknown): boolean => {
  return isApiError(error, 400);
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (error: unknown): boolean => {
  return isApiError(error, 401);
};

/**
 * Check if error is a forbidden error (403)
 */
export const isForbiddenError = (error: unknown): boolean => {
  return isApiError(error, 403);
};

/**
 * Check if error is a not found error (404)
 */
export const isNotFoundError = (error: unknown): boolean => {
  return isApiError(error, 404);
};

/**
 * Get status code from error
 */
export const getErrorStatusCode = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') return undefined;
  
  const apiError = error as ApiError;
  return apiError.data?.statusCode || apiError.status;
};

/**
 * Format error for logging (includes more details)
 */
export const formatErrorForLog = (error: unknown): string => {
  if (!error) return 'Unknown error';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }
  
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
};

/**
 * Example usage:
 * 
 * try {
 *   await createCategory(data).unwrap();
 * } catch (error) {
 *   console.error('Create error:', formatErrorForLog(error));
 *   message.error(getErrorMessage(error, 'Failed to create category'));
 *   
 *   if (isValidationError(error)) {
 *     // Handle validation error
 *   }
 * }
 */

