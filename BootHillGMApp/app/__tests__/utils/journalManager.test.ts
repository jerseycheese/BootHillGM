// BootHillGMApp/app/__tests__/utils/journalManager.test.ts

import { addJournalEntry, getJournalEntries, getRecentJournalEntries, getJournalContext, addCombatJournalEntry } from '../../utils/JournalManager';
import { JournalEntry } from '../../types/journal';

jest.mock('../../utils/aiService', () => ({
  generateNarrativeSummary: jest.fn().mockResolvedValue('Mocked narrative summary'),
}));

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
  test('addJournalEntry adds a new entry with current timestamp', async () => {
    const newJournal = await addJournalEntry(journal, 'New entry', 'Test context', 'Test Character');
    expect(newJournal).toHaveLength(4);
    expect(newJournal[3].content).toBe('New entry');
    expect(newJournal[3].timestamp).toBeGreaterThan(3000);
    expect(newJournal[3].narrativeSummary).toBe('Mocked narrative summary');
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

describe('addCombatJournalEntry', () => {
  it('should create a correctly formatted combat journal entry', () => {
    const summary = 'Player defeated Outlaw in a shootout.';
    const entry = addCombatJournalEntry(summary);

    expect(entry).toHaveProperty('timestamp');
    expect(typeof entry.timestamp).toBe('number');
    expect(entry.content).toBe(`Combat: ${summary}`);
  });

  it('should be included in recent journal entries', () => {
    const summary = 'Player was ambushed by Bandits.';
    const combatEntry = addCombatJournalEntry(summary);
    const journal: JournalEntry[] = [
      { timestamp: Date.now() - 3000, content: 'Entered the saloon.' },
      combatEntry,
      { timestamp: Date.now() - 1000, content: 'Found a treasure map.' }
    ];

    const recentEntries = getRecentJournalEntries(journal, 2);
    expect(recentEntries).toContainEqual(combatEntry);
  });

  it('should be included in journal context', () => {
    const summary = 'Player won a duel against the Sheriff.';
    const combatEntry = addCombatJournalEntry(summary);
    const journal: JournalEntry[] = [combatEntry];

    const context = getJournalContext(journal);
    expect(context).toContain(summary);
  });
});
