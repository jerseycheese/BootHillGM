import {
  JournalManager,
  addJournalEntry,
  addCombatJournalEntry,
  getJournalContext,
  filterJournal
} from '../../utils/JournalManager';
import {
  JournalEntry,
  CombatJournalEntry,
  InventoryJournalEntry,
  NarrativeJournalEntry
} from '../../types/journal';
import { generateNarrativeSummary } from '../../services/ai';

jest.mock('../../services/ai', () => ({
  generateNarrativeSummary: jest.fn().mockResolvedValue('Mocked summary')
}));

describe('JournalManager', () => {
  const emptyJournal: JournalEntry[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Legacy Functions', () => {
    it('should add journal entry using legacy function', async () => {
      const result = await addJournalEntry(emptyJournal, 'Test content');
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('narrative');
      expect(result[0].content).toBe('Test content');
    });

    it('should add combat entry using legacy function', () => {
      const result = addCombatJournalEntry(
        emptyJournal,
        'Player',
        'Enemy',
        'victory',
        'Combat summary'
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('combat');
      expect((result[0] as CombatJournalEntry).outcome).toBe('victory');
    });

    it('should get journal context', () => {
      const journal: JournalEntry[] = [
        {
          type: 'narrative',
          timestamp: 1000,
          content: 'Entry 1'
        } as NarrativeJournalEntry,
        {
          type: 'narrative',
          timestamp: 2000,
          content: 'Entry 2'
        } as NarrativeJournalEntry
      ];

      const context = getJournalContext(journal);
      expect(context).toBe('Entry 1\nEntry 2');
    });

    it('should filter journal using legacy function', () => {
      const journal: JournalEntry[] = [
        {
          type: 'narrative',
          timestamp: 1000,
          content: 'Test narrative'
        } as NarrativeJournalEntry,
        {
          type: 'combat',
          timestamp: 2000,
          content: 'Test combat',
          combatants: { player: 'P1', opponent: 'E1' },
          outcome: 'victory'
        } as CombatJournalEntry
      ];

      const result = filterJournal(journal, { type: 'narrative' });
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('narrative');
    });
  });

  describe('Class Methods', () => {
    describe('addNarrativeEntry', () => {
      it('should add a narrative entry with AI-generated summary', async () => {
        const result = await JournalManager.addNarrativeEntry(emptyJournal, 'Test content', 'Test context');
        
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('narrative');
        expect(result[0].content).toBe('Test content');
        expect(result[0].narrativeSummary).toBe('Mocked summary');
        expect(generateNarrativeSummary).toHaveBeenCalledWith('Test content', 'Test context');
      });

      it('should handle AI service errors gracefully', async () => {
        // Temporarily suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        (generateNarrativeSummary as jest.Mock).mockRejectedValueOnce(new Error('AI Error'));
        
        const result = await JournalManager.addNarrativeEntry(emptyJournal, 'Test content');
        expect(result).toEqual(emptyJournal);
        
        // Restore console.error
        consoleSpy.mockRestore();
      });
    });

    describe('addCombatEntry', () => {
      it('should add a combat entry with correct structure', () => {
        const result = JournalManager.addCombatEntry(
          emptyJournal,
          'Player',
          'Enemy',
          'victory',
          'Combat summary'
        );

        expect(result).toHaveLength(1);
        const entry = result[0] as CombatJournalEntry;
        expect(entry.type).toBe('combat');
        expect(entry.combatants).toEqual({
          player: 'Player',
          opponent: 'Enemy'
        });
        expect(entry.outcome).toBe('victory');
        expect(entry.content).toBe('Combat summary');
      });
    });

    describe('addInventoryEntry', () => {
      it('should add an inventory entry when items change', () => {
        const result = JournalManager.addInventoryEntry(
          emptyJournal,
          ['New Item'],
          ['Used Item'],
          'Inventory context'
        );

        expect(result).toHaveLength(1);
        const entry = result[0] as InventoryJournalEntry;
        expect(entry.type).toBe('inventory');
        expect(entry.items).toEqual({
          acquired: ['New Item'],
          removed: ['Used Item']
        });
        expect(entry.narrativeSummary).toBe('Acquired: New Item. Used/Lost: Used Item');
      });

      it('should not add entry when no items changed', () => {
        const result = JournalManager.addInventoryEntry(
          emptyJournal,
          [],
          [],
          'No changes'
        );

        expect(result).toEqual(emptyJournal);
      });
    });

    describe('filterJournal', () => {
      const testJournal: JournalEntry[] = [
        {
          type: 'narrative',
          timestamp: 1000,
          content: 'Test narrative',
          narrativeSummary: 'Summary'
        } as NarrativeJournalEntry,
        {
          type: 'combat',
          timestamp: 2000,
          content: 'Test combat',
          combatants: { player: 'P1', opponent: 'E1' },
          outcome: 'victory'
        } as CombatJournalEntry
      ];

      it('should filter by type', () => {
        const result = JournalManager.filterJournal(testJournal, { type: 'narrative' });
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('narrative');
      });

      it('should filter by date range', () => {
        const result = JournalManager.filterJournal(testJournal, {
          startDate: 1500,
          endDate: 2500
        });
        expect(result).toHaveLength(1);
        expect(result[0].timestamp).toBe(2000);
      });

      it('should filter by search text', () => {
        const result = JournalManager.filterJournal(testJournal, {
          searchText: 'combat'
        });
        expect(result).toHaveLength(1);
        expect(result[0].content).toContain('combat');
      });
    });
  });
});
