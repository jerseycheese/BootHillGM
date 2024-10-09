// BootHillGMApp/app/__tests__/utils/journalManager.test.ts

import { addJournalEntry, getJournalEntries, getRecentJournalEntries, getJournalContext } from '../../utils/JournalManager';
import { JournalEntry } from '../../types/journal';

describe('Journal Manager', () => {
  let journal: JournalEntry[];

  // Set up a sample journal before each test
  beforeEach(() => {
    journal = [
      { timestamp: 1000, content: 'First entry' },
      { timestamp: 2000, content: 'Second entry' },
      { timestamp: 3000, content: 'Third entry' },
    ];
  });

  // Test case: Adding a new journal entry
  test('addJournalEntry adds a new entry with current timestamp', () => {
    const newJournal = addJournalEntry(journal, 'New entry');
    expect(newJournal).toHaveLength(4);
    expect(newJournal[3].content).toBe('New entry');
    expect(newJournal[3].timestamp).toBeGreaterThan(3000);
  });

  // Test case: Getting journal entries sorted by timestamp
  test('getJournalEntries returns entries sorted by timestamp descending', () => {
    const sortedEntries = getJournalEntries(journal);
    expect(sortedEntries).toHaveLength(3);
    expect(sortedEntries[0].content).toBe('Third entry');
    expect(sortedEntries[2].content).toBe('First entry');
  });

  // Test case: Getting a specified number of recent journal entries
  test('getRecentJournalEntries returns the specified number of recent entries', () => {
    const recentEntries = getRecentJournalEntries(journal, 2);
    expect(recentEntries).toHaveLength(2);
    expect(recentEntries[0].content).toBe('Third entry');
    expect(recentEntries[1].content).toBe('Second entry');
  });

  // Test case: Getting recent entries when requested count exceeds journal length
  test('getRecentJournalEntries returns all entries if count exceeds journal length', () => {
    const recentEntries = getRecentJournalEntries(journal, 5);
    expect(recentEntries).toHaveLength(3);
  });

  // Test case: Getting journal context as a string
  test('getJournalContext returns a string of recent journal entries', () => {
    const context = getJournalContext(journal);
    expect(typeof context).toBe('string');
    expect(context).toContain('Third entry');
    expect(context).toContain('Second entry');
    expect(context).toContain('First entry');
  });
});