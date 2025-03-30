/**
 * Narrative Error Handling Utilities
 * 
 * This file contains utility functions for creating and handling narrative errors.
 * Uses similar conventions to the app-wide error-utils.ts for consistency.
 */

import { NarrativeErrorInfo, NarrativeErrorType } from '../../types/narrative.types';

/**
 * Type for context object in narrative errors
 */
export type NarrativeErrorContext = Record<string, string | number | boolean | string[] | number[] | undefined>;

/**
 * Creates a NarrativeErrorInfo object with the given code, message, and context.
 * Follows the pattern established in error-utils.ts for consistent error handling.
 * 
 * @param code - The error code
 * @param message - The error message
 * @param context - Optional context object with additional error information
 * @returns A NarrativeErrorInfo object
 */
export function createNarrativeError(
  code: NarrativeErrorType,
  message: string,
  context?: NarrativeErrorContext
): NarrativeErrorInfo {
  return {
    code,
    message,
    context: context || {},
    timestamp: Date.now()
  };
}

/**
 * Checks if a narrative error should be displayed to the user
 * 
 * @param error - The error to check
 * @returns True if the error should be displayed to the user
 */
export function isUserVisibleError(error: NarrativeErrorInfo): boolean {
  // These error types should be shown to the user
  const userVisibleErrors: NarrativeErrorType[] = [
    'invalid_navigation',
    'invalid_choice',
    'arc_not_found',
    'branch_not_found',
    'decision_not_found'
  ];
  
  return userVisibleErrors.includes(error.code);
}

/**
 * Formats a narrative error for display to the user
 * 
 * @param error - The error to format
 * @returns User-friendly error message
 */
export function formatErrorForUser(error: NarrativeErrorInfo): string {
  switch (error.code) {
    case 'invalid_navigation':
      return 'Unable to navigate to the requested story point.';
    case 'invalid_choice':
      return 'The selected choice is not available.';
    case 'arc_not_found':
      return 'The requested narrative arc could not be found.';
    case 'branch_not_found':
      return 'The requested narrative branch could not be found.';
    case 'decision_not_found':
      return 'The specified decision could not be found.';
    case 'decision_mismatch':
      return 'There was a mismatch between the current decision and the provided decision.';
    case 'validation_failed':
      return 'The operation failed due to invalid data.';
    case 'state_corruption':
      return 'An error occurred while processing narrative state.';
    case 'system_error':
      return 'A system error occurred while processing the narrative.';
    default:
      return 'An unexpected error occurred in the narrative system.';
  }
}