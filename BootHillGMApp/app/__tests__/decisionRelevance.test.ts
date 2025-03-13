/**
 * Tests for the Decision Relevance System
 */

import { describe, it, expect } from '@jest/globals';
import { 
  calculateRelevanceScore,
  generateContextTags,
  filterMostRelevantDecisions,
  formatDecisionsForAIContext,
  createDecisionHistoryContext
} from '../utils/decisionRelevanceUtils';
import { PlayerDecisionRecord, DecisionImportance, LocationType } from '../types/narrative.types';

// Mock the entire module - this pattern works well in Next.js/React projects
jest.mock('../utils/decisionUtils', () => ({
  hasDecisionExpired: jest.fn().mockReturnValue(false)
}));

// Import the mock so we can control it
import { hasDecisionExpired } from '../utils/decisionUtils';

describe('Decision Relevance System', () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const createTestDecision = (
    id: string,
    importance: DecisionImportance,
    tags: string[],
    timestamp: number,
    narrative: string = 'Test narrative'
  ): PlayerDecisionRecord => ({
    decisionId: id,
    selectedOptionId: 'option1',
    timestamp,
    narrative,
    impactDescription: `Decision ${id} impact`,
    tags,
    relevanceScore: 
      importance === 'critical' ? 10 :
      importance === 'significant' ? 8 :
      importance === 'moderate' ? 5 : 2
  });

  // Test data setup
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

  const testDecisions = [
    createTestDecision('recent-critical', 'critical', ['character:sheriff', 'location:town'], now - 1000),
    createTestDecision('recent-minor', 'minor', ['item:gun'], oneHourAgo),
    createTestDecision('old-significant', 'significant', ['character:outlaw', 'theme:revenge'], oneDayAgo),
    createTestDecision('very-old-minor', 'minor', ['location:wilderness'], oneWeekAgo),
    createTestDecision('tag-match', 'moderate', ['character:sheriff', 'theme:justice'], oneHourAgo),
  ];

  describe('calculateRelevanceScore', () => {
    it('should score recent critical decisions higher', () => {
      const score = calculateRelevanceScore(
        testDecisions[0], 
        ['character:sheriff'], 
        now
      );
      
      expect(score).toBeGreaterThan(5);
    });

    it('should score old minor decisions lower', () => {
      const score = calculateRelevanceScore(
        testDecisions[3],
        ['character:sheriff'],
        now
      );
      
      expect(score).toBeLessThan(4);
    });

    it('should boost score when tags match current context', () => {
      const tagsMatchingContext = ['character:sheriff', 'theme:justice'];
      const tagsNotMatchingContext = ['character:outlaw', 'theme:revenge'];
      
      const scoreWithMatch = calculateRelevanceScore(
        testDecisions[4],
        tagsMatchingContext,
        now
      );
      
      const scoreWithoutMatch = calculateRelevanceScore(
        testDecisions[4],
        tagsNotMatchingContext,
        now
      );
      
      expect(scoreWithMatch).toBeGreaterThan(scoreWithoutMatch);
    });

    it('should return 0 for expired decisions', () => {
      (hasDecisionExpired as jest.Mock).mockReturnValueOnce(true);
      
      const score = calculateRelevanceScore(
        testDecisions[0],
        ['character:sheriff'],
        now
      );
      
      expect(score).toBe(0);
      expect(hasDecisionExpired).toHaveBeenCalled();
    });
  });

  describe('generateContextTags', () => {
    it('should generate tags from location, characters and themes', () => {
      const location: LocationType = { type: 'town', name: 'Redemption' };
      const characters = ['Sheriff Johnson', 'Deputy Smith'];
      const themes = ['justice', 'revenge'];
      
      const tags = generateContextTags(location, characters, themes);
      
      // Assertions that validate the component behavior, not implementation
      expect(tags).toContain('location:town');
      expect(tags).toContain('place:Redemption');
      expect(tags).toContain('character:Sheriff Johnson');
      expect(tags).toContain('character:Deputy Smith');
      expect(tags).toContain('theme:justice');
      expect(tags).toContain('theme:revenge');
    });
  });

  describe('filterMostRelevantDecisions', () => {
    it('should filter and sort decisions by relevance', () => {
      // Create predictable test conditions
      const decisions = [
        createTestDecision('important-decision', 'critical', 
          ['character:sheriff', 'theme:justice'], now),
        ...testDecisions
      ];
      
      const contextTags = ['character:sheriff', 'theme:justice'];
      
      const relevantDecisions = filterMostRelevantDecisions(
        decisions,
        contextTags,
        3
      );
      
      // Test component behavior
      expect(relevantDecisions.length).toBeLessThanOrEqual(3);
      expect(relevantDecisions[0].decisionId).toBe('important-decision');
    });
  });

  describe('formatDecisionsForAIContext', () => {
    it('should format decisions in a compact way', () => {
      const formatted = formatDecisionsForAIContext(testDecisions.slice(0, 2));
      
      expect(formatted).toContain('Player\'s past relevant decisions');
      expect(formatted).toContain('Decision 1:');
      expect(formatted).toContain('Context:');
    });
  });

  describe('createDecisionHistoryContext', () => {
    it('should create formatted context from decisions', () => {
      const location = { type: 'town' as const, name: 'Silverado' };
      const characters = ['Sheriff Brooks'];
      const themes = ['justice'];
      
      const context = createDecisionHistoryContext(
        testDecisions,
        location,
        characters,
        themes
      );
      
      expect(context).toContain('Player\'s past relevant decisions');
      expect(context.split('Decision').length > 1).toBe(true);
    });
  });
});
