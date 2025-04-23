import { JournalEntry } from '../journal';
import { ActionTypes } from '../actionTypes'; // Import ActionTypes

/**
 * Journal action interfaces using ActionTypes
 */
export interface AddJournalEntryAction {
  type: typeof ActionTypes.ADD_ENTRY; // Use ActionTypes
  payload: Partial<JournalEntry>;
}

export interface RemoveJournalEntryAction {
  type: typeof ActionTypes.REMOVE_ENTRY; // Use ActionTypes
  payload: { id: string };
}

export interface UpdateJournalEntryAction {
  type: typeof ActionTypes.UPDATE_JOURNAL; // Use ActionTypes (maps to 'journal/UPDATE_ENTRY')
  payload: Partial<JournalEntry> & { id: string };
}

export interface SetJournalEntriesAction {
  type: typeof ActionTypes.SET_ENTRIES; // Use ActionTypes
  payload: JournalEntry[];
}

export interface ClearJournalEntriesAction {
  type: typeof ActionTypes.CLEAR_ENTRIES; // Use ActionTypes
}

// Interface for general journal updates (often adding new entries)
export interface UpdateJournalGeneralAction { // Renamed interface
  type: typeof ActionTypes.UPDATE_JOURNAL_GENERAL; // Use ActionTypes (maps to 'journal/UPDATE_JOURNAL', handles legacy 'UPDATE_JOURNAL')
  payload: Partial<JournalEntry>;
}

/**
 * Combined journal actions type
 */
export type JournalAction =
  | AddJournalEntryAction
  | RemoveJournalEntryAction
  | UpdateJournalEntryAction
  | SetJournalEntriesAction
  | ClearJournalEntriesAction
  | UpdateJournalGeneralAction; // Use renamed interface
