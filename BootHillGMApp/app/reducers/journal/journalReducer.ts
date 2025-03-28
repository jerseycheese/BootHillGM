import { JournalState, initialJournalState } from '../../types/state/journalState';
import { GameAction } from '../../types/actions';
import { JournalEntry, JournalEntryType, BaseJournalEntry } from '../../types/journal';

/**
 * Helper function to create a valid journal entry with the necessary fields
 */
function createValidJournalEntry(data: Record<string, unknown>): JournalEntry {
  // Get the type from data or default to 'narrative'
  const entryType = (data.type as JournalEntryType) || 'narrative';
  
  // Create base entry with required fields
  const baseEntry: BaseJournalEntry = {
    id: typeof data.id === 'string' ? data.id : `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now(),
    content: typeof data.content === 'string' ? data.content : '',
  };
  
  // Preserve the title property for backward compatibility
  if (typeof data.title === 'string') {
    baseEntry.title = data.title;
  }
  
  if (typeof data.narrativeSummary === 'string') {
    baseEntry.narrativeSummary = data.narrativeSummary;
  }
  
  // Build the entry based on the type
  switch (entryType) {
    case 'combat': {
      // Safely handle the combatants object
      const combatantsObj = (data.combatants && typeof data.combatants === 'object') 
        ? data.combatants as Record<string, unknown>
        : {};
        
      // Safe type casting for outcome
      const outcomeValue = typeof data.outcome === 'string' && 
                        ['victory', 'defeat', 'escape', 'truce'].includes(data.outcome)
        ? data.outcome as 'victory' | 'defeat' | 'escape' | 'truce'
        : 'victory';
        
      return {
        ...baseEntry,
        type: 'combat',
        combatants: {
          player: typeof combatantsObj.player === 'string' 
            ? combatantsObj.player 
            : 'Unknown Player',
          opponent: typeof combatantsObj.opponent === 'string' 
            ? combatantsObj.opponent 
            : 'Unknown Opponent'
        },
        outcome: outcomeValue
      };
    }
    
    case 'inventory': {
      // Safely handle the items object
      const itemsObj = (data.items && typeof data.items === 'object') 
        ? data.items as Record<string, unknown>
        : {};
      
      // Safely cast arrays
      const acquiredItems = Array.isArray(itemsObj.acquired) 
        ? itemsObj.acquired.map(String)
        : [];
        
      const removedItems = Array.isArray(itemsObj.removed)
        ? itemsObj.removed.map(String)
        : [];
        
      return {
        ...baseEntry,
        type: 'inventory',
        items: {
          acquired: acquiredItems,
          removed: removedItems
        }
      };
    }
      
    case 'quest':
      return {
        ...baseEntry,
        type: 'quest',
        questTitle: typeof data.questTitle === 'string' ? data.questTitle : 'Unknown Quest',
        status: ['started', 'updated', 'completed', 'failed'].includes(data.status as string)
          ? data.status as 'started' | 'updated' | 'completed' | 'failed'
          : 'started'
      };
      
    case 'narrative':
    default:
      return {
        ...baseEntry,
        type: 'narrative'
      };
  }
}

/**
 * Converts unknown items to properly typed JournalEntry objects
 */
function ensureValidEntry(item: unknown): JournalEntry {
  if (typeof item !== 'object' || item === null) {
    // Create a default narrative entry if item is not an object
    return {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'narrative',
      timestamp: Date.now(),
      content: 'Unknown journal entry'
    };
  }
  
  // Convert the unknown object to a Record<string, unknown>
  return createValidJournalEntry(item as Record<string, unknown>);
}

/**
 * Ensures the state has a valid entries array
 */
function ensureEntriesArray(state: unknown): JournalState {
  // If state is null or undefined, use initial state
  if (!state) {
    return initialJournalState;
  }
  
  if (typeof state !== 'object') {
    return initialJournalState;
  }
  
  const stateObj = state as Record<string, unknown>;
  
  // If state is an array (legacy format), wrap it as entries
  if (Array.isArray(state)) {
    return { 
      entries: state.map(entry => ensureValidEntry(entry))
    };
  }
  
  // If state has journal object with entries array (new format)
  if (stateObj.journal && 
      typeof stateObj.journal === 'object' && 
      stateObj.journal !== null && 
      'entries' in stateObj.journal && 
      Array.isArray((stateObj.journal as Record<string, unknown>).entries)) {
    
    const journalEntries = (stateObj.journal as Record<string, unknown>).entries as unknown[];
    
    return {
      entries: journalEntries.map(entry => ensureValidEntry(entry))
    };
  }
  
  // If state has entries at the root level
  if ('entries' in stateObj && Array.isArray(stateObj.entries)) {
    return {
      entries: (stateObj.entries as unknown[]).map(entry => ensureValidEntry(entry))
    };
  }
  
  // If state already has entries property (as JournalState type), keep it
  if ('entries' in stateObj && typeof stateObj.entries === 'object') {
    return state as JournalState;
  }
  
  // If we can't find entries, return initial state
  return initialJournalState;
}

/**
 * Custom type guard for checking if an action has a payload
 */
function hasPayload<T>(action: GameAction): action is GameAction & { payload: T } {
  return 'payload' in action && action.payload !== undefined;
}

/**
 * Journal slice reducer
 * Handles all journal-related state updates
 */
export function journalReducer(
  state: JournalState = initialJournalState,
  action: GameAction
): JournalState {
  // Make sure we have a valid state structure before any operations
  const safeState = ensureEntriesArray(state);
  
  // Use action.type as a string for comparison
  const actionType = action.type as string;

  // UPDATE_JOURNAL
  if (actionType === 'UPDATE_JOURNAL') {
    if (!hasPayload<unknown>(action)) {
      return safeState;
    }
    
    const payload = action.payload;
    
    // Handle array replacement
    if (Array.isArray(payload)) {
      return {
        ...safeState,
        entries: payload.map(entry => ensureValidEntry(entry))
      };
    }
    
    // Handle single entry addition
    if (payload && typeof payload === 'object') {
      // Create a proper journal entry
      const newEntry = ensureValidEntry(payload);
      
      return {
        ...safeState,
        entries: [...safeState.entries, newEntry]
      };
    }
    
    // Default: return unchanged state
    return safeState;
  }
  
  // SET_STATE for state restoration
  else if (actionType === 'SET_STATE') {
    if (!hasPayload<Record<string, unknown>>(action)) {
      return safeState;
    }
    
    const payload = action.payload;
    
    // If there's no journal in the payload, return current state
    if (!('journal' in payload)) {
      return safeState;
    }
    
    // Ensure we have a valid entries array in the restored state
    return ensureEntriesArray(payload.journal);
  }
  
  // journal/ADD_ENTRY
  else if (actionType === 'journal/ADD_ENTRY') {
    if (!hasPayload<unknown>(action)) {
      return safeState;
    }
    
    const payload = action.payload;
    
    if (!payload || typeof payload !== 'object') {
      return safeState; // Invalid payload
    }
    
    const newEntry = ensureValidEntry(payload);
    return {
      ...safeState,
      entries: [...safeState.entries, newEntry]
    };
  }

  // journal/REMOVE_ENTRY
  else if (actionType === 'journal/REMOVE_ENTRY') {
    if (!hasPayload<{id?: string}>(action)) {
      return safeState;
    }
    
    const payload = action.payload;
    
    if (!payload || typeof payload !== 'object' || typeof payload.id !== 'string') {
      return safeState; // Invalid payload
    }
    
    const entryIdToRemove = payload.id;
    return {
      ...safeState,
      entries: safeState.entries.filter(entry => entry.id !== entryIdToRemove)
    };
  }

  // journal/UPDATE_ENTRY
  else if (actionType === 'journal/UPDATE_ENTRY') {
    if (!hasPayload<{id?: string}>(action)) {
      return safeState;
    }
    
    const payload = action.payload;
    
    if (!payload || typeof payload !== 'object' || typeof payload.id !== 'string') {
      return safeState; // Invalid payload
    }
    
    const updatedEntryData = payload;
    return {
      ...safeState,
      entries: safeState.entries.map(entry => {
        if (entry.id === updatedEntryData.id) {
          // Merge updates, ensuring the result is still a valid JournalEntry
          return ensureValidEntry({ ...entry, ...updatedEntryData });
        }
        return entry;
      })
    };
  }

  // Default case
  return safeState;
}
