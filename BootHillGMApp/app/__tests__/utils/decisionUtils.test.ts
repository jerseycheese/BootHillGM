import {
  createDecision,
  createDecisionOption,
  createDecisionRecord,
  formatDecisionsForAIContext,
  hasDecisionExpired,
  filterRelevantDecisions,
} from '../../utils/decisionUtils';
import {
  PlayerDecision,
  PlayerDecisionRecord,
} from '../../types/narrative.types';

describe('Decision Utility Functions', () => {
  const mockDecision: PlayerDecision = {
    id: 'decision1',
    prompt: 'Test prompt',
    timestamp: Date.now(),
    options: [
      { id: 'option1', text: 'Option 1', impact: 'Impact 1' },
      { id: 'option2', text: 'Option 2', impact: 'Impact 2' },
    ],
    context: 'Test context',
    importance: 'moderate', // Corrected to string literal
    characters: ['char1', 'char2'],
    aiGenerated: true,
    location: { type: 'town', name: 'Testville' },
  };

  describe('createDecision', () => {
    it('should create a decision with default values', () => {
      const options = [createDecisionOption('Option 1', 'Impact 1')];
      const decision = createDecision('Test prompt', options, 'Test context');
      expect(decision.prompt).toBe('Test prompt');
      expect(decision.options).toEqual(options);
      expect(decision.context).toBe('Test context');
      expect(decision.importance).toBe('moderate');
      expect(decision.aiGenerated).toBe(true);
      expect(decision.timestamp).toBeGreaterThan(0);
      expect(decision.id).toBeDefined();
    });

    it('should create a decision with provided values', () => {
      const options = [createDecisionOption('Option 1', 'Impact 1')];
      const decision = createDecision(
        'Test prompt',
        options,
        'Test context',
        'critical',
        { type: 'wilderness', description: 'Test location' },
        ['char1']
      );
      expect(decision.importance).toBe('critical');
      expect(decision.location).toEqual({
        type: 'wilderness',
        description: 'Test location',
      });
      expect(decision.characters).toEqual(['char1']);
    });
  });

  describe('createDecisionOption', () => {
    it('should create a decision option with default values', () => {
      const option = createDecisionOption('Option 1', 'Impact 1');
      expect(option.text).toBe('Option 1');
      expect(option.impact).toBe('Impact 1');
      expect(option.tags).toEqual([]);
      expect(option.id).toBeDefined();
    });

    it('should create a decision option with provided values', () => {
      const option = createDecisionOption('Option 1', 'Impact 1', ['tag1']);
      expect(option.tags).toEqual(['tag1']);
    });
  });

  describe('createDecisionRecord', () => {
    it('should create a decision record', () => {
      const record = createDecisionRecord(
        mockDecision,
        'option1',
        'Test narrative'
      );
      expect(record.decisionId).toBe('decision1');
      expect(record.selectedOptionId).toBe('option1');
      expect(record.narrative).toBe('Test narrative');
      expect(record.impactDescription).toBe('Impact 1');
      expect(record.relevanceScore).toBe(5); // Default for moderate
      expect(record.timestamp).toBeGreaterThan(0);
      expect(record.tags).toEqual([
        'character:char1',
        'character:char2',
        'importance:moderate',
        'location:town',
        'place:Testville',
      ]);
      expect(record.expirationTimestamp).toBeUndefined();
    });

    it('should throw an error for invalid option ID', () => {
      expect(() =>
        createDecisionRecord(mockDecision, 'invalid', 'Test narrative')
      ).toThrowError(
        'Option with ID invalid not found in decision decision1'
      );
    });

    it('should create a decision record with correct relevance and expiration for minor decision', () => {
      const minorDecision: PlayerDecision = {
        ...mockDecision,
        importance: 'minor'
      };
      const record = createDecisionRecord(
        minorDecision,
        'option1',
        'Test narrative'
      );
      expect(record.relevanceScore).toBe(2);
      expect(record.expirationTimestamp).toBeDefined();
    });
  });

  describe('formatDecisionsForAIContext', () => {
    it('should format decision history for AI context', () => {
      const record1: PlayerDecisionRecord = {
        decisionId: '1',
        selectedOptionId: '1',
        timestamp: Date.now(),
        narrative: 'Long narrative context here...',
        impactDescription: 'Impact 1',
        tags: [],
        relevanceScore: 8,
      };
      const record2: PlayerDecisionRecord = {
        decisionId: '2',
        selectedOptionId: '2',
        timestamp: Date.now(),
        narrative: 'Another narrative context...',
        impactDescription: 'Impact 2',
        tags: [],
        relevanceScore: 5,
      };
      const formatted = formatDecisionsForAIContext([record1, record2]);
      expect(formatted).toContain("1. Decision: Impact 1");
      expect(formatted).toContain("Context: Long narrative context here...");
      expect(formatted).toContain("2. Decision: Impact 2");
      expect(formatted).toContain("Context: Another narrative context..."); // Should be truncated, but still present
    });

    it('should return an empty string if no decisions are provided', () => {
      expect(formatDecisionsForAIContext([])).toBe('');
    });
  });

  describe('hasDecisionExpired', () => {
    it('should return true for expired decision', () => {
      const expiredRecord: PlayerDecisionRecord = {
        decisionId: '1',
        selectedOptionId: '1',
        timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
        narrative: 'Narrative',
        impactDescription: 'Impact',
        tags: [],
        relevanceScore: 5,
        expirationTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // Expired 7 days ago
      };
      expect(hasDecisionExpired(expiredRecord)).toBe(true);
    });

    it('should return false for non-expired decision', () => {
      const nonExpiredRecord: PlayerDecisionRecord = {
        decisionId: '1',
        selectedOptionId: '1',
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        narrative: 'Narrative',
        impactDescription: 'Impact',
        tags: [],
        relevanceScore: 5,
        expirationTimestamp: Date.now() + 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
      };
      expect(hasDecisionExpired(nonExpiredRecord)).toBe(false);
    });

    it('should return false for decision without expiration', () => {
      const noExpirationRecord: PlayerDecisionRecord = {
        decisionId: '1',
        selectedOptionId: '1',
        timestamp: Date.now(),
        narrative: 'Narrative',
        impactDescription: 'Impact',
        tags: [],
        relevanceScore: 5,
      };
      expect(hasDecisionExpired(noExpirationRecord)).toBe(false);
    });
  });

  describe('filterRelevantDecisions', () => {
    const record1: PlayerDecisionRecord = {
      decisionId: '1',
      selectedOptionId: '1',
      timestamp: Date.now(),
      narrative: 'Narrative 1',
      impactDescription: 'Impact 1',
      tags: ['tag1', 'tag2'],
      relevanceScore: 8,
    };
    const record2: PlayerDecisionRecord = {
      decisionId: '2',
      selectedOptionId: '2',
      timestamp: Date.now(),
      narrative: 'Narrative 2',
      impactDescription: 'Impact 2',
      tags: ['tag2', 'tag3'],
      relevanceScore: 5,
      expirationTimestamp: Date.now() - 1,
    };
    const record3: PlayerDecisionRecord = {
      decisionId: '3',
      selectedOptionId: '3',
      timestamp: Date.now(),
      narrative: 'Narrative 3',
      impactDescription: 'Impact 3',
      tags: ['tag4'],
      relevanceScore: 2,
    };

    it('should filter decisions by relevance score', () => {
      const filtered = filterRelevantDecisions([record1, record2, record3], [], 5);
      expect(filtered).toEqual([record1]);
    });

    it('should filter decisions by tags', () => {
      const filtered = filterRelevantDecisions(
        [record1, record2, record3],
        ['tag2']
      );
      expect(filtered).toEqual([record1]);
    });

    it('should filter decisions by relevance score and tags', () => {
      const filtered = filterRelevantDecisions(
        [record1, record2, record3],
        ['tag2'],
        5
      );
      expect(filtered).toEqual([record1]);
    });

    it('should filter out expired decisions', () => {
      const filtered = filterRelevantDecisions([record1, record2, record3]);
      expect(filtered).toEqual([record1, record3]); // record2 should be filtered out
    });

    it('should return an empty array if no decisions match', () => {
      const filtered = filterRelevantDecisions(
        [record1, record2, record3],
        ['tag5'],
        9
      );
      expect(filtered).toEqual([]);
    });
  });
});