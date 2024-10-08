// BootHillGMApp/app/__tests__/utils/journalManager.test.ts

import { addJournalEntry, getJournalEntries, getRecentJournalEntries } from '../../utils/journalManager';
import { JournalEntry } from '../../types/journal';

describe('Journal Manager', () => {
  let journal: JournalEntry[];

  beforeEach(() => {
    journal = [
      { timestamp: 1000, content: 'First entry' },
      { timestamp: 2000, content: 'Second entry' },
      { timestamp: 3000, content: 'Third entry' },
    ];
  });

  test('addJournalEntry adds a new entry with current timestamp', () => {
    const newJournal = addJournalEntry(journal, 'New entry');
    expect(newJournal).toHaveLength(4);
    expect(newJournal[3].content).toBe('New entry');
    expect(newJournal[3].timestamp).toBeGreaterThan(3000);
  });

  test('getJournalEntries returns entries sorted by timestamp descending', () => {
    const sortedEntries = getJournalEntries(journal);
    expect(sortedEntries).toHaveLength(3);
    expect(sortedEntries[0].content).toBe('Third entry');
    expect(sortedEntries[2].content).toBe('First entry');
  });

  test('getRecentJournalEntries returns the specified number of recent entries', () => {
    const recentEntries = getRecentJournalEntries(journal, 2);
    expect(recentEntries).toHaveLength(2);
    expect(recentEntries[0].content).toBe('Third entry');
    expect(recentEntries[1].content).toBe('Second entry');
  });

  test('getRecentJournalEntries returns all entries if count exceeds journal length', () => {
    const recentEntries = getRecentJournalEntries(journal, 5);
    expect(recentEntries).toHaveLength(3);
  });
});