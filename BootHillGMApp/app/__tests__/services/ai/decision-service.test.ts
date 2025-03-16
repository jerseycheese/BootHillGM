/**
 * Tests for the Decision Service
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DecisionService } from '../../../services/ai/decision-service';
import { NarrativeState } from '../../../types/narrative.types';
import { Character } from '../../../types/character';
import { createTestNarrativeWithTrigger } from '../../../utils/testNarrativeWithDecision';

// Define detector type to avoid using 'any'
interface DecisionDetector {
  updateLastDecisionTime: () => void;
}

// Mock the fetch API globally
global.fetch = jest.fn();

// Mock AbortSignal
global.AbortSignal = {
  timeout: jest.fn().mockReturnValue({}),
} as unknown as typeof AbortSignal;

// Create mock narrative state
const createMockNarrativeState = (withDecisionTrigger = false): NarrativeState => ({
  currentStoryPoint: {
    id: 'test-point',
    content: withDecisionTrigger 
      ? createTestNarrativeWithTrigger() 
      : 'The sheriff nods at you as you walk by.',
    type: 'narrative',
    locationChange: 'SALOON'
  },
  narrativeHistory: [
    'You entered the saloon.',
    'The sheriff noticed you immediately.'
  ],
  narrativeContext: {
    worldContext: 'Sheriff is looking for a fugitive.'
  }
});

// Create mock character
const mockCharacter: Character = {
  id: 'player',
  name: 'Test Character',
  isNPC: false,
  attributes: {
    bravery: 8,
    speed: 6,
    gunAccuracy: 7
  }
};

// Mock AI response
const mockAIResponse = {
  choices: [
    {
      message: {
        content: JSON.stringify({
          decisionId: 'test-decision',
          prompt: 'What do you want to do?',
          options: [
            {
              id: 'option-1',
              text: 'Talk to the sheriff',
              confidence: 0.8,
              traits: ['brave'],
              potentialOutcomes: ['Might resolve peacefully'],
              impact: 'Diplomatic approach'
            },
            {
              id: 'option-2',
              text: 'Leave the saloon',
              confidence: 0.6,
              traits: ['cautious'],
              potentialOutcomes: ['Might avoid conflict'],
              impact: 'Avoidance strategy'
            }
          ],
          relevanceScore: 0.7,
          metadata: {
            narrativeImpact: 'Moderate impact on story',
            themeAlignment: 'Classic western confrontation',
            pacing: 'medium',
            importance: 'moderate'
          }
        })
      }
    }
  ]
};

describe('DecisionService', () => {
  let service: DecisionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch to return the AI response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAIResponse),
      headers: new Headers({
        'X-RateLimit-Remaining': '9',
        'X-RateLimit-Reset': '1600000000'
      })
    });
    
    // Initialize the service with test configuration
    service = new DecisionService({
      minDecisionInterval: 0, // No delay for testing
      relevanceThreshold: 0.3, // Lower threshold for testing
      apiConfig: {
        apiKey: 'test-key',
        endpoint: 'https://test-endpoint.com',
        modelName: 'test-model',
        maxRetries: 1,
        timeout: 1000,
        rateLimit: 10
      }
    });
  });
  
  describe('detectDecisionPoint', () => {
    it('should detect a decision point in narrative with decision triggers', () => {
      const narrativeState = createMockNarrativeState(true);
      const result = service.detectDecisionPoint(narrativeState, mockCharacter);
      
      expect(result.shouldPresent).toBe(true);
      expect(result.score).toBeGreaterThan(0.3);
    });
    
    it('should respect minimum decision interval', () => {
      // Create service with a 1-minute decision interval
      const intervalService = new DecisionService({
        minDecisionInterval: 60000, // 1 minute
        relevanceThreshold: 0.3
      });
      
      // Get access to the detector instance - using proper typing
      const detector = (intervalService as unknown as { detector: DecisionDetector }).detector;
      
      // First detection should pass
      const narrativeState = createMockNarrativeState(true);
      const result1 = intervalService.detectDecisionPoint(narrativeState, mockCharacter);
      expect(result1.shouldPresent).toBe(true);
      
      // Manually update lastDecisionTime - this is what generateDecision normally does
      detector.updateLastDecisionTime();
      
      // Second detection should fail due to interval
      const result2 = intervalService.detectDecisionPoint(narrativeState, mockCharacter);
      expect(result2.shouldPresent).toBe(false);
      expect(result2.reason).toContain('Too soon since last decision');
    });
  });
  
  describe('generateDecision', () => {
    it('should generate a valid decision from AI response', async () => {
      const narrativeState = createMockNarrativeState();
      const decision = await service.generateDecision(narrativeState, mockCharacter);
      
      expect(decision.decisionId).toBe('test-decision');
      expect(decision.options.length).toBe(2);
      expect(decision.prompt).toBe('What do you want to do?');
      expect(decision.relevanceScore).toBe(0.7);
    });
    
    it('should send appropriate context to the AI service', async () => {
      const narrativeState = createMockNarrativeState();
      await service.generateDecision(narrativeState, mockCharacter);
      
      // Validate API call
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
      
      // Check basic request setup
      expect(url).toBe('https://test-endpoint.com');
      expect(options.method).toBe('POST');
      expect(options.headers).toHaveProperty('Authorization', 'Bearer test-key');
      
      // Check request body content
      const body = JSON.parse(options.body);
      expect(body).toHaveProperty('model', 'test-model');
      
      // Check that messages include context
      expect(body.messages[1].content).toContain('NARRATIVE CONTEXT');
      expect(body.messages[1].content).toContain('The sheriff nods at you');
      expect(body.messages[1].content).toContain('CHARACTER INFORMATION');
      expect(body.messages[1].content).toContain('brave');
    });
    
    it('should handle API errors gracefully', async () => {
      // Make the fetch fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API connection error'));
      
      const narrativeState = createMockNarrativeState();
      
      // The service should throw a standardized error
      await expect(service.generateDecision(narrativeState, mockCharacter))
        .rejects.toHaveProperty('code', 'AI_SERVICE_ERROR');
    });
  });
  
  describe('recordDecision', () => {
    it('should record decisions for future context', async () => {
      // Record a decision
      service.recordDecision('test-decision', 'option-1', 'You chose to talk to the sheriff.');
      
      // Generate a new decision
      const narrativeState = createMockNarrativeState();
      await service.generateDecision(narrativeState, mockCharacter);
      
      // Check that history was included in the prompt
      const fetchCalls = (global.fetch as jest.Mock).mock.calls;
      expect(fetchCalls.length).toBe(1);
      
      const requestBody = JSON.parse(fetchCalls[0][1].body);
      const prompt = requestBody.messages[1].content;
      
      expect(prompt).toContain('PREVIOUS DECISIONS');
      expect(prompt).toContain('You chose to talk to the sheriff');
    });
  });
  
  describe('toPlayerDecision', () => {
    it('should convert AI decision to player decision format', async () => {
      // Generate a decision
      const narrativeState = createMockNarrativeState();
      const aiDecision = await service.generateDecision(narrativeState, mockCharacter);
      
      // Convert to player decision
      const playerDecision = service.toPlayerDecision(aiDecision, 'SALOON');
      
      // Validate the conversion
      expect(playerDecision.id).toBe('test-decision');
      expect(playerDecision.prompt).toBe('What do you want to do?');
      expect(playerDecision.options.length).toBe(2);
      expect(playerDecision.location).toBe('SALOON');
      expect(playerDecision.aiGenerated).toBe(true);
      expect(playerDecision.importance).toBe('moderate');
      
      // Check option conversions
      expect(playerDecision.options[0].id).toBe('option-1');
      expect(playerDecision.options[0].text).toBe('Talk to the sheriff');
      expect(playerDecision.options[0].impact).toBe('Diplomatic approach');
      expect(playerDecision.options[0].tags).toContain('brave');
    });
  });
});
