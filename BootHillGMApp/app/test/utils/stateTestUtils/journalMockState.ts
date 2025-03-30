/**
 * Journal-related mock states for testing
 * Provides pre-configured journal states for test scenarios
 */
import { BaseMockState } from './types';
import { createBasicMockState } from './baseMockState';
import { JournalEntry as AppJournalEntry } from '../../../types/journal';

/**
 * Creates a mock state with journal entries
 * 
 * @returns {BaseMockState} A state with sample journal entries for testing
 */
export function createJournalMockState(): BaseMockState {
  const baseState: BaseMockState = createBasicMockState();
  
  return {
    ...baseState,
    journal: {
      entries: [
        { 
          content: 'Test content 1', 
          timestamp: 1615000000000, 
          type: 'narrative'
        },
        { 
          content: 'Test content 2', 
          timestamp: 1615100000000, 
          type: 'quest',
          questTitle: 'Test Quest',
          status: 'started'
        }
      ] as AppJournalEntry[]
    }
  };
}