/**
 * AI Decision Detector Tests
 * 
 * Tests for the decision detection logic
 */

import { detectDecisionPoint, calculateDecisionScore } from '../../../services/ai/utils/aiDecisionDetector';
import { DEFAULT_DECISION_THRESHOLD } from '../../../services/ai/utils/aiDecisionConstants';
import { AIDecisionServiceConfig } from '../../../services/ai/types/aiDecisionTypes';
import { NarrativeState } from '../../../types/narrative.types';
import { Character } from '../../../types/character';

// Define test-specific interfaces to avoid any
interface MockNarrativeState extends Partial<NarrativeState> {
  currentStoryPoint?: {
    type?: string;
    content: string;
  };
  narrativeHistory: string[];
}

interface MockCharacter extends Partial<Character> {
  attributes: Record<string, number>;
}

describe('aiDecisionDetector', () => {
  describe('detectDecisionPoint', () => {
    it('should reject decisions that are too soon after the last one', () => {
      // Setup
      const mockConfig: AIDecisionServiceConfig = {
        minDecisionInterval: 30000,
        relevanceThreshold: DEFAULT_DECISION_THRESHOLD,
        maxOptionsPerDecision: 4,
        apiConfig: {
          apiKey: '',
          endpoint: '',
          modelName: '',
          maxRetries: 1,
          timeout: 1000,
          rateLimit: 10
        }
      };
      
      const mockNarrativeState: MockNarrativeState = {
        narrativeHistory: []
      };
      
      const mockCharacter: MockCharacter = {
        attributes: { /* Intentionally empty */ }
      };
      
      // Last decision was just 5 seconds ago
      const lastDecisionTime = Date.now() - 5000;
      
      // Exercise
      const result = detectDecisionPoint(
        mockNarrativeState as NarrativeState,
        mockCharacter as Character,
        mockConfig,
        lastDecisionTime
      );
      
      // Verify
      expect(result.shouldPresent).toBe(false);
      expect(result.score).toBe(0);
      expect(result.reason).toContain('Too soon');
    });
    
    it('should accept decisions when the score exceeds the threshold', () => {
      // Setup
      const mockConfig: AIDecisionServiceConfig = {
        minDecisionInterval: 30000,
        relevanceThreshold: 0.6,
        maxOptionsPerDecision: 4,
        apiConfig: {
          apiKey: '',
          endpoint: '',
          modelName: '',
          maxRetries: 1,
          timeout: 1000,
          rateLimit: 10
        }
      };
      
      const mockNarrativeState: MockNarrativeState = {
        currentStoryPoint: {
          type: 'decision',
          content: 'The sheriff says, "What do you think about this situation?"'
        },
        narrativeHistory: []
      };
      
      const mockCharacter: MockCharacter = {
        attributes: { /* Intentionally empty */ }
      };
      
      // Last decision was 60 seconds ago
      const lastDecisionTime = Date.now() - 60000;
      
      // Exercise
      const result = detectDecisionPoint(
        mockNarrativeState as NarrativeState,
        mockCharacter as Character,
        mockConfig,
        lastDecisionTime
      );
      
      // Verify
      expect(result.shouldPresent).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(mockConfig.relevanceThreshold);
      expect(result.reason).toContain('Narrative context');
    });
  });
  
  describe('calculateDecisionScore', () => {
    it('should increase score for dialogue content', () => {
      // Setup
      const baseNarrativeState: MockNarrativeState = {
        currentStoryPoint: {
          content: 'The sun was setting over the mountains.'
        },
        narrativeHistory: []
      };
      
      const dialogueNarrativeState: MockNarrativeState = {
        currentStoryPoint: {
          content: 'The sheriff said, "I need your help with this situation."'
        },
        narrativeHistory: []
      };
      
      const mockCharacter: MockCharacter = {
        attributes: { /* Intentionally empty */ }
      };
      
      const lastDecisionTime = Date.now() - 60000;
      
      // Exercise
      const baseScore = calculateDecisionScore(
        baseNarrativeState as NarrativeState,
        mockCharacter as Character,
        lastDecisionTime
      );
      
      const dialogueScore = calculateDecisionScore(
        dialogueNarrativeState as NarrativeState,
        mockCharacter as Character,
        lastDecisionTime
      );
      
      // Verify
      expect(dialogueScore).toBeGreaterThan(baseScore);
    });
    
    it('should decrease score for action sequences', () => {
      // Setup
      const baseNarrativeState: MockNarrativeState = {
        currentStoryPoint: {
          content: 'The sun was setting over the mountains.'
        },
        narrativeHistory: []
      };
      
      const actionNarrativeState: MockNarrativeState = {
        currentStoryPoint: {
          content: 'The outlaw drew his gun and shot at you, forcing you to dodge behind cover.'
        },
        narrativeHistory: []
      };
      
      const mockCharacter: MockCharacter = {
        attributes: { /* Intentionally empty */ }
      };
      
      const lastDecisionTime = Date.now() - 60000;
      
      // Exercise
      const baseScore = calculateDecisionScore(
        baseNarrativeState as NarrativeState,
        mockCharacter as Character,
        lastDecisionTime
      );
      
      const actionScore = calculateDecisionScore(
        actionNarrativeState as NarrativeState,
        mockCharacter as Character,
        lastDecisionTime
      );
      
      // Verify
      expect(actionScore).toBeLessThan(baseScore);
    });
    
    it('should increase score for decision-type story points', () => {
      // Setup
      const baseNarrativeState: MockNarrativeState = {
        currentStoryPoint: {
          type: 'narrative',
          content: 'The sun was setting over the mountains.'
        },
        narrativeHistory: []
      };
      
      const decisionNarrativeState: MockNarrativeState = {
        currentStoryPoint: {
          type: 'decision',
          content: 'The sun was setting over the mountains.'
        },
        narrativeHistory: []
      };
      
      const mockCharacter: MockCharacter = {
        attributes: { /* Intentionally empty */ }
      };
      
      const lastDecisionTime = Date.now() - 60000;
      
      // Exercise
      const baseScore = calculateDecisionScore(
        baseNarrativeState as NarrativeState,
        mockCharacter as Character,
        lastDecisionTime
      );
      
      const decisionScore = calculateDecisionScore(
        decisionNarrativeState as NarrativeState,
        mockCharacter as Character,
        lastDecisionTime
      );
      
      // Verify
      expect(decisionScore).toBeGreaterThan(baseScore);
    });
    
    it('should factor in time since last decision', () => {
      // Setup
      const mockNarrativeState: MockNarrativeState = {
        currentStoryPoint: {
          content: 'The sun was setting over the mountains.'
        },
        narrativeHistory: []
      };
      
      const mockCharacter: MockCharacter = {
        attributes: { /* Intentionally empty */ }
      };
      
      // Decision was recent
      const recentDecisionTime = Date.now() - 60000;
      
      // Decision was a long time ago
      const oldDecisionTime = Date.now() - 600000;
      
      // Exercise
      const recentScore = calculateDecisionScore(
        mockNarrativeState as NarrativeState,
        mockCharacter as Character,
        recentDecisionTime
      );
      
      const oldScore = calculateDecisionScore(
        mockNarrativeState as NarrativeState,
        mockCharacter as Character,
        oldDecisionTime
      );
      
      // Verify
      expect(oldScore).toBeGreaterThan(recentScore);
    });
  });
});
