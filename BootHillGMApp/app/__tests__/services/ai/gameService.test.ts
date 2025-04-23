/**
 * Tests for the AI Game Service
 * 
 * Tests the getAIResponse function which orchestrates AI response processing,
 * including prompt construction, response handling, validation, and fallback mechanisms.
 */
import { getAIResponse } from '../../../services/ai/gameService';
import { getAIModel } from '../../../utils/ai/aiConfig';
import { 
  mockGenerateContent, 
  setupGameServiceMocks, 
  mockSuccessfulAIResponse,
  mockFailedAIResponse,
} from './helpers/gameServiceTestHelpers';
import {
  mockBasicResponse,
  mockPlayerDecisionResponse,
  mockInvalidPlayerDecisionResponse,
  mockTownResponse,
  mockWildernessResponse,
  mockLandmarkResponse,
  mockUnknownResponse,
  mockCombatResponse,
  mockMissingOpponentResponse,
  mockInvalidJsonResponse,
  mockInvalidLocationResponse,
  mockLocationConsistencyResponse,
  mockWildernessDescriptionResponse,
  defaultFallbackResponse
} from './__mocks__/gameServiceMocks';

// Mock the AI config
jest.mock('../../../utils/ai/aiConfig', () => ({
  getAIModel: jest.fn(),
}));

// Set up the mock model
(getAIModel as jest.Mock).mockReturnValue({
  generateContent: mockGenerateContent,
});

