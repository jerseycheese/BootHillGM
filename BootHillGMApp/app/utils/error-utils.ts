/**
 * Error utilities for AI services
 */

import { AIServiceError } from '../types/ai-service.types';

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
