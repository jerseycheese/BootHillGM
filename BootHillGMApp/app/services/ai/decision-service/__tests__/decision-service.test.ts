import { DecisionService } from '..';
import { _NarrativeDecisionDetector } from '../decision-detector';
import { _AIDecisionGenerator } from '../decision-generator';
import { _DecisionHistoryService } from '../decision-history';
import { _AIServiceClient } from '../ai-client';
import { NarrativeState } from '../../../../types/narrative.types';
import { Character } from '../../../../types/character';
import { _processResponse, _validateDecision } from '../../../../utils/prompt-utils';

// Define detector type to avoid using 'any'
interface DecisionDetector {
  updateLastDecisionTime: () => void;
}

// Mock fetch globally
global.fetch = jest.fn();
// Mock AbortSignal.timeout
global.AbortSignal.timeout = jest.fn().mockReturnValue({});

// Mock data for testing
const mockNarrativeState: NarrativeState = {
  currentStoryPoint: {
    id: 'test-story-point',
    content: 'The sheriff eyes you suspiciously as you enter the saloon.',
    type: 'narrative',
    locationChange: 'SALOON'
  },
  narrativeHistory: [
    'You arrived in town on a dusty afternoon.',
    'The locals seem wary of strangers these days.'
  ],
  narrativeContext: {
    worldContext: 'There have been several robberies in town recently.'
  }
};

const mockCharacter: Character = {
  id: 'player-1',
  name: 'Buck Wilde',
  isNPC: false,
  attributes: {
    bravery: 9,
    speed: 7,
    gunAccuracy: 8
  }
};

// Mock API response
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
            importance: 'significant'
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
    
    // Setup fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
      headers: new Headers({
        'X-RateLimit-Remaining': '10',
        'X-RateLimit-Reset': '1600000000'
      })
    });
    
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
    it('should detect when a decision point is appropriate', () => {
      // Use a narrative state with content that should trigger a decision
      const state = {
        ...mockNarrativeState,
        currentStoryPoint: {
          ...mockNarrativeState.currentStoryPoint,
          content: 'The sheriff asks "What brings you to town, stranger?" as he eyes you suspiciously.',
          type: 'dialogue'
        }
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
      
      // Create detector instance directly to control timing - using proper typing
      const detector = (intervalService as unknown as { detector: DecisionDetector }).detector;
      
      // Manually set the last decision time to now
      detector.updateLastDecisionTime();
      
      // Run the detection again - should fail due to timing
      const narrativeState = mockNarrativeState;
      const result = intervalService.detectDecisionPoint(narrativeState, mockCharacter);
      
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
      
      const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe('https://test-endpoint.com');
      
      const body = JSON.parse(options.body);
      expect(body.model).toBe('test-model');
      expect(body.messages[1].content).toContain('NARRATIVE CONTEXT');
      expect(body.messages[1].content).toContain('CHARACTER INFORMATION');
      expect(body.messages[1].content).toContain('GAME STATE');
    });
    
    it('should handle API errors gracefully', async () => {
      // Make the fetch fail
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API connection error'));
      
      await expect(service.generateDecision(mockNarrativeState, mockCharacter))
        .rejects.toEqual(expect.objectContaining({
          code: 'AI_SERVICE_ERROR',
          message: 'API connection error'
        }));
    });
  });
  
  describe('toPlayerDecision', () => {
    it('should convert AI decision to player decision format', async () => {
      const aiDecision = await service.generateDecision(mockNarrativeState, mockCharacter);
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
    });
  });
  
  describe('recordDecision', () => {
    it('should record decisions and include them in future prompts', async () => {
      // Record a decision
      service.recordDecision('decision-1', 'option-1', 'You greeted the sheriff politely.');
      
      // Generate a new decision after recording
      await service.generateDecision(mockNarrativeState, mockCharacter);
      
      // Check that the fetch was called with previous decision included
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const options = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(options.body);
      
      expect(body.messages[1].content).toContain('PREVIOUS DECISIONS');
      expect(body.messages[1].content).toContain('You greeted the sheriff politely');
    });
  });
});
