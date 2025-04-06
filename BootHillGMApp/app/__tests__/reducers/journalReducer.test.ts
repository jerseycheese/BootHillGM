/**
 * Journal Reducer Tests
 */

import { journalReducer } from '../../reducers/journal/journalReducer';
import { initialJournalState } from '../../types/state/journalState';
// import { initialState } from '../../types/initialState'; // Removed unused import

// Removed imports for non-existent adapters: journalAdapter, adaptStateForTests, migrationAdapter
// import { journalAdapter } from '../../utils/stateAdapters';
// import { adaptStateForTests, migrationAdapter } from '../../utils/stateAdapters';
import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';

// Helper function to process state through the reducer and adapter layer
// Simplified helper: directly apply reducer to the journal slice
const processJournalState = (state: Partial<GameState>, action: GameAction) => {
  // Assume state.journal exists and is in the correct format for the reducer
  const journalState = state.journal || initialJournalState;
  return journalReducer(journalState, action);
};

describe('journalReducer', () => {
  // Base initial state that will be used in tests
  // Base initial state slice for journal tests
  const createInitialJournalState = () => ({
    entries: [
      { id: '1', title: 'First Entry', content: 'Test content', timestamp: 1615000000000, type: 'narrative' as const }
    ]
  });

  test('should access entries as an iterable', () => {
    const initialJournal = createInitialJournalState();
    // Pass only the relevant slice to the simplified helper
    const newState = processJournalState({ journal: initialJournal }, { type: 'NO_OP' });
    
    // Access entries directly from the returned journal state slice
    expect(newState.entries).toBeDefined();
    expect(Array.isArray(newState.entries)).toBe(true); // Ensure it's an array
    expect(newState.entries.length).toBe(1);
    expect(newState.entries[0].title).toBe('First Entry');
  });

  test('should add a journal entry', () => {
    const initialJournal = createInitialJournalState();
    
    const action = {
      type: 'journal/ADD_ENTRY',
      payload: { 
        id: '2', 
        title: 'Second Entry', 
        content: 'More test content', 
        timestamp: 1615100000000,
        type: 'narrative' // Explicitly add type
      }
    } as const;

    const newState = processJournalState({ journal: initialJournal }, action);

    // Check the new structure directly
    expect(newState.entries.length).toBe(2);
    expect(newState.entries[1].title).toBe('Second Entry');
  });

  test('should remove a journal entry', () => {
    const initialJournal = createInitialJournalState();
    
    const action = {
      type: 'journal/REMOVE_ENTRY',
      payload: { id: '1' }
    } as const;

    const newState = processJournalState({ journal: initialJournal }, action);

    // Check direct access
    expect(newState.entries.length).toBe(0);
  });

  test('should update a journal entry', () => {
    const initialJournal = createInitialJournalState();
    
    const action = {
      type: 'journal/UPDATE_ENTRY',
      payload: { 
        id: '1', 
        title: 'Updated Title', 
        content: 'Updated content',
        type: 'narrative' // Explicitly add type
      }
    } as const;

    const newState = processJournalState({ journal: initialJournal }, action);

    // Check the entry was updated directly
    expect(newState.entries[0].title).toBe('Updated Title');
    expect(newState.entries[0].content).toBe('Updated content');
    // Should preserve existing properties
    expect(newState.entries[0].timestamp).toBe(1615000000000);
  });

  // Removed obsolete test for legacy state format
});