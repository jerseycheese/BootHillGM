/**
 * Mock data and utilities for brawling tests
 * 
 * This file provides mock data, type guards, and utilities used across
 * all brawling test files. It centralizes the mock setup to ensure consistent
 * test data and behavior.
 * 
 * @module BrawlingMocks
 */

import { getDefaultBrawlingState } from '../../../../test/utils/combatTestUtils';
import { CombatLogEntry } from '../../../../types/combat';
import { UpdateCharacterPayload, GameEngineAction } from '../../../../types/gameActions';

// Re-export the utility from combatTestUtils
export const getDefaultState = getDefaultBrawlingState;

/**
 * Type guard for UPDATE_CHARACTER action
 * Determines if an action is an UPDATE_CHARACTER action with payload
 * 
 * @param action - The game engine action to check
 * @returns True if action is UPDATE_CHARACTER with payload
 */
export const isUpdateCharacterAction = (action: GameEngineAction): action is { 
  type: "UPDATE_CHARACTER"; 
  payload: UpdateCharacterPayload 
} => {
  return action.type === "UPDATE_CHARACTER" && 'payload' in action;
};

/**
 * Creates mock dispatch and callback functions for tests
 * 
 * @returns Object containing mock functions
 */
export const setupMocks = (): { 
  mockDispatch: jest.Mock; 
  mockOnCombatEnd: jest.Mock;
} => {
  const mockDispatch = jest.fn();
  const mockOnCombatEnd = jest.fn();
  
  return {
    mockDispatch,
    mockOnCombatEnd
  };
};

/**
 * Creates a mock combat log entry with default values
 * 
 * @param text - The text content of the log entry
 * @param type - The type of log entry (hit, miss, info)
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns A mock CombatLogEntry object
 */
export const createLogEntry = (
  text: string, 
  type: 'hit' | 'miss' | 'info' = 'hit',
  timestamp = Date.now()
): CombatLogEntry => ({
  text,
  type,
  timestamp
});

// Add a simple test to satisfy Jest
describe('Mock utilities', () => {
  it('provides mock functionality', () => {
    expect(createLogEntry).toBeDefined();
    expect(isUpdateCharacterAction).toBeDefined();
  });
});
