/**
 * Tests for Contextual Decision Service
 * 
 * This file contains unit tests for the Contextual Decision Service components.
 * These tests ensure that the refactored service works as intended.
 */

import { ContextualDecisionService } from '../../../services/ai/contextualDecisionService';
import { DecisionDetector } from '../../../services/ai/decisionDetector';
import { processResponse } from '../../../services/ai/decisionResponseProcessor';
import { generateFallbackDecision } from '../../../services/ai/fallbackDecisionGenerator';
import { ContextualDecisionServiceConfig } from '../../../services/ai/contextualDecision.types';
import { NarrativeState } from '../../../types/narrative.types';
import { Character } from '../../../types/character';

// Mock dependencies
jest.mock('../../../utils/ai/aiConfig', () => ({
  getAIModel: jest.fn(() => ({
    generateContent: jest.fn().mockResolvedValue({
      response: { text: () => '{"prompt":"Test prompt","options":[{"text":"Option 1","impact":"Impact 1","tags":["tag1"]}]}' }
    })
  }))
}));

jest.mock('../../../utils/decisionQualityAssessment', () => ({
  evaluateDecisionQuality: jest.fn(() => ({ score: 0.8, suggestions: [], acceptable: true })),
  processDecisionQuality: jest.fn()
}));

describe('Contextual Decision Service', () => {
  const mockConfig: ContextualDecisionServiceConfig = {
    minDecisionInterval: 1000,
    relevanceThreshold: 0.5,
    maxOptionsPerDecision: 3,
    useFeedbackSystem: false
  };
  
  // Mock narrative state and character
  const mockNarrativeState: Partial<NarrativeState> = {
    currentStoryPoint: {
      id: 'test-1',
      type: 'decision',
      title: 'Test Decision',
      content: 'You need to decide what to do next.',
    },
    narrativeHistory: ['Previous narrative point']
  };
  
  const mockCharacter: Partial<Character> = {
    attributes: {
      speed: 5,
      gunAccuracy: 7,
      throwingAccuracy: 4,
      strength: 6,
      baseStrength: 8,
      bravery: 6,
      experience: 3
    }
  };
  
  describe('DecisionDetector', () => {
    it('should detect decision points based on narrative context', () => {
      const detector = new DecisionDetector(mockConfig);
      const result = detector.detectDecisionPoint(
        mockNarrativeState as NarrativeState,
        mockCharacter as Character
      );
      
      expect(result.shouldPresent).toBeDefined();
      expect(typeof result.score).toBe('number');
      expect(result.reason).toBeTruthy();
    });
  });
  
  describe('Response Processor', () => {
    it('should process valid AI responses', () => {
      const validResponse = '{"prompt":"Test","options":[{"text":"Option","impact":"Impact"}]}';
      const result = processResponse(validResponse);
      
      expect(result).toHaveProperty('prompt', 'Test');
      expect(result).toHaveProperty('options');
    });
    
    it('should handle invalid responses', () => {
      const invalidResponse = 'Not a JSON response';
      const result = processResponse(invalidResponse);
      
      expect(result).toBeNull();
    });
  });
  
  describe('Fallback Generator', () => {
    it('should generate fallback decisions', () => {
      const result = generateFallbackDecision(
        mockNarrativeState as NarrativeState,
        mockCharacter as Character
      );
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('prompt');
      expect(result.options.length).toBeGreaterThanOrEqual(2);
    });
  });
  
  describe('ContextualDecisionService', () => {
    it('should initialize with provided config', () => {
      const service = new ContextualDecisionService(mockConfig);
      expect(service).toBeDefined();
    });
    
    it('should generate decisions', async () => {
      const service = new ContextualDecisionService(mockConfig);
      const result = await service.generateDecision(
        mockNarrativeState as NarrativeState,
        mockCharacter as Character
      );
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('options');
    });
    
    it('should record decisions', () => {
      const service = new ContextualDecisionService(mockConfig);
      service.recordDecision('Test prompt', 'Test choice', 'Test outcome');
      
      // Use the testing method instead of casting to any
      const history = service.getDecisionsHistoryForTesting();
      expect(history.length).toBe(1);
      expect(history[0]).toHaveProperty('prompt', 'Test prompt');
    });
  });
});
