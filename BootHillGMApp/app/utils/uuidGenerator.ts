/**
 * Utility for generating UUIDs that can be easily mocked in tests
 */

/**
 * Fallback UUID generation for environments where crypto.randomUUID is not available
 */
function generateFallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generates a UUID using crypto.randomUUID when available, falling back to a simple implementation
 * This function can be easily mocked in tests without trying to mock the crypto API
 */
export const generateUUID = (): string => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for testing environments
  return generateFallbackUUID();
};
