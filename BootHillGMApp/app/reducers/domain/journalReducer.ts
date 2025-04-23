/**
 * Journal Reducer
 * 
 * Handles all journal-related state changes including adding, removing, 
 * and updating journal entries to record game events and progress.
 */

import { GameState } from '../../types/gameState';
import { GameAction } from '../../types/actions';
import { ActionTypes } from '../../types/actionTypes';
import { JournalEntry, NarrativeJournalEntry } from '../../types/journal';

/**
 * Process journal-related actions
 * 
 * @param state Current game state
 * @param action Game action to process
 * @returns Updated game state
 */
export function journalReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ActionTypes.ADD_ENTRY: {
      const entry = action.payload as JournalEntry;
      return {
        ...state,
        journal: {
          ...state.journal,
          entries: [...state.journal.entries, entry]
        }
      };
    }
      
    case ActionTypes.REMOVE_ENTRY:
      return {
        ...state,
        journal: {
          ...state.journal,
          entries: state.journal.entries.filter(entry => entry.id !== action.payload)
        }
      };
      
    case ActionTypes.UPDATE_JOURNAL_GENERAL: {
      // Handle different payload formats
      let text = '';
      let summary = 'A new adventure begins';
      
      if (typeof action.payload === 'string') {
        text = action.payload;
      } else if (action.payload && typeof action.payload === 'object') {
        const p = action.payload as Record<string, unknown>;
        text = typeof p.text === 'string' ? p.text : 
               typeof p.content === 'string' ? p.content : '';
        summary = typeof p.summary === 'string' ? p.summary : summary;
      }
      
      // Add a new entry with the provided content
      const timestamp = Date.now();
      const newEntry: NarrativeJournalEntry = {
        id: `entry_${timestamp}`,
        title: 'Untitled Entry',
        content: text,
        timestamp,
        type: 'narrative',
        narrativeSummary: summary
      };
      
      return {
        ...state,
        journal: {
          ...state.journal,
          entries: [...state.journal.entries, newEntry]
        }
      };
    }
      
    case ActionTypes.CLEAR_ENTRIES:
      return {
        ...state,
        journal: {
          ...state.journal,
          entries: []
        }
      };
      
    default:
      return state;
  }
}
