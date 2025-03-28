import { JournalEntry } from '../journal';

/**
 * Journal state slice that manages all journal entries
 */
export interface JournalState {
  entries: JournalEntry[];
}

/**
 * Initial state for the journal slice
 */
export const initialJournalState: JournalState = {
  entries: []
};
