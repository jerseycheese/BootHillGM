import { AIService } from '../../../services/ai/aiService';
import { retryWithExponentialBackoff } from '../../../utils/retry';

// Mock the retry utility
jest.mock('../../../utils/retry', () => ({
  retryWithExponentialBackoff: jest.fn()
}));

// Mock the GoogleGenerativeAI class
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({ response: { text: () => 'AI response' } }),
    })
  }))
}));

describe('AIService', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  test('should generate basic response', async () => {
    const mockResponse = {
      response: {
        text: () => `
          You see a dusty saloon.
          ACQUIRED_ITEMS: []
          REMOVED_ITEMS: []
          SUGGESTED_ACTIONS: [{"text": "Look around", "type": "basic", "context": "Observe your surroundings"}, {"text": "Ready weapon", "type": "combat", "context": "Prepare for combat"}, {"text": "Talk to someone", "type": "interaction", "context": "Interact with others"}, {"text": "Do something unpredictable", "type": "chaotic", "context": "Take a risky action"}]
        `
      }
    };

    (retryWithExponentialBackoff as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await aiService.getAIResponse(
      'look around',
      'You entered the saloon',
      []
    );

    expect(result.narrative).toContain('dusty saloon');
    expect(result.acquiredItems).toEqual([]);
    expect(result.removedItems).toEqual([]);
    expect(result.suggestedActions).toBeDefined();
  });

  test('should handle combat initiation', async () => {
    const mockResponse = {
      response: {
        text: () => `
          A bandit draws his gun!
          COMBAT: Angry Bandit
        `
      }
    };

    (retryWithExponentialBackoff as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await aiService.getAIResponse(
      'attack the bandit',
      'test context',
      []
    );

    expect(result.combatInitiated).toBe(true);
    expect(result.opponent).toBeDefined();
    expect(result.opponent?.name).toBe('Angry Bandit');
    expect(result.suggestedActions).toBeDefined();
  });

  test('handles API errors gracefully', async () => {
    const apiError = new Error('AI service error');
    (retryWithExponentialBackoff as jest.Mock).mockRejectedValueOnce(apiError);

    await expect(aiService.getAIResponse(
      'test action',
      'test context',
      []
    )).rejects.toThrow('Unexpected AI response error');
  });
});
