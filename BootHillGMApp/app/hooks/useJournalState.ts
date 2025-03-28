/**
 * Journal State Selector Hooks
 * 
 * This module provides selector hooks for accessing journal state data.
 */

import { JournalEntry } from '../types/journal';
import { JournalState } from '../types/state/journalState';
import { createSelectorHook, createSlicePropertySelector } from './createSelectorHook';

/**
 * Hook that returns the entire journal state slice
 */
export const useJournalState = createSelectorHook<JournalState>(
  (state) => state.journal
);

/**
 * Hook that returns all journal entries
 */
export const useJournalEntries = createSlicePropertySelector<JournalState, JournalEntry[]>(
  'journal',
  (journalState) => journalState.entries
);

/**
 * Hook that returns the count of journal entries
 */
export const useJournalEntryCount = createSelectorHook<number>(
  (state) => state.journal.entries.length
);

/**
 * Hook that returns journal entries of a specific type
 * @param type The type of entries to retrieve
 */
export function useEntriesByType(type: string) {
  return createSelectorHook<JournalEntry[]>(
    (state) => state.journal.entries.filter(entry => entry.type === type)
  );
}

/**
 * Hook that returns the most recent journal entries
 * @param count The number of entries to retrieve (default: 5)
 */
export function useRecentEntries(count: number = 5) {
  return createSelectorHook<JournalEntry[]>(
    (state) => [...state.journal.entries]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, count)
  );
}

/**
 * Hook that returns a specific journal entry by id
 * @param entryId The id of the entry to retrieve
 */
export function useEntryById(entryId: string) {
  return createSelectorHook<JournalEntry | undefined>(
    (state) => state.journal.entries.find(entry => entry.id === entryId)
  );
}
