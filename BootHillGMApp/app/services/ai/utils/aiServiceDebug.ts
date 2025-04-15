/**
 * Debug utility functions for AI service
 */

/**
 * Debug logging function for AI Service
 * Logs debugging information with service prefix
 * 
 * @param args Arguments to log
 */
export const debug = (...args: Parameters<typeof console.log>): void => {
  console.log('[DEBUG AIService]', ...args);
};
