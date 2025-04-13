/**
 * Comprehensive tests for JournalManager
 * 
 * This file combines all tests for the JournalManager utility,
 * including both the class methods and legacy functions.
 */
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
import * as uuidGenerator from '../../utils/uuidGenerator';
import { createMockAIService, MockedAIService } from '../../__mocks__/services/ai/AIServiceMock';
import { AIService } from '../../services/ai/aiService';

// Mock the UUID generator utility
jest.mock('../../utils/uuidGenerator');

describe('JournalManager', () => {
  // Constants for predictable testing
  const FIXED_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const FIXED_TIMESTAMP = 1234567890;
  
  // Empty journal for testing
  const emptyJournal: JournalEntry[] = [];
  
  // Create a mockAIService instance for each test
  let mockAIService: MockedAIService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh mock AIService for each test
    mockAIService = createMockAIService();
    
    // Mock UUID generation for consistent test results
    jest.spyOn(uuidGenerator, 'generateUUID').mockReturnValue(FIXED_UUID);
    
    // Mock Date.now for consistent timestamps
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_TIMESTAMP);
    
    // Mock the AIService to return consistent results
    mockAIService.generateNarrativeSummary.mockResolvedValue('Mocked summary');
  });

  describe('Core functionality', () => {
    it('returns a valid journal entry when adding narrative entry', async () => {
      const result = await JournalManager.addNarrativeEntry(
        emptyJournal, 
        'Test content',
        undefined,
        mockAIService as unknown as AIService
      );
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('narrative');
      expect(result[0].content).toBe('Test content');
      expect(result[0].id).toBe(FIXED_UUID);
      expect(result[0].timestamp).toBe(FIXED_TIMESTAMP);
      expect(mockAIService.generateNarrativeSummary).toHaveBeenCalledWith('Test content', '');
    });
    
    it('returns a fallback entry on error', async () => {
      // Suppress console.error for this test
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock the AI service to reject with an error
      mockAIService.generateNarrativeSummary.mockRejectedValueOnce(new Error('Test error'));
      
      // Call the method with our mocked service that will throw an error
      const result = await JournalManager.addNarrativeEntry(
        emptyJournal, 
        'Test content',
        undefined,
        mockAIService as unknown as AIService
      );
      
      // Should return a journal with fallback entry when error occurs
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('narrative');
      expect(result[0].content).toBe('Test content');
      expect(result[0].narrativeSummary).toBe('The character embarks on a new journey in the frontier town of Boot Hill.');
      expect(mockAIService.generateNarrativeSummary).toHaveBeenCalled();
    });
  });

  describe('Legacy Functions', () => {
    it('should add journal entry using legacy function', async () => {
      const result = await addJournalEntry(
        emptyJournal, 
        'Test content', 
        mockAIService as unknown as AIService
      );
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('narrative');
      expect(result[0].content).toBe('Test content');
      expect(result[0].id).toBe(FIXED_UUID);
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
      expect(result[0].id).toBe(FIXED_UUID);
    });

    it('should get journal context', () => {
      const journal: JournalEntry[] = [
        {
          id: 'test-1',
          type: 'narrative',
          timestamp: 1000,
          content: 'Entry 1'
        } as NarrativeJournalEntry,
        {
          id: 'test-2',
          type: 'narrative',
          timestamp: 2000,
          content: 'Entry 2'
        } as NarrativeJournalEntry
      ];

      const context = getJournalContext(journal);
      expect(context).toBe('Entry 1\nEntry 2');
    });

    it('should handle empty journal for context', () => {
      expect(getJournalContext([])).toBe('');
      expect(getJournalContext(undefined as unknown as JournalEntry[])).toBe('');
    });

    it('should filter journal using legacy function', () => {
      const journal: JournalEntry[] = [
        {
          id: 'test-1',
          type: 'narrative',
          timestamp: 1000,
          content: 'Test narrative'
        } as NarrativeJournalEntry,
        {
          id: 'test-2',
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
        const result = await JournalManager.addNarrativeEntry(
          emptyJournal, 
          'Test content', 
          'Test context', 
          mockAIService as unknown as AIService
        );
        
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('narrative');
        expect(result[0].content).toBe('Test content');
        expect(result[0].narrativeSummary).toBe('Mocked summary.');
        expect(result[0].id).toBe(FIXED_UUID);
        expect(mockAIService.generateNarrativeSummary).toHaveBeenCalledWith('Test content', 'Test context');
      });

      it('should handle AI service errors gracefully', async () => {
        // Temporarily suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Mock implementation to reject with an error
        mockAIService.generateNarrativeSummary.mockRejectedValueOnce(new Error('AI Error'));
        
        const result = await JournalManager.addNarrativeEntry(
          emptyJournal, 
          'Test content', 
          undefined, 
          mockAIService as unknown as AIService
        );
        
        // Should return a journal with fallback entry
        expect(result.length).toBe(1);
        expect(result[0].narrativeSummary).toBe('The character embarks on a new journey in the frontier town of Boot Hill.');
        expect(consoleSpy).toHaveBeenCalled();
        
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
        expect(entry.id).toBe(FIXED_UUID);
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
        expect(entry.narrativeSummary).toBe('Acquired: New Item. Used/Lost: Used Item.');
        expect(entry.id).toBe(FIXED_UUID);
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
      
      it('should handle undefined inputs', () => {
        const result = JournalManager.addInventoryEntry(
          undefined as unknown as JournalEntry[],
          undefined as unknown as string[],
          undefined as unknown as string[],
          undefined as unknown as string
        );
        
        expect(result).toEqual([]);
      });
    });

    describe('filterJournal', () => {
      const testJournal: JournalEntry[] = [
        {
          id: 'test-1',
          type: 'narrative',
          timestamp: 1000,
          content: 'Test narrative',
          narrativeSummary: 'Summary'
        } as NarrativeJournalEntry,
        {
          id: 'test-2',
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
      
      it('should handle null input', () => {
        const result = JournalManager.filterJournal(null as unknown as JournalEntry[], {});
        expect(result).toEqual([]);
      });
    });
  });
});
