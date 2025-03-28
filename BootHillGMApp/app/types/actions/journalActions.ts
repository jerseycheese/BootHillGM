import { JournalEntry } from '../journal';

/**
 * Journal action types
 */
export type JournalActionType =
  | 'journal/ADD_ENTRY'
  | 'journal/REMOVE_ENTRY'
  | 'journal/UPDATE_ENTRY'
  | 'journal/SET_ENTRIES'
  | 'journal/CLEAR_ENTRIES';

/**
 * Journal action interfaces
 */
export interface AddJournalEntryAction {
  type: 'journal/ADD_ENTRY';
  payload: Partial<JournalEntry>;
}

export interface RemoveJournalEntryAction {
  type: 'journal/REMOVE_ENTRY';
  payload: { id: string };
}

export interface UpdateJournalEntryAction {
  type: 'journal/UPDATE_ENTRY';
  payload: Partial<JournalEntry> & { id: string };
}

export interface SetJournalEntriesAction {
  type: 'journal/SET_ENTRIES';
  payload: JournalEntry[];
}

export interface ClearJournalEntriesAction {
  type: 'journal/CLEAR_ENTRIES';
}

/**
 * Combined journal actions type
 */
export type JournalAction =
  | AddJournalEntryAction
  | RemoveJournalEntryAction
  | UpdateJournalEntryAction
  | SetJournalEntriesAction
  | ClearJournalEntriesAction;
