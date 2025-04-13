/**
 * Storage Utilities
 * 
 * Common helper functions for localStorage operations.
 * Provides type-safe storage access with error handling.
 */

/**
 * Debug console function for internal logging
 */
const debug = (...args: Array<unknown>): void => {
  console.log('[DEBUG StorageUtils]', ...args);
};

/**
 * Get item from localStorage with type safety and error handling.
 * 
 * @param key - Storage key to retrieve
 * @param defaultValue - Default value to return if not found or error
 * @returns - Parsed item or default value
 */
const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    return JSON.parse(item) as T;
  } catch (e) {
    debug(`Error retrieving ${key}:`, e);
    return defaultValue;
  }
};

/**
 * Save item to localStorage with error handling.
 * 
 * @param key - Storage key to save to
 * @param value - Value to save
 * @returns - Success boolean
 */
const setItem = <T>(key: string, value: T): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    debug(`Error saving to ${key}:`, e);
    return false;
  }
};

/**
 * Get a nested property from an object using a path string.
 * Safely navigates object structure using dot notation.
 * 
 * @param obj - Object to extract from
 * @param path - Dot-notation path (e.g., 'character.player.name')
 * @returns - Extracted value or undefined
 */
const getNestedProperty = <T>(
  obj: Record<string, unknown>, 
  path: string
): T | undefined => {
  if (!obj || typeof obj !== 'object') return undefined;
  
  const parts = path.split('.');
  let current: Record<string, unknown> | unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    
    current = (current as Record<string, unknown>)[part];
  }
  
  return current as T;
};

/**
 * Check if a property exists at a path within an object.
 * Safely verifies each part of the path exists.
 * 
 * @param obj - Object to check
 * @param path - Dot-notation path
 * @returns - True if property exists
 */
const hasPropertyAtPath = (obj: Record<string, unknown>, path: string): boolean => {
  const parts = path.split('.');
  let current: Record<string, unknown> | unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return false;
    }
    
    if (!(part in (current as Record<string, unknown>))) {
      return false;
    }
    
    current = (current as Record<string, unknown>)[part];
  }
  
  return true;
};

/**
 * Public API for storage utility functions.
 */
export const storageUtils = {
  getItem,
  setItem,
  getNestedProperty,
  hasPropertyAtPath,
  debug
};
