import { JournalEntry } from '../types/journal';
import { generateNarrativeSummary } from './aiService';

export const addJournalEntry = async (
  journal: JournalEntry[],
  entry: string | JournalEntry,
  context: string = '',
  characterName: string
): Promise<JournalEntry[]> => {
  const entryContent = typeof entry === 'string' ? entry : entry.content;
  const summaryInput = `${context} ${entryContent}`.trim();
  const narrativeSummary = await generateNarrativeSummary(summaryInput, characterName);
  const newEntry: JournalEntry = typeof entry === 'string' 
    ? { timestamp: Date.now(), content: entry }
    : entry;
  newEntry.narrativeSummary = narrativeSummary;
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

export const addCombatJournalEntry = (summary: string): JournalEntry => {
  return {
    timestamp: Date.now(),
    content: `Combat: ${summary}` // Prefix combat entries for easy identification
  };
};
