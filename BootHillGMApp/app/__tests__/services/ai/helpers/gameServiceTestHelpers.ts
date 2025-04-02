/**
 * Test helpers for the AI Game Service
 * 
 * Provides utility functions for mocking AI responses, setting up test environments,
 * and creating expected response objects for test assertions.
 */
import { GenerateContentResult } from '@google/generative-ai';
import { getAIModel } from '../../../../utils/ai/aiConfig';
import { GameServiceResponse } from '../../../../services/ai/types/gameService.types';
import { successPathDefaultActions } from '../__mocks__/gameServiceMocks';

// Re-export the mock function for cleaner imports
export const mockGenerateContent = jest.fn();

/**
 * Setup the mocks before each test
 * 
 * Resets mock functions and configures the AI model mock
 * to return a controlled generate content function.
 */
export function setupGameServiceMocks() {
  // Reset the mock functions
  mockGenerateContent.mockReset();
  (getAIModel as jest.Mock).mockReturnValue({
    generateContent: mockGenerateContent,
  });
}

/**
 * Helper to mock a successful AI response
 * 
 * Configures the generateContent mock to resolve with a JSON
 * response matching the provided data.
 * 
 * @param responseData The data to include in the response
 */
export function mockSuccessfulAIResponse(responseData: Partial<GameServiceResponse>) {
  mockGenerateContent.mockResolvedValueOnce({
    response: {
      text: () => Promise.resolve(JSON.stringify(responseData)),
    },
  } as unknown as GenerateContentResult);
}

/**
 * Helper to mock an AI response that fails with an error
 * 
 * Configures the generateContent mock to reject with the provided error.
 * Used to test error handling paths.
 * 
 * @param error The error to throw
 */
export function mockFailedAIResponse(error: Error) {
  mockGenerateContent.mockRejectedValueOnce(error);
}

/**
 * Helper to create expected response with default suggestedActions
 * 
 * Takes a partial GameServiceResponse and ensures that suggestedActions
 * follows the expected pattern (using defaults when empty).
 * 
 * @param responseData Base response data
 * @returns Complete response with default actions if needed
 */
export function createExpectedResponse(responseData: Partial<GameServiceResponse>): GameServiceResponse {
  return {
    ...responseData,
    suggestedActions: responseData.suggestedActions && responseData.suggestedActions.length > 0 
      ? responseData.suggestedActions 
      : successPathDefaultActions
  } as GameServiceResponse;
}