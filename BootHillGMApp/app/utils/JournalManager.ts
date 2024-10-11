// BootHillGMApp/app/utils/JournalManager.ts

import { JournalEntry } from '../types/journal';

// Adds a new entry to the journal
export const addJournalEntry = (
  journal: JournalEntry[],
  entry: string | JournalEntry
): JournalEntry[] => {
  // Create a new entry object, either from a string or an existing JournalEntry
  const newEntry: JournalEntry = typeof entry === 'string'
    ? { timestamp: Date.now(), content: entry }
    : entry;
  // Return a new array with the new entry added to the end
  return [...journal, newEntry];
};

// Retrieves all journal entries, sorted by timestamp (newest first)
export const getJournalEntries = (journal: JournalEntry[]): JournalEntry[] => {
  return [...journal].sort((a, b) => b.timestamp - a.timestamp);
};

// Retrieves the most recent journal entries (default: 5)
export const getRecentJournalEntries = (
  journal: JournalEntry[],
  count: number = 5
): JournalEntry[] => {
  return getJournalEntries(journal).slice(0, count);
};

// Generates a context string from the most recent journal entries
export const getJournalContext = (journal: JournalEntry[]): string => {
  // Check if the journal is a valid array
  if (!Array.isArray(journal)) {
    console.error('Journal is not an array:', journal);
    return '';
  }
  // Get the 3 most recent entries
  const recentEntries = getRecentJournalEntries(journal, 3);
  // Combine the content of recent entries into a single string
  return recentEntries.map(entry => entry.content).join(' ');
};

// Create a formatted journal entry for combat results
export const addCombatJournalEntry = (summary: string): JournalEntry => {
  return {
    timestamp: Date.now(),
    content: `Combat: ${summary}` // Prefix combat entries for easy identification
  };
};
