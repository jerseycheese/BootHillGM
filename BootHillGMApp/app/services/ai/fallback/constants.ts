/**
 * Fallback Service Constants
 * 
 * This file contains configuration values, enums, and constants used by the fallback service.
 * The fallback service provides responses when the AI service is unavailable or times out.
 * 
 * @module services/ai/fallback
 */

// Maximum time to wait for AI response before returning a fallback
export const AI_RESPONSE_TIMEOUT_MS = 15000; // 15 seconds

/**
 * Response context types that determine the type of fallback response to generate.
 * Each context represents a different kind of player action or game state.
 */
export enum ResponseContextType {
  INITIALIZING = 'initializing',
  LOOKING = 'looking',
  MOVEMENT = 'movement',
  TALKING = 'talking',
  INVENTORY = 'inventory',
  GENERIC = 'generic'
}

// Default location name used in fallback responses
export const DEFAULT_LOCATION_NAME = 'Boothill';
