/**
 * Action Type Test Utilities
 * 
 * This file provides helper functions for working with the standardized ActionTypes 
 * in test environments, enabling easier transitions for tests during the migration.
 */

import { ActionTypes } from '../../types/actionTypes';

/**
 * Maps legacy string action types to the standardized ActionTypes constants.
 * This is useful for tests that might be using string literals instead of the constants.
 * 
 * @param legacyType - The legacy string action type (e.g., 'START_NARRATIVE_ARC')
 * @returns The corresponding ActionTypes constant or the original string if not found
 */
export function getStandardizedActionType(legacyType: string): string {
  // Strip domain prefix if it exists (e.g., 'narrative/START_NARRATIVE_ARC' -> 'START_NARRATIVE_ARC')
  const actionName = legacyType.includes('/') ? legacyType.split('/')[1] : legacyType;
  
  // Find the corresponding key in ActionTypes
  const entries = Object.entries(ActionTypes);
  const match = entries.find(([key, value]) => {
    // Match either by full string or by the action name part
    return value === legacyType || key === actionName;
  });
  
  return match ? match[1] : legacyType;
}

/**
 * Creates an action object using the standardized ActionTypes.
 * This is a helper for tests to easily create properly-typed actions.
 * 
 * @param type - The action type (can be a string from ActionTypes or a legacy string)
 * @param payload - The action payload (optional)
 * @returns A properly formatted action object
 */
export function createTestAction<T = any>(
  type: string,
  payload?: T
): { type: string; payload?: T } {
  // Convert the action type to the standardized version
  const standardizedType = getStandardizedActionType(type);
  
  // Create the action with or without a payload
  return payload !== undefined
    ? { type: standardizedType, payload }
    : { type: standardizedType };
}

/**
 * Simplified mock version of the narrativeReducer function for testing
 * Helps with testing action types without requiring the full reducer logic
 * 
 * @param state - The current state
 * @param action - The action to process
 * @returns The updated state with actionProcessed flag set to true
 */
export function mockReducerForActionTypeTests(
  state: any = {},
  action: { type: string; payload?: any }
): any {
  // Set a flag indicating that the action was processed
  return {
    ...state,
    actionProcessed: true,
    lastAction: action
  };
}
