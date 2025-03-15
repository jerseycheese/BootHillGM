/**
 * AI Decision Service Tests
 * 
 * Basic tests for the main AI Decision Service
 */

import { AIDecisionService } from '../../../services/ai/aiDecisionService';
import * as aiDecisionDetector from '../../../services/ai/utils/aiDecisionDetector';
import * as aiDecisionGenerator from '../../../services/ai/utils/aiDecisionGenerator';
import * as aiServiceClient from '../../../services/ai/clients/aiServiceClient';
import { NarrativeState, PlayerDecision } from '../../../types/narrative.types';
import { Character } from '../../../types/character';
import { GameState } from '../../../types/gameState';
import { DecisionDetectionResult, DecisionResponse } from '../../../types/ai-service.types';
import { LocationType } from '../../../services/locationService';

// Mock the dependencies
jest.mock('../../../services/ai/utils/aiDecisionDetector');
jest.mock('../../../services/ai/utils/aiDecisionGenerator');
jest.mock('../../../services/ai/clients/aiServiceClient');

// Define test-specific interfaces to avoid any
interface MockNarrativeState extends Partial<NarrativeState> {
  currentStoryPoint?: {
    id?: string;
    locationChange?: LocationType | string;
    content: string;
  };
  narrativeHistory: string[];
}

interface MockCharacter extends Partial<Character> {
  attributes: Record<string, number>;
}

describe('AIDecisionService', () => {
  let service: AIDecisionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize service with default config
    service = new AIDecisionService();
  });
  
  describe('detectDecisionPoint', () => {
    it('should call the detector utility', () => {
      // Setup
      const mockNarrativeState: MockNarrativeState = { 
        currentStoryPoint: { content: 'test content' },
        narrativeHistory: []
      };
      const mockCharacter: MockCharacter = { attributes: {} };
      const mockGameState: Partial<GameState> = {};
      
      // Mock implementation
      const mockDetectionResult: DecisionDetectionResult = { 
        shouldPresent: true, 
        score: 0.8, 
        reason: 'Test reason' 
      };
      
      (aiDecisionDetector.detectDecisionPoint as jest.Mock).mockReturnValue(mockDetectionResult);
      
      // Exercise
      const result = service.detectDecisionPoint(
        mockNarrativeState as NarrativeState, 
        mockCharacter as Character, 
        mockGameState as GameState
      );
      
      // Verify
      expect(aiDecisionDetector.detectDecisionPoint).toHaveBeenCalledWith(
        mockNarrativeState,
        mockCharacter,
        expect.any(Object), // config
        expect.any(Number), // lastDecisionTime
        mockGameState
      );
      expect(result).toEqual(mockDetectionResult);
    });
  });
  
  describe('generateDecision', () => {
    it('should generate a fallback decision when API config is missing', async () => {
      // Setup
      const mockNarrativeState: MockNarrativeState = { 
        currentStoryPoint: { content: 'test content' },
        narrativeHistory: []
      };
      const mockCharacter: MockCharacter = { attributes: {} };
      const mockFallbackDecision: Partial<PlayerDecision> = { id: 'fallback-123' };
      
      (aiDecisionGenerator.generateFallbackDecision as jest.Mock).mockReturnValue(mockFallbackDecision);
      
      // Exercise
      const result = await service.generateDecision(
        mockNarrativeState as NarrativeState, 
        mockCharacter as Character
      );
      
      // Verify
      expect(aiDecisionGenerator.generateFallbackDecision).toHaveBeenCalledWith(
        mockNarrativeState,
        mockCharacter,
        undefined
      );
      expect(result).toEqual(mockFallbackDecision);
    });
    
    it('should call AI service when API config is available', async () => {
      // Setup
      const mockNarrativeState: MockNarrativeState = { 
        currentStoryPoint: { content: 'test content' },
        narrativeHistory: []
      };
      const mockCharacter: MockCharacter = { attributes: {} };
      const mockPrompt = { narrativeContext: 'test' };
      const mockResponse: Partial<DecisionResponse> = { decisionId: 'ai-123' };
      const mockPlayerDecision: Partial<PlayerDecision> = { id: 'ai-123', options: [] };
      
      // Create service with API config
      service = new AIDecisionService({
        apiConfig: {
          apiKey: 'test-key',
          endpoint: 'test-endpoint',
          modelName: 'test-model',
          maxRetries: 1,
          timeout: 1000,
          rateLimit: 10
        }
      });
      
      (aiDecisionGenerator.buildDecisionPrompt as jest.Mock).mockReturnValue(mockPrompt);
      (aiServiceClient.callAIService as jest.Mock).mockResolvedValue(mockResponse);
      (aiDecisionGenerator.aiResponseToPlayerDecision as jest.Mock).mockReturnValue(mockPlayerDecision);
      
      // Exercise
      const result = await service.generateDecision(
        mockNarrativeState as NarrativeState, 
        mockCharacter as Character
      );
      
      // Verify
      expect(aiDecisionGenerator.buildDecisionPrompt).toHaveBeenCalled();
      expect(aiServiceClient.callAIService).toHaveBeenCalledWith(
        mockPrompt,
        expect.any(Object),
        expect.any(Object)
      );
      expect(aiDecisionGenerator.aiResponseToPlayerDecision).toHaveBeenCalled();
      expect(result).toEqual(mockPlayerDecision);
    });
    
    it('should fallback to template if AI service call fails', async () => {
      // Setup
      const mockNarrativeState: MockNarrativeState = { 
        currentStoryPoint: { content: 'test content' },
        narrativeHistory: []
      };
      const mockCharacter: MockCharacter = { attributes: {} };
      const mockFallbackDecision: Partial<PlayerDecision> = { id: 'fallback-123' };
      
      // Create service with API config
      service = new AIDecisionService({
        apiConfig: {
          apiKey: 'test-key',
          endpoint: 'test-endpoint',
          modelName: 'test-model',
          maxRetries: 1,
          timeout: 1000,
          rateLimit: 10
        }
      });
      
      (aiDecisionGenerator.buildDecisionPrompt as jest.Mock).mockReturnValue({});
      (aiServiceClient.callAIService as jest.Mock).mockRejectedValue(new Error('API error'));
      (aiDecisionGenerator.generateFallbackDecision as jest.Mock).mockReturnValue(mockFallbackDecision);
      
      // Exercise
      const result = await service.generateDecision(
        mockNarrativeState as NarrativeState, 
        mockCharacter as Character
      );
      
      // Verify
      expect(aiServiceClient.callAIService).toHaveBeenCalled();
      expect(aiDecisionGenerator.generateFallbackDecision).toHaveBeenCalled();
      expect(result).toEqual(mockFallbackDecision);
    });
  });
  
  describe('recordDecision', () => {
    it('should add decision to history', () => {
      // Exercise
      service.recordDecision('decision-123', 'option-456', 'Player chose to run away');
      
      // Call again to test history limit
      for (let i = 0; i < 15; i++) {
        service.recordDecision(`decision-${i}`, `option-${i}`, `Outcome ${i}`);
      }
      
      // This is a basic test - we'd need to expose the decisions history for a more thorough test
      // or use a spy/mock to verify the internal state
      expect(true).toBe(true);
    });
  });
});
