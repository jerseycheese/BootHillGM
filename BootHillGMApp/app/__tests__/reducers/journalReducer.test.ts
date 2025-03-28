/**
 * Journal Reducer Tests
 */

import { journalReducer } from '../../reducers/journal/journalReducer';
import { initialJournalState } from '../../types/state/journalState';
import { initialState } from '../../types/initialState';

import { journalAdapter } from '../../utils/stateAdapters';

import { adaptStateForTests, migrationAdapter } from '../../utils/stateAdapters';
import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';

// Helper function to process state through the reducer and adapter layer
const processState = (state: Partial<GameState>, action: GameAction) => {
  // Normalize state format
  const normalizedState = migrationAdapter.oldToNew(state) as GameState; // Assert as GameState
  
  // Apply the reducer - ensure journal exists and is JournalState
  const journalSlice = normalizedState.journal ? journalReducer(normalizedState.journal, action) : initialJournalState;
     
  // Create a state with the new journal slice
  const stateWithNewJournal: GameState = { // Ensure this conforms to GameState
    ...initialState, // Start with a full initial state structure
    ...normalizedState, // Overlay the normalized state
    journal: journalSlice // Apply the updated journal slice
  };
  
  // Apply adapters to get the final state
  const adaptedState = adaptStateForTests(stateWithNewJournal);
     
  return adaptedState;
};

describe('journalReducer', () => {
  // Base initial state that will be used in tests
  const createInitialState = () => ({
    journal: {
      entries: [
        { id: '1', title: 'First Entry', content: 'Test content', timestamp: 1615000000000, type: 'narrative' as const } // Added type
      ]
    }
  });

  test('should access entries as an iterable', () => {
    const initialState = createInitialState();
    const processedState = processState(initialState, { type: 'NO_OP' });
    
    // Entries should be iterable via the adapter
    const entriesArray = [...journalAdapter.getEntries(processedState)];
    
    expect(entriesArray.length).toBe(1);
    expect(entriesArray[0].title).toBe('First Entry');
  });

  test('should add a journal entry', () => {
    const initialState = createInitialState();
    
    const action = {
      type: 'journal/ADD_ENTRY',
      payload: { 
        id: '2', 
        title: 'Second Entry', 
        content: 'More test content', 
        timestamp: 1615100000000 
      }
    } as const;

    const newState = processState(initialState, action);

    // Check both the new structure and legacy structure
    expect(newState.journal.entries.length).toBe(2);
    
    // Also verify the entries can be accessed directly (backward compatibility)
    expect(journalAdapter.getEntries(newState).length).toBe(2);
    expect(journalAdapter.getEntries(newState)[1].title).toBe('Second Entry');
  });

  test('should remove a journal entry', () => {
    const initialState = createInitialState();
    
    const action = {
      type: 'journal/REMOVE_ENTRY',
      payload: { id: '1' }
    } as const;

    const newState = processState(initialState, action);

    // Check both access patterns
    expect(newState.journal.entries.length).toBe(0);
    expect(journalAdapter.getEntries(newState).length).toBe(0);
  });

  test('should update a journal entry', () => {
    const initialState = createInitialState();
    
    const action = {
      type: 'journal/UPDATE_ENTRY',
      payload: { 
        id: '1', 
        title: 'Updated Title', 
        content: 'Updated content' 
      }
    } as const;

    const newState = processState(initialState, action);

    // Check the entry was updated
    expect(journalAdapter.getEntries(newState)[0].title).toBe('Updated Title');
    expect(journalAdapter.getEntries(newState)[0].content).toBe('Updated content');
    // Should preserve existing properties
    expect(journalAdapter.getEntries(newState)[0].timestamp).toBe(1615000000000);
  });

  // Test with legacy array format for journal
  test('should handle legacy state format', () => {
    // Create a state with the old journal format (direct array)
    const legacyState = {
      journal: [
        { id: '1', title: 'Legacy Entry', content: 'Legacy content', timestamp: 1614000000000, type: 'narrative' as const } // Added type
      ]
    };

    const action = {
      type: 'journal/ADD_ENTRY',
      payload: { 
        id: '2', 
        title: 'New Entry', 
        content: 'New content', 
        timestamp: 1614100000000 
      }
    } as const;

    const newState = processState(legacyState, action);

    // Verify the state was adapted and action processed
    expect(journalAdapter.getEntries(newState).length).toBe(2);
    expect(journalAdapter.getEntries(newState)[0].title).toBe('Legacy Entry');
    expect(journalAdapter.getEntries(newState)[1].title).toBe('New Entry');
  });
});