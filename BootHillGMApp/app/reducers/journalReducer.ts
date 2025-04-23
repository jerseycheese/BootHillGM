/**
 * Journal Reducer
 * 
 * Manages journal entries and quest logs
 */

import { GameAction } from '../types/actions';
import { JournalState } from '../types/state/journalState';
import { JournalEntry, NarrativeJournalEntry, CombatJournalEntry, InventoryJournalEntry, QuestJournalEntry } from '../types/journal';
import { ActionTypes } from '../types/actionTypes';

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
    ...(entry.narrativeSummary ? { narrativeSummary: entry.narrativeSummary } : { /* Intentionally empty */ })
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

// Define journal action types for backward compatibility
const JOURNAL_ACTION_TYPES = {
  ADD_ENTRY: ['journal/ADD_ENTRY', 'ADD_ENTRY'],
  REMOVE_ENTRY: ['journal/REMOVE_ENTRY', 'REMOVE_ENTRY'],
  UPDATE_ENTRY: ['journal/UPDATE_ENTRY', 'UPDATE_ENTRY', ActionTypes.UPDATE_JOURNAL],
  SET_ENTRIES: ['journal/SET_ENTRIES', 'SET_ENTRIES'],
  CLEAR_ENTRIES: ['journal/CLEAR_ENTRIES', 'CLEAR_ENTRIES']
};

/**
 * Helper function to check if action matches any of the possible types
 */
const isJournalAction = (action: GameAction, actionTypes: string[]): boolean => {
  return actionTypes.includes(action.type);
};

/**
 * Journal reducer
 */
const journalReducer = (state: JournalState = initialJournalState, action: GameAction): JournalState => {
  // Handle ADD_ENTRY action
  if (isJournalAction(action, JOURNAL_ACTION_TYPES.ADD_ENTRY)) {
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
  
  // Handle REMOVE_ENTRY action  
  if (isJournalAction(action, JOURNAL_ACTION_TYPES.REMOVE_ENTRY)) {
    if (!('payload' in action)) return state;
    
    const { id } = action.payload as { id: string };
    if (!id) return state;
    
    // Remove entry
    return {
      ...state,
      entries: state.entries.filter(entry => entry.id !== id)
    };
  }
  
  // Handle UPDATE_ENTRY action
  if (isJournalAction(action, JOURNAL_ACTION_TYPES.UPDATE_ENTRY)) {
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
  
  // Handle SET_ENTRIES action
  if (isJournalAction(action, JOURNAL_ACTION_TYPES.SET_ENTRIES)) {
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
  
  // Handle CLEAR_ENTRIES action
  if (isJournalAction(action, JOURNAL_ACTION_TYPES.CLEAR_ENTRIES)) {
    // Clear all entries
    return {
      ...state,
      entries: []
    };
  }
  
  return state;
};

export default journalReducer;