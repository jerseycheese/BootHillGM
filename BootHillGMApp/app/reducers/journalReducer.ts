/**
 * Journal Reducer
 * 
 * Manages journal entries and quest logs
 */

import { GameAction } from '../types/actions';
import { JournalState } from '../types/state/journalState';
import { JournalEntry, NarrativeJournalEntry, CombatJournalEntry, InventoryJournalEntry, QuestJournalEntry } from '../types/journal';

/**
 * Initial state for the journal reducer
 */
export const initialJournalState: JournalState = {
  entries: []
};

/**
 * Create a properly typed journal entry
 */
function createTypedJournalEntry(entry: Partial<JournalEntry>): JournalEntry {
  // Ensure we have required base fields
  const baseEntry = {
    id: entry.id || `entry_${Date.now()}`,
    timestamp: entry.timestamp || Date.now(),
    content: entry.content || '',
    title: entry.title || ''
  };
  
  // Create a properly typed entry based on the type field
  switch (entry.type) {
    case 'narrative':
      return {
        ...baseEntry,
        type: 'narrative'
      } as NarrativeJournalEntry;
      
    case 'combat':
      return {
        ...baseEntry,
        type: 'combat',
        combatants: entry.combatants || { player: '', opponent: '' },
        outcome: entry.outcome || 'victory'
      } as CombatJournalEntry;
      
    case 'inventory':
      return {
        ...baseEntry,
        type: 'inventory',
        items: entry.items || { acquired: [], removed: [] }
      } as InventoryJournalEntry;
      
    case 'quest':
      return {
        ...baseEntry,
        type: 'quest',
        questTitle: entry.questTitle || 'Unknown Quest',
        status: entry.status || 'started'
      } as QuestJournalEntry;
      
    default:
      // Default to narrative entry if no specific type is provided
      return {
        ...baseEntry,
        type: 'narrative'
      } as NarrativeJournalEntry;
  }
}

/**
 * Journal reducer
 */
const journalReducer = (state: JournalState = initialJournalState, action: GameAction): JournalState => {
  switch (action.type) {
    case 'journal/ADD_ENTRY': {
      if (!('payload' in action)) return state;
      
      const entryData = action.payload as Partial<JournalEntry>;
      if (!entryData) return state;
      
      // Create a properly typed entry
      const typedEntry = createTypedJournalEntry(entryData);
      
      // Add new entry
      return {
        ...state,
        entries: [...state.entries, typedEntry]
      };
    }
    
    case 'journal/REMOVE_ENTRY': {
      if (!('payload' in action)) return state;
      
      const { id } = action.payload as { id: string };
      if (!id) return state;
      
      // Remove entry
      return {
        ...state,
        entries: state.entries.filter(entry => entry.id !== id)
      };
    }
    
    case 'journal/UPDATE_ENTRY': {
      if (!('payload' in action)) return state;
      
      const updateData = action.payload as Partial<JournalEntry> & { id: string };
      if (!updateData || !updateData.id) return state;
      
      // Update entry
      return {
        ...state,
        entries: state.entries.map(entry => 
          entry.id === updateData.id 
            ? { ...entry, ...updateData } as JournalEntry
            : entry
        )
      };
    }
    
    case 'journal/SET_ENTRIES': {
      if (!('payload' in action)) return state;
      
      const entriesData = action.payload as JournalEntry[];
      if (!entriesData) return state;
      
      // Ensure all entries are properly typed
      const typedEntries = entriesData.map(entry => 
        createTypedJournalEntry(entry)
      );
      
      // Set all entries
      return {
        ...state,
        entries: typedEntries
      };
    }
    
    case 'journal/CLEAR_ENTRIES': {
      // Clear all entries
      return {
        ...state,
        entries: []
      };
    }
    
    default:
      return state;
  }
};

export default journalReducer;