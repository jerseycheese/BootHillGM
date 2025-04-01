/**
 * Tests for the Decision Service
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import DecisionService from '../../../services/ai/decision-service';
import { NarrativeState, NarrativeDisplayMode, StoryPoint } from '../../../types/narrative.types';
import { Character } from '../../../types/character';
import { LocationType } from '../../../services/locationService';
import { DecisionImportance } from '../../../types/narrative/decision.types';
import { FetchMockProperties, AbortSignalTimeoutMock } from '../../../types/testing/test-types';

// Mock fetch globally with proper typing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
// Mock AbortSignal.timeout
global.AbortSignal.timeout = jest.fn().mockReturnValue({}) as AbortSignalTimeoutMock;

// Add debug properties to fetch mock for error testing
(global.fetch as unknown as { _mockImplementationCallCount: number })._mockImplementationCallCount = 0;
(global.fetch as unknown as { _mockRejectedValueOnce: boolean })._mockRejectedValueOnce = false;

// Define a proper StoryPoint object first to ensure correct types
const testStoryPoint: StoryPoint = {
  id: 'test-story-point',
  title: 'Saloon Entrance',
  content: 'The sheriff eyes you suspiciously as you enter the saloon.',
  type: 'narrative',
  locationChange: 'SALOON' as unknown as LocationType
};

// Create mock narrative state using the properly typed StoryPoint
const mockNarrativeState: NarrativeState = {
  currentStoryPoint: testStoryPoint,
  narrativeHistory: [
    'You arrived in town on a dusty afternoon.',
    'The locals seem wary of strangers these days.'
  ],
  narrativeContext: {
    worldContext: 'There have been several robberies in town recently.',
    characterFocus: [],
    themes: [],
    importantEvents: [],
    storyPoints: {},
    narrativeArcs: {},
    impactState: {
      reputationImpacts: {},
      relationshipImpacts: {},
      worldStateImpacts: {},
      storyArcImpacts: {},
      lastUpdated: 0
    },
    narrativeBranches: {},
    pendingDecisions: [],
    decisionHistory: []
  },
  visitedPoints: [],
  availableChoices: [],
  displayMode: 'standard' as NarrativeDisplayMode
};

// Mock character with all required attributes
const mockCharacter: Character = {
  id: 'player-1',
  name: 'Buck Wilde',
  isNPC: false,
  isPlayer: true,
  inventory: { items: [] },
  attributes: {
    bravery: 9,
    speed: 7,
    gunAccuracy: 8,
    throwingAccuracy: 5,
    strength: 7,
    baseStrength: 7,
    experience: 0
  },
  minAttributes: {
    bravery: 0,
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    baseStrength: 0,
    experience: 0
  },
  maxAttributes: {
    bravery: 10,
    speed: 10,
    gunAccuracy: 10,
    throwingAccuracy: 10,
    strength: 10,
    baseStrength: 10,
    experience: 10
  },
  wounds: [],
  isUnconscious: false
};

// Mock API response with proper importance and pacing types
const mockApiResponse = {
  choices: [
    {
      message: {
        content: JSON.stringify({
          decisionId: 'decision-123',
          prompt: 'How do you respond to the sheriff?',
          options: [
            {
              id: 'option-1',
              text: 'Tip your hat and smile',
              confidence: 0.9,
              traits: ['friendly', 'calm'],
              potentialOutcomes: ['Might ease tensions', 'Sheriff could warm up to you'],
              impact: 'Establish yourself as non-threatening'
            },
            {
              id: 'option-2',
              text: 'Ignore him and head to the bar',
              confidence: 0.7,
              traits: ['independent', 'aloof'],
              potentialOutcomes: ['Might appear suspicious', 'Sheriff could watch you closely'],
              impact: 'Establish yourself as independent but possibly suspicious'
            }
          ],
          relevanceScore: 0.85,
          metadata: {
            narrativeImpact: 'Sets the tone for town interactions',
            themeAlignment: 'Classic western standoff tension',
            pacing: 'medium',
            importance: 'significant' // Use valid importance value
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
    
    // Reset counter for tracking mock implementation calls
    (global.fetch as unknown as FetchMockProperties)._mockImplementationCallCount = 0;
    (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = false;
    
    // Setup fetch mock with proper typing
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
      headers: new Headers({
        'X-RateLimit-Remaining': '10',
        'X-RateLimit-Reset': '1600000000'
      })
    } as Response);
    
    // Initialize service with test configuration
    service = new DecisionService({
      minDecisionInterval: 0, // No delay for testing
      relevanceThreshold: 0.3,
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
      // Create a properly typed story point with dialogue type
      const dialogueStoryPoint: StoryPoint = {
        id: 'dialogue-point',
        title: 'Sheriff Question',
        content: 'The sheriff asks "What brings you to town, stranger?" as he eyes you suspiciously.',
        type: 'dialogue',
        locationChange: 'SALOON' as unknown as LocationType
      };
      
      // Create state with the properly typed story point
      const state: NarrativeState = {
        ...mockNarrativeState,
        currentStoryPoint: dialogueStoryPoint
      };
      
      const result = service.detectDecisionPoint(state, mockCharacter);
      
      expect(result.shouldPresent).toBe(true);
      expect(result.score).toBeGreaterThan(0.3);
      expect(result.reason).toContain('Narrative context indicates decision point');
    });
    
    it('should respect minimum decision interval', () => {
      // Create service with a longer interval
      const intervalService = new DecisionService({
        minDecisionInterval: 60000, // 1 minute
        relevanceThreshold: 0.3
      });
      
      // Set the last decision time manually
      intervalService.lastDecisionTime = Date.now();
      
      // Run the detection again - should fail due to timing
      const result = intervalService.detectDecisionPoint(mockNarrativeState, mockCharacter);
      
      expect(result.shouldPresent).toBe(false);
      expect(result.reason).toContain('Too soon since last decision');
    });
  });
  
  describe('generateDecision', () => {
    it('should generate a valid decision', async () => {
      const decision = await service.generateDecision(mockNarrativeState, mockCharacter);
      
      expect(decision.decisionId).toBe('decision-123');
      expect(decision.options.length).toBe(2);
      expect(decision.prompt).toBe('How do you respond to the sheriff?');
      expect(decision.relevanceScore).toBe(0.85);
      expect(decision.metadata.importance).toBe('significant');
    });
    
    it('should call the AI service with the correct prompt', async () => {
      await service.generateDecision(mockNarrativeState, mockCharacter);
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      const [url, requestOptions] = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      expect(url).toBe('https://test-endpoint.com');
      
      if (requestOptions && requestOptions.body) {
        const body = JSON.parse(requestOptions.body as string);
        expect(body.model).toBe('test-model');
        expect(body.messages[1].content).toContain('NARRATIVE CONTEXT');
        expect(body.messages[1].content).toContain('CHARACTER INFORMATION');
        expect(body.messages[1].content).toContain('GAME STATE');
      }
    });
    
    it('should handle API errors gracefully', async () => {
      
      // Set flag to indicate this is the API error test
      (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = true;
      
      // Mock the fetch to throw the specific error
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('API connection error')
      );
      
      console.log('[TEST] Mock setup complete, calling generateDecision...');
      
      try {
        await service.generateDecision(mockNarrativeState, mockCharacter);
        console.log('[TEST] Failed: generateDecision did not throw an error');
        // If we get here without error, fail the test
        expect(true).toBe(false); // This will fail the test if no error is thrown
      } catch (error) {
        console.log('[TEST] Caught error:', error);
        // Type assertion to access properties safely
        const serviceError = error as {code: string; message: string; retryable: boolean};
        console.log('[TEST] Error code:', serviceError.code);
        console.log('[TEST] Error message:', serviceError.message);
        expect(serviceError.code).toBe('AI_SERVICE_ERROR');
        expect(serviceError.message).toBe('API connection error');
      }
    });
  });
  
  describe('toPlayerDecision', () => {
    it('should convert AI decision to player decision format', async () => {
      // Mock a specific decision response for this test with proper types
      const aiDecision = {
        decisionId: 'decision-123',
        prompt: 'How do you respond to the sheriff?',
        options: [
          {
            id: 'option-1',
            text: 'Tip your hat and smile',
            confidence: 0.9,
            traits: ['friendly', 'calm'],
            potentialOutcomes: ['Might ease tensions', 'Sheriff could warm up to you'],
            impact: 'Establish yourself as non-threatening'
          },
          {
            id: 'option-2',
            text: 'Ignore him and head to the bar',
            confidence: 0.7,
            traits: ['independent', 'aloof'],
            potentialOutcomes: ['Might appear suspicious', 'Sheriff could watch you closely'],
            impact: 'Establish yourself as independent but possibly suspicious'
          }
        ],
        relevanceScore: 0.85,
        metadata: {
          narrativeImpact: 'Sets the tone for town interactions',
          themeAlignment: 'Classic western standoff tension',
          pacing: 'medium' as const,
          importance: 'significant' as DecisionImportance // Type assertion for valid importance
        }
      };
      
      const playerDecision = service.toPlayerDecision(aiDecision, 'SALOON');
      
      expect(playerDecision.id).toBe('decision-123');
      expect(playerDecision.prompt).toBe('How do you respond to the sheriff?');
      expect(playerDecision.options).toHaveLength(2);
      expect(playerDecision.options[0].id).toBe('option-1');
      expect(playerDecision.options[0].text).toBe('Tip your hat and smile');
      expect(playerDecision.options[0].tags).toContain('friendly');
      expect(playerDecision.location).toBe('SALOON');
      expect(playerDecision.importance).toBe('significant');
      expect(playerDecision.aiGenerated).toBe(true);
      expect(playerDecision.timestamp).toBeDefined();
    });
  });
  
  describe('recordDecision', () => {
    it('should record decisions and include them in future prompts', async () => {
      // Important: We need to reset the fetch mock for each test case
      (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      } as Response);
      
      // Record a decision
      service.recordDecision('decision-1', 'option-1', 'You greeted the sheriff politely.');
      
      // Generate a new decision after recording
      await service.generateDecision(mockNarrativeState, mockCharacter);
      
      // Check that the fetch was called with previous decision included
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const requestOptions = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0][1];
      
      if (requestOptions && requestOptions.body) {
        const body = JSON.parse(requestOptions.body as string);
        const prompt = body.messages[1].content;
        
        expect(prompt).toContain('PREVIOUS DECISIONS');
        expect(prompt).toContain('You greeted the sheriff politely');
      }
    });
  });
});