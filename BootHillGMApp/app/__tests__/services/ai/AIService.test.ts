import { AIService } from '../../../services/ai/aiService';
import { retryWithExponentialBackoff } from '../../../utils/retry';
import mockAIService from '../../../test/__mocks__/aiService';
jest.mock('../../../utils/aiService', () => ({
  ...mockAIService
}));

// Mock the retry utility
jest.mock('../../../utils/retry', () => ({
  retryWithExponentialBackoff: jest.fn()
}));

// Mock the GoogleGenerativeAI class
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockImplementation(() => {
        return Promise.resolve({
          response: {
            text: () => 'test'
          }
        })
      })
    })
  }))
}));

describe('AIService', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService('mock-key');
  });

  test('should generate basic response', async () => {
    const mockResponse = {
      response: {
        text: () => `
          You see a dusty saloon.
          ACQUIRED_ITEMS: []
          REMOVED_ITEMS: []
        `
      }
    };

    (retryWithExponentialBackoff as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await aiService.getResponse(
      'look around',
      'You entered the saloon',
      { inventory: [] }
    );

    expect(result.narrative).toContain('dusty saloon');
    expect(result.acquiredItems).toEqual([]);
    expect(result.removedItems).toEqual([]);
  });

  test('should handle combat initiation', async () => {
    const mockResponse = {
      response: {
        text: () => `
          A bandit draws his gun!
          COMBAT: Angry Bandit
          ACQUIRED_ITEMS: []
          REMOVED_ITEMS: []
        `
      }
    };

    (retryWithExponentialBackoff as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await aiService.getResponse(
      'attack the bandit',
      'test context',
      { inventory: [] }
    );

    expect(result.combatInitiated).toBe(true);
    expect(result.opponent).toBeDefined();
    expect(result.opponent?.name).toBe('Angry Bandit');
  });

  test('handles API errors gracefully', async () => {
    const apiError = new Error('AI service error');
    (retryWithExponentialBackoff as jest.Mock).mockRejectedValueOnce(apiError);

    await expect(aiService.getResponse(
      'test action',
      'test context',
      { inventory: [] }
    )).rejects.toThrow('AI service error');
  });
});
