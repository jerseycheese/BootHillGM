/**
 * Centralized mock for AIService
 * 
 * This mock implements the AIService interface for testing purposes.
 * It provides consistent mock implementations across all tests.
 */
import { AIService } from '../../../services/ai/aiService';
import { GameServiceResponse } from '../../../services/ai/types/gameService.types';
import { Character } from '../../../types/character';

/**
 * Type definition for the mocked AIService
 * Using an interface helps with TypeScript type checking
 */
export interface MockedAIService {
  generateNarrativeSummary: jest.Mock<Promise<string>, [string, string?]>;
  generateGameContent: jest.Mock<Promise<GameServiceResponse>, [Character | null]>;
  isRequestInProgress: jest.Mock<boolean, []>;
  getLastRequestTimestamp: jest.Mock<number, []>;
  reset?: jest.Mock<void, []>;
}

/**
 * Creates a mocked AIService with default implementations
 * All mock methods can be customized after creation
 */
export const createMockAIService = (): MockedAIService => {
  return {
    generateNarrativeSummary: jest.fn<Promise<string>, [string, string?]>()
      .mockResolvedValue('Mocked summary'),
    
    generateGameContent: jest.fn<Promise<GameServiceResponse>, [Character | null]>()
      .mockResolvedValue({
        narrative: 'Mocked narrative content',
        location: { 
          type: 'town',
          name: 'Boot Hill'
        },
        acquiredItems: [],
        removedItems: [],
        suggestedActions: [
          {
            id: 'mock-action-1',
            title: 'Mocked action',
            description: 'A mocked action for testing',
            type: 'optional'
          }
        ],
        opponent: null
      }),
    
    isRequestInProgress: jest.fn<boolean, []>().mockReturnValue(false),
    
    getLastRequestTimestamp: jest.fn<number, []>().mockReturnValue(Date.now()),
    
    reset: jest.fn<void, []>()
  };
};

/**
 * Helper function to create a typed AIService mock
 * This is useful when you need to pass a mock to a function that expects AIService
 */
export const createTypedMockAIService = (): jest.Mocked<AIService> => {
  return createMockAIService() as unknown as jest.Mocked<AIService>;
};
