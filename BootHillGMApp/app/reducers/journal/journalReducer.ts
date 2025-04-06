import { JournalState, initialJournalState } from '../../types/state/journalState';
import { GameAction } from '../../types/actions';
import { JournalEntry, JournalEntryType, RawJournalEntry } from '../../types/journal';

/**
 * Validates and converts raw journal entries to properly typed JournalEntry objects.
 * Ensures entries have required fields and correct types, preserving narrativeSummary.
 *
 * @param rawEntry - The potentially untyped journal entry data.
 * @returns A validated and typed JournalEntry object.
 */
/**
 * Validates and converts raw journal entries to properly typed JournalEntry objects
 * This ensures that all entries have the correct type and required properties
 */
function validateAndConvertEntry(rawEntry: RawJournalEntry): JournalEntry {
  // Create a unique ID if one wasn't provided
  const id = rawEntry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = rawEntry.timestamp || Date.now();
  const content = rawEntry.content || '';
  
  // Ensure we have a valid entry type or default to narrative
  let entryType: JournalEntryType = 'narrative';
  if (rawEntry.type === 'combat' || rawEntry.type === 'inventory' || rawEntry.type === 'quest') {
    entryType = rawEntry.type;
  }
  
  // Create the appropriate entry type based on the determined entry type
  let journalEntry: JournalEntry;
  
  switch (entryType) {
    case 'combat':
      journalEntry = {
        id,
        timestamp,
        content,
        type: 'combat',
        combatants: rawEntry.combatants || { player: '', opponent: '' },
        outcome: (rawEntry.outcome as 'victory' | 'defeat' | 'escape' | 'truce') || 'victory'
      };
      break;
      
    case 'inventory':
      journalEntry = {
        id,
        timestamp,
        content,
        type: 'inventory',
        items: rawEntry.items || { acquired: [], removed: [] }
      };
      break;
      
    case 'quest':
      journalEntry = {
        id,
        timestamp,
        content,
        type: 'quest',
        questTitle: rawEntry.questTitle || 'Unknown Quest',
        status: (rawEntry.status as 'started' | 'updated' | 'completed' | 'failed') || 'started'
      };
      break;
      
    default:
      journalEntry = {
        id,
        timestamp,
        content,
        type: 'narrative'
      };
  }
  
  // Add narrativeSummary if it exists in the raw entry
  if (rawEntry.narrativeSummary) {
    (journalEntry as JournalEntry & { narrativeSummary?: string }).narrativeSummary = rawEntry.narrativeSummary;
  }
  
  return journalEntry;
}

/**
 * Journal slice reducer
 * Handles all journal-related state updates
 */
export function journalReducer(
  state: JournalState = initialJournalState,
  action: GameAction
): JournalState {
  const actionType = action.type as string;
  

  // Handle journal/ADD_ENTRY - explicitly handle the narrativeSummary property
  if (actionType === 'journal/ADD_ENTRY' && 'payload' in action && action.payload) {
    // Extract the payload
    const payload = action.payload;
    
    // Enhanced debug logging
    
    if (typeof payload !== 'object' || payload === null) {
      return state;
    }
    
    // Cast payload to a type-safe structure
    const entryData = payload as RawJournalEntry;
    
    // Debug logging for narrativeSummary
    
    // Create a properly typed journal entry
    const newEntry = validateAndConvertEntry(entryData);
    
    // Debug the final entry object
    
    // Add the entry to the state
    return {
      ...state,
      entries: [...state.entries, newEntry]
    };
  }
  
  // Handle other action types
  switch (actionType) {
    case 'UPDATE_JOURNAL':
    case 'journal/UPDATE_JOURNAL': {
      if (!('payload' in action) || !action.payload) {
        return state;
      }
      
      const payload = action.payload;
      
      // Handle array replacement
      if (Array.isArray(payload)) {
        // Process each entry to ensure they are properly typed
        const newEntries = payload.map(entry => validateAndConvertEntry(entry as RawJournalEntry));
        
        return {
          ...state,
          entries: newEntries
        };
      }
      
      // Handle single entry addition
      if (payload && typeof payload === 'object') {
        const newEntry = validateAndConvertEntry(payload as RawJournalEntry);
        
        return {
          ...state,
          entries: [...state.entries, newEntry]
        };
      }
      
      return state;
    }
    
    case 'SET_STATE': {
      if (!('payload' in action) || !action.payload || typeof action.payload !== 'object') {
        return state;
      }
      
      const payload = action.payload as Record<string, unknown>;
      
      if (!('journal' in payload)) {
        return state;
      }
      
      const journal = payload.journal;
      
      if (typeof journal === 'object' && journal !== null && 'entries' in journal) {
        const journalObj = journal as Record<string, unknown>;
        
        if (Array.isArray(journalObj.entries)) {
          // Process each entry to ensure they are properly typed
          const entries = journalObj.entries.map(entry => 
            validateAndConvertEntry(entry as RawJournalEntry)
          );
          
          return {
            entries
          };
        }
      }
      
      return state;
    }
    
    case 'journal/REMOVE_ENTRY': {
      if (!('payload' in action) || !action.payload || typeof action.payload !== 'object') {
        return state;
      }
      
      const payload = action.payload as Record<string, unknown>;
      
      if (typeof payload.id !== 'string') {
        return state;
      }
      
      return {
        ...state,
        entries: state.entries.filter(entry => entry.id !== payload.id)
      };
    }
    
    case 'journal/UPDATE_ENTRY': {
      if (!('payload' in action) || !action.payload || typeof action.payload !== 'object') {
        return state;
      }
      
      const payload = action.payload as RawJournalEntry;
      
      if (typeof payload.id !== 'string') {
        return state;
      }
      
      return {
        ...state,
        entries: state.entries.map(entry => {
          if (entry.id === payload.id) {
            // Create a properly typed updated entry
            // Start with the existing entry properties
            const baseEntry = { ...entry };
            
            // Create a raw entry with both existing and new properties
            const combinedRawEntry: RawJournalEntry = {
              ...baseEntry,
              ...payload
            };
            
            // Validate and convert to a proper typed entry
            return validateAndConvertEntry(combinedRawEntry);
          }
          return entry;
        })
      };
    }
    
    default:
      return state;
  }
}