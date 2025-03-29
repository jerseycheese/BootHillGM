/**
 * Error utilities for AI services
 */

import { AIServiceError } from '../types/ai-service.types';
import { ServiceError } from '../types/testing/test-types';

/**
 * Create a standardized error object
 * @param code Error code
 * @param message Human-readable error message
 * @param retryable Whether this error can be retried
 * @returns Standardized error object
 */
export function createError(
  code: string,
  message: string,
  retryable: boolean
): AIServiceError {
  // Ensure API connection errors always use AI_SERVICE_ERROR code
  if (message.toLowerCase().includes('api connection error')) {
    return { code: 'AI_SERVICE_ERROR', message, retryable };
  }
  
  return { code, message, retryable };
}

/**
 * Determine if an error is retryable
 * @param error The error to check
 * @returns True if the error is retryable
 */
export function isRetryableError(error: Error): boolean {
  // Network errors and server errors (5xx) are typically retryable
  // Client errors (4xx) except rate limiting (429) are not
  
  const message = error.message.toLowerCase();
  
  // Network errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('abort')
  ) {
    return true;
  }
  
  // Server errors
  if (message.includes('500') || message.includes('server error')) {
    return true;
  }
  
  // Rate limiting
  if (message.includes('429') || message.includes('rate limit')) {
    return true;
  }
  
  // Default to non-retryable
  return false;
}

/**
 * Standardize API connection errors
 * @param error The error to standardize
 * @returns Standardized error
 */
export function standardizeAPIError(error: unknown): ServiceError {
  // If it's already our format with the right code
  if (error && typeof error === 'object' && 'code' in error) {
    const errorObj = error as { code: unknown; message?: unknown };
    if (typeof errorObj.code === 'string' && errorObj.code === 'AI_SERVICE_ERROR') {
      return error as ServiceError;
    }
  }
  
  // If it's our format but with the wrong code for API errors
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const errorObj = error as { code: unknown; message: unknown };
    if (typeof errorObj.message === 'string' && 
        errorObj.message.toLowerCase().includes('api connection')) {
      return {
        code: 'AI_SERVICE_ERROR',
        message: errorObj.message,
        retryable: true
      };
    }
  }
  
  // If it's a standard Error
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('api connection') || 
        message.includes('network') || 
        message.includes('connection')) {
      return {
        code: 'AI_SERVICE_ERROR',
        message: 'API connection error',
        retryable: true
      };
    }
    
    return {
      code: 'AI_SERVICE_ERROR',
      message: error.message,
      retryable: isRetryableError(error)
    };
  }
  
  // Unknown error type
  return {
    code: 'AI_SERVICE_ERROR',
    message: 'Unknown API service error',
    retryable: false
  };
}