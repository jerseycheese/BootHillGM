/**
 * Journal Action Creators
 * 
 * This file contains action creators for the journal reducer.
 */

import { JournalEntry } from '../types/journal';
import { ActionTypes } from '../types/actionTypes';
import { JournalUpdatePayload } from '../types/gameActions';

/**
 * Action creator for adding an entry to the journal
 * @param entry - Entry to add
 * @returns Journal action object
 */
export const addEntry = (entry: Partial<JournalEntry>) => ({
  type: ActionTypes.ADD_ENTRY,
  payload: entry
});

/**
 * Action creator for removing an entry from the journal
 * @param id - ID of the entry to remove
 * @returns Journal action object
 */
export const removeEntry = (id: string) => ({
  type: ActionTypes.REMOVE_ENTRY,
  payload: { id }
});

/**
 * Action creator for updating an entry in the journal
 * @param id - ID of the entry to update
 * @param entry - Updated entry data
 * @returns Journal action object
 */
export const updateEntry = (id: string, entry: Partial<JournalEntry>) => ({
  type: ActionTypes.UPDATE_JOURNAL,
  payload: { id, ...entry }
});

/**
 * Action creator for updating the journal with a new entry
 * @param entry - New journal entry payload
 * @returns Journal action object
 */
export const updateJournal = (entry: JournalUpdatePayload) => ({
  type: ActionTypes.UPDATE_JOURNAL_GENERAL,
  payload: entry
});

/**
 * Action creator for setting all journal entries
 * @param entries - Array of entries to set as the journal
 * @returns Journal action object
 */
export const setEntries = (entries: JournalEntry[]) => ({
  type: ActionTypes.SET_ENTRIES,
  payload: entries
});

/**
 * Action creator for clearing all journal entries
 * @returns Journal action object
 */
export const clearEntries = () => ({
  type: ActionTypes.CLEAR_ENTRIES
});
