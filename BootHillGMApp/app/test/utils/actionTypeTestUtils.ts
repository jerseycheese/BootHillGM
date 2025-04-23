/**
 * Action Type Test Utilities
 * 
 * Helper functions for testing standardized action types compatibility
 */

import { Reducer } from 'react';
import { Action } from '../../types/actions';

/**
 * Type definition for any action to use in test utilities
 */

/**
 * Tests if a reducer handles both legacy string literals and standardized ActionTypes constants
 * 
 * @param reducer The reducer function to test
 * @param initialState The initial state to use for testing
 * @param legacyType The legacy string literal action type
 * @param standardType The standardized ActionType constant
 * @param payload The payload to include in the test actions
 * @returns boolean indicating if both action types produce equivalent results
 */
export function testReducerCompatibility<S, P>(
  reducer: Reducer<S, Action<string, any>>, // Use Action<string, any> directly
  initialState: S,
  legacyType: string,
  standardType: string, 
  payload: P
): boolean {
  // Test with legacy type
  const legacyResult = reducer(initialState, {
    type: legacyType,
    payload
  });

  // Test with standardized type
  const standardResult = reducer(initialState, {
    type: standardType,
    payload
  });

  // Compare results - using JSON.stringify for deep comparison
  return JSON.stringify(legacyResult) === JSON.stringify(standardResult);
}

/**
 * Creates a mock dispatch function for testing that components use ActionTypes constants
 * 
 * @returns An object containing the mock dispatch function and utilities for assertions
 */
export function createMockDispatch() {
  const dispatchedActions: Action<string, any>[] = []; // Use Action<string, any> directly
  
  const mockDispatch = jest.fn((action: Action<string, any>) => { // Use Action<string, any> directly
    dispatchedActions.push(action);
    return action;
  });

  return {
    dispatch: mockDispatch,
    dispatchedActions,
    
    /**
     * Check if an action with the given type was dispatched
     */
    wasActionDispatched: (type: string): boolean => {
      return dispatchedActions.some(action => action.type === type);
    },
    
    /**
     * Get all dispatched actions of a specific type
     */
    getActionsByType: (type: string): Action<string, any>[] => { // Use Action<string, any> directly
      return dispatchedActions.filter(action => action.type === type);
    },
    
    /**
     * Reset the dispatched actions
     */
    reset: () => {
      dispatchedActions.length = 0;
      mockDispatch.mockClear();
    }
  };
}