describe('getAIResponse', () => {
  // Reset mocks before each test
  beforeEach(() => {
    setupGameServiceMocks();
  });

  describe('Basic Response Handling', () => {
    it('should return structured data on successful AI response', async () => {
      mockSuccessfulAIResponse(mockBasicResponse);
      
      const result = await getAIResponse('test prompt', '', []);
      
      // Assert individual properties, allowing for enhanced suggestedActions
      expect(result.narrative).toEqual(mockBasicResponse.narrative);
      expect(result.location).toEqual(mockBasicResponse.location);
      expect(result.combatInitiated).toEqual(mockBasicResponse.combatInitiated);
      expect(result.opponent).toEqual(mockBasicResponse.opponent);
      expect(result.acquiredItems).toEqual(mockBasicResponse.acquiredItems);
      expect(result.removedItems).toEqual(mockBasicResponse.removedItems);
      expect(result.suggestedActions).toBeInstanceOf(Array);
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.any(String));
    });
    
    it('should return fallback response if the AI model throws an error', async () => {
      mockFailedAIResponse(new Error('AI model error'));
      
      // Expect the promise to resolve with the fallback response, not reject
      await expect(getAIResponse('test prompt', '', [])).resolves.toEqual(defaultFallbackResponse);
    });
  });

  describe('Player Decision Handling', () => {
    it('should extract and validate playerDecision from AI response', async () => {
      mockSuccessfulAIResponse(mockPlayerDecisionResponse);
      
      const result = await getAIResponse('test prompt', '', []);
      
      expect(result.playerDecision).toBeDefined();
      expect(result.playerDecision?.prompt).toBe('What will you do?');
      expect(result.playerDecision?.options).toHaveLength(2);
      expect(result.playerDecision?.importance).toBe('significant');
    });
    
    it('should handle invalid playerDecision in AI response', async () => {
      mockSuccessfulAIResponse(mockInvalidPlayerDecisionResponse);
      
      const result = await getAIResponse('test prompt', '', []);
      
      expect(result.playerDecision).toBeUndefined();
    });
  });

  describe('Location Type Handling', () => {
    it('should handle various location types correctly', async () => {
      // Test town location
      mockSuccessfulAIResponse(mockTownResponse);
      // Assert key properties for town location
      const townResult = await getAIResponse('test', '', []);
      expect(townResult.narrative).toEqual(mockTownResponse.narrative);
      expect(townResult.location).toEqual(mockTownResponse.location);
      expect(townResult.suggestedActions).toBeInstanceOf(Array);

      // Test wilderness location
      mockSuccessfulAIResponse(mockWildernessResponse);
      // Assert key properties for wilderness location
      const wildernessResult = await getAIResponse('test', '', []);
      expect(wildernessResult.narrative).toEqual(mockWildernessResponse.narrative);
      expect(wildernessResult.location).toEqual(mockWildernessResponse.location);
      expect(wildernessResult.suggestedActions).toBeInstanceOf(Array);

      // Test landmark location
      mockSuccessfulAIResponse(mockLandmarkResponse);
      // Assert key properties for landmark location
      const landmarkResult = await getAIResponse('test', '', []);
      expect(landmarkResult.narrative).toEqual(mockLandmarkResponse.narrative);
      expect(landmarkResult.location).toEqual(mockLandmarkResponse.location);
      expect(landmarkResult.suggestedActions).toBeInstanceOf(Array);

      // Test unknown location
      mockSuccessfulAIResponse(mockUnknownResponse);
      // Assert key properties for unknown location
      const unknownResult = await getAIResponse('test', '', []);
      expect(unknownResult.narrative).toEqual(mockUnknownResponse.narrative);
      expect(unknownResult.location).toEqual(mockUnknownResponse.location);
      expect(unknownResult.suggestedActions).toBeInstanceOf(Array);
    });
    
    it('should return fallback response for invalid location type', async () => {
      mockSuccessfulAIResponse(mockInvalidLocationResponse);
      
      // Expect the fallback response
      await expect(getAIResponse('test', '', [])).resolves.toEqual(defaultFallbackResponse);
    });
    
    it('should maintain location consistency between narrative and location object', async () => {
      mockSuccessfulAIResponse(mockLocationConsistencyResponse);
      
      const result = await getAIResponse('test', '', []);
      expect(result.location.type).toBe('town');
      expect((result.location as { type: 'town'; name: string }).name).toBe('Redemption');
      expect(result.narrative).toContain('Redemption'); // Check for town name specifically
    });
    
    it('should provide detailed wilderness descriptions', async () => {
      mockSuccessfulAIResponse(mockWildernessDescriptionResponse);
      
      const result = await getAIResponse('test', '', []);
      expect(result.location.type).toBe('wilderness');
      if (result.location.type === 'wilderness') {
        expect(result.location.description).toBe('Rolling hills dotted with scrub brush and cacti');
        expect(result.narrative).toBe('You trek through rolling hills dotted with scrub brush and cacti.'); // Exact match
      }
    });
  });

  describe('Combat Handling', () => {
    it('should handle combat initiation correctly', async () => {
      mockSuccessfulAIResponse(mockCombatResponse);
      
      const result = await getAIResponse('test', '', []);
      // Assert key properties for combat initiation
      expect(result.narrative).toEqual(mockCombatResponse.narrative);
      expect(result.location).toEqual(mockCombatResponse.location);
      expect(result.combatInitiated).toBe(true); // Keep this specific check
      expect(result.opponent).toBeDefined(); // Keep this specific check
      expect(result.opponent!.name).toBe('Bandit'); // Keep this specific check
      expect(result.suggestedActions).toBeInstanceOf(Array);
      expect(result.combatInitiated).toBe(true);
      expect(result.opponent).toBeDefined();
      expect(result.opponent!.name).toBe('Bandit');
    });
    
    it('should handle missing opponent when combatInitiated is false', async () => {
      mockSuccessfulAIResponse(mockMissingOpponentResponse);
      
      const result = await getAIResponse('test', '', []);
      expect(result.combatInitiated).toBe(false);
      expect(result.opponent).toBe(null); // Should be explicitly null
    });
  });

  describe('Error Handling', () => {
    it('should return fallback response for invalid JSON structure', async () => {
      // Using 'as any' to pass intentionally malformed JSON data for error handling test.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockSuccessfulAIResponse(mockInvalidJsonResponse as any);
      
      // Expect the fallback response
      await expect(getAIResponse('test prompt', '', [])).resolves.toEqual(defaultFallbackResponse);
    });
  });
});