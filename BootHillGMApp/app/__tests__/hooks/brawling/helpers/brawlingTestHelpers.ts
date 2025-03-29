/**
 * Helper functions for brawling tests
 * 
 * This file provides utility functions used across brawling test files
 * to create consistent mock behavior and reduce duplication.
 * 
 * @module BrawlingTestHelpers
 */

import { CombatLogEntry } from '../../../../types/combat';
import { createLogEntry } from '../__mocks__/brawlingMocks';

/**
 * Creates a mock for processRound with custom log entries
 * Simulates a typical round of combat by adding log entries through the dispatcher
 * 
 * @param mockDispatch - The mock dispatch function
 * @returns A mock function simulating processRound behavior
 */
export const createProcessRoundMock = (mockDispatch: jest.Mock): jest.Mock => {
  return jest.fn().mockImplementation(async () => {
    // Add hit entry first
    mockDispatch({
      type: 'ADD_LOG_ENTRY',
      entry: createLogEntry(
        'Player punches with Solid Hit (Roll: 15)', 
        'hit'
      )
    });
    
    // Add info entry at the end
    mockDispatch({
      type: 'ADD_LOG_ENTRY',
      entry: createLogEntry(
        'Round 1 complete',
        'info', 
        Date.now() + 1
      )
    });
  });
};

/**
 * Simulate brawling roundLog entry additions
 * This follows the behavior in brawlingReducer.ts including duplicate detection
 * 
 * @param mockDispatch - The mock dispatch function  
 * @param mockRoundLog - The round log array to update
 * @returns A function that simulates dispatchBrawling behavior
 */
export const addMockLogEntries = (
  mockDispatch: jest.Mock,
  mockRoundLog: CombatLogEntry[]
): (action: {
  type: string;
  entry?: CombatLogEntry;
  [key: string]: unknown;
}) => void => {
  const mockDispatchBrawling = (action: {
    type: string;
    entry?: CombatLogEntry;
    [key: string]: unknown;
  }) => {
    if (action.type === 'ADD_LOG_ENTRY' && action.entry) {
      // Check for duplicate entries, matching logic in brawlingReducer.ts
      const isDuplicate = mockRoundLog.some(
        entry => entry.timestamp === action.entry?.timestamp && 
                entry.text === action.entry?.text
      );
      
      if (!isDuplicate) {
        mockRoundLog.push(action.entry);
      }
    } else if (action.type === 'END_ROUND') {
      // Follow logic in brawlingReducer for END_ROUND
    }
    
    mockDispatch(action);
  };
  
  return mockDispatchBrawling;
};

// Add a simple test to satisfy Jest
describe('Brawling test helpers', () => {
  it('provides helper functions', () => {
    expect(createProcessRoundMock).toBeDefined();
    expect(addMockLogEntries).toBeDefined();
  });
});
