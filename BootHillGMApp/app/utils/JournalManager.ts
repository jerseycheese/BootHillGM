// BootHillGMApp/app/utils/journalManager.ts

import { JournalEntry } from '../types/journal';

export const addJournalEntry = (
  journal: JournalEntry[],
  content: string
): JournalEntry[] => {
  const newEntry: JournalEntry = {
    timestamp: Date.now(),
    content
  };
  return [...journal, newEntry];
};

export const getJournalEntries = (journal: JournalEntry[]): JournalEntry[] => {
  return [...journal].sort((a, b) => b.timestamp - a.timestamp);
};

export const getRecentJournalEntries = (
  journal: JournalEntry[],
  count: number = 5
): JournalEntry[] => {
  return getJournalEntries(journal).slice(0, count);
};