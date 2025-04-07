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
  // Debug the entry coming in
  
  // Ensure we have required base fields
  const baseEntry = {
    id: entry.id || `entry_${Date.now()}`,
    timestamp: entry.timestamp || Date.now(),
    content: entry.content || '',
    title: entry.title || '',
    // CRITICAL FIX: Preserve narrativeSummary if it exists
    ...(entry.narrativeSummary ? { narrativeSummary: entry.narrativeSummary } : {})
  };
  
  
  // Create a properly typed entry based on the type field
  let typedEntry: JournalEntry;
  
  switch (entry.type) {
    case 'narrative': {
      const narrativeEntry = {
        ...baseEntry,
        type: 'narrative'
      } as NarrativeJournalEntry;
      
      // Explicitly preserve narrativeSummary for narrative entries
      if (entry.narrativeSummary) {
        narrativeEntry.narrativeSummary = entry.narrativeSummary;
      }
      
      typedEntry = narrativeEntry;
      break;
    }
      
    case 'combat': {
      typedEntry = {
        ...baseEntry,
        type: 'combat',
        combatants: entry.combatants || { player: '', opponent: '' },
        outcome: entry.outcome || 'victory'
      } as CombatJournalEntry;
      break;
    }
      
    case 'inventory': {
      typedEntry = {
        ...baseEntry,
        type: 'inventory',
        items: entry.items || { acquired: [], removed: [] }
      } as InventoryJournalEntry;
      break;
    }
      
    case 'quest': {
      typedEntry = {
        ...baseEntry,
        type: 'quest',
        questTitle: entry.questTitle || 'Unknown Quest',
        status: entry.status || 'started'
      } as QuestJournalEntry;
      break;
    }
      
    default: {
      // Default to narrative entry if no specific type is provided
      const defaultEntry = {
        ...baseEntry,
        type: 'narrative'
      } as NarrativeJournalEntry;
      
      // Explicitly preserve narrativeSummary for default narrative entries
      if (entry.narrativeSummary) {
        defaultEntry.narrativeSummary = entry.narrativeSummary;
      }
      
      typedEntry = defaultEntry;
    }
  }
  
  // Final verification check
  
  return typedEntry;
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
        entries: state.entries.map(entry => {
          if (entry.id === updateData.id) {
            // Create a new entry with all existing properties
            const updatedEntry = { ...entry, ...updateData } as JournalEntry;
            
            // Explicit check to preserve narrativeSummary if it exists in either source
            if (updateData.narrativeSummary || entry.narrativeSummary) {
              updatedEntry.narrativeSummary = updateData.narrativeSummary || entry.narrativeSummary;
            }
            
            return updatedEntry;
          }
          return entry;
        })
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