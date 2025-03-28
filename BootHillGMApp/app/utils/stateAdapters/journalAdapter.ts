import { GameState } from '../../types/gameState';
import { JournalEntry } from '../../types/journal';
import { LegacyState } from './stateAdapterTypes';

/**
 * Journal State Adapter
 *
 * Makes the journal entries accessible in the old format.
 */
export const journalAdapter = {
  // Getter to adapt new state to old state shape
  getEntries: (state: GameState): JournalEntry[] => {
    // For safety, type guard all our checks
    if (!state) return [];
    
    // Check for journal entries in the new structure
    if (state.journal && 'entries' in state.journal && Array.isArray(state.journal.entries)) {
      return state.journal.entries as JournalEntry[];
    }
    
    // Check for entries at the root level
    const legacyState = state as unknown as LegacyState;
    if ('entries' in legacyState && Array.isArray(legacyState.entries)) {
      return legacyState.entries as JournalEntry[];
    }
    
    // Check for legacy array format
    if (Array.isArray(state.journal)) {
      return state.journal as JournalEntry[];
    }
    
    // Default to empty array
    return [];
  },
  
  // Adapter method to create a state object with proper entries
  adaptForTests: (state: GameState) => {
    if (!state) return state;
    
    // Directly get the entries without proxying
    const entries = journalAdapter.getEntries(state);
    
    // Create a new state with entries at both levels for compatibility
    return {
      ...state,
      // Add entries at root level for legacy access
      entries: entries,
      // Add entries in journal object for new structure
      journal: {
        ...state.journal,
        entries: entries
      }
    };
  }
};