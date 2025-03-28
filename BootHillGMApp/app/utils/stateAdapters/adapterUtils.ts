/**
 * Utility functions for state adapters
 */

/**
 * Type guard to check if an object has fields that suggest it's in new format
 */
export const isNewFormatState = (state: unknown): boolean => {
  if (!state || typeof state !== 'object') return false;
  
  const stateObj = state as Record<string, unknown>;
  
  // Check for mandatory slice properties
  return Boolean(
    stateObj.character && 
    stateObj.inventory && 
    stateObj.journal && 
    stateObj.combat
  );
};