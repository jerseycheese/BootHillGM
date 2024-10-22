import { JournalEntry } from '../types/journal';
import { generateNarrativeSummary } from './aiService';

export const addJournalEntry = async (
  journal: JournalEntry[],
  entry: string | JournalEntry,
  context: string = ''
): Promise<JournalEntry[]> => {
  // Ensure journal is an array
  const currentJournal = Array.isArray(journal) ? journal : [];
  
  try {
    // Create the new entry
    const timestamp = Date.now();
    let newEntry: JournalEntry;

    if (typeof entry === 'string') {
      const narrativeSummary = await generateNarrativeSummary(entry, context);
      newEntry = {
        timestamp,
        content: entry,
        narrativeSummary
      };
    } else {
      // If entry is already a JournalEntry, ensure it has a timestamp
      newEntry = {
        ...entry,
        timestamp: entry.timestamp || timestamp
      };
    }

    // Return new journal array with the new entry
    return [...currentJournal, newEntry];
  } catch (error) {
    console.error('Error adding journal entry:', error);
    // Return original journal if there's an error
    return currentJournal;
  }
};

export const getRecentJournalEntries = (
  journal: JournalEntry[],
  count: number = 5
): JournalEntry[] => {
  // Ensure journal is an array
  if (!Array.isArray(journal)) {
    console.warn('Invalid journal format:', journal);
    return [];
  }
  return getJournalEntries(journal).slice(0, count);
};

export const getJournalEntries = (journal: JournalEntry[]): JournalEntry[] => {
  // Ensure journal is an array
  if (!Array.isArray(journal)) {
    console.warn('Invalid journal format:', journal);
    return [];
  }
  // Sort by timestamp, ensuring each entry has a valid timestamp
  return [...journal]
    .filter(entry => entry && entry.timestamp)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
};

export const getJournalContext = (journal: JournalEntry[]): string => {
  // Ensure journal is an array
  if (!Array.isArray(journal)) {
    console.warn('Invalid journal format:', journal);
    return '';
  }
  
  // Get the 3 most recent entries
  const recentEntries = getRecentJournalEntries(journal, 3);
  // Combine their narrative summaries or content
  return recentEntries
    .map(entry => entry.narrativeSummary || entry.content)
    .filter(Boolean)
    .join(' ');
};

export const addCombatJournalEntry = (summary: string): JournalEntry => {
  return {
    timestamp: Date.now(),
    content: `Combat: ${summary}`,
    narrativeSummary: summary
  };
};