/**
 * State adapters for testing
 */
import { GameState } from '../../../types/gameState';
import { InventoryItem } from '../../../types/item.types';
import { JournalEntry as AppJournalEntry } from '../../../types/journal';
import { TestJournalEntry } from './types';

/**
 * Helper function to convert test journal entries to app journal entries
 */
export function convertToAppJournalEntries(entries: (TestJournalEntry | Record<string, unknown>)[]): AppJournalEntry[] {
  return entries.map(entry => {
    // Create a base journal entry
    const baseEntry: Partial<AppJournalEntry> = {
      timestamp: 'timestamp' in entry ? Number(entry.timestamp) : Date.now(),
      content: 'content' in entry ? String(entry.content) : 
               ('title' in entry ? String(entry.title) : 'No content'),
      type: 'type' in entry ? entry.type as AppJournalEntry['type'] : 'narrative'
    };
    
    // For quest entries
    if (baseEntry.type === 'quest') {
      return {
        ...baseEntry,
        type: 'quest',
        questTitle: 'questTitle' in entry ? String(entry.questTitle) : 'Unknown Quest',
        status: 'status' in entry ? entry.status as 'started' | 'updated' | 'completed' | 'failed' : 'started'
      } as AppJournalEntry;
    }
    
    // For other entry types (simplified)
    return {
      ...baseEntry
    } as AppJournalEntry;
  });
}

/**
 * Adapts inventory state for backward compatibility
 */
export function adaptInventoryForTesting(state: GameState): GameState {
  if (!state.inventory?.items) return state;
  
  const adaptedState = { ...state };
  
  // Ensure inventory has proper array indexing
  const items = adaptedState.inventory.items;
  for (let i = 0; i < items.length; i++) {
    (adaptedState.inventory as unknown as Record<number, InventoryItem>)[i] = items[i];
  }
  
  return adaptedState;
}

/**
 * Adapts journal state for backward compatibility
 */
export function adaptJournalForTesting(state: GameState): GameState {
  if (!state.journal?.entries) return state;
  
  const adaptedState = { ...state };
  
  // Ensure journal entries are available at both new and legacy locations
  const entries = adaptedState.journal.entries;
  const legacyState = adaptedState as unknown as { entries?: AppJournalEntry[] };
  
  if (!legacyState.entries) {
    legacyState.entries = [];
  }
  
  for (let i = 0; i < entries.length; i++) {
    legacyState.entries[i] = entries[i];
  }
  
  return adaptedState;
}