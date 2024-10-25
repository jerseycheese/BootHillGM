import { AIService } from '../../../services/ai/aiService';
import { InventoryItem } from '../../../types/inventory';
import { retryWithExponentialBackoff } from '../../../utils/retry';

// Mock the retry utility
jest.mock('../../../utils/retry', () => ({
  retryWithExponentialBackoff: jest.fn()
}));

// Mock the GoogleGenerativeAI class
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn()
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

  test('should handle inventory changes', async () => {
    const mockResponse = {
      response: {
        text: () => `
          You found some items.
          ACQUIRED_ITEMS: [Gun, Bullets]
          REMOVED_ITEMS: [Money]
        `
      }
    };

    (retryWithExponentialBackoff as jest.Mock).mockResolvedValueOnce(mockResponse);

    const inventory: InventoryItem[] = [
      { id: 'money-1', name: 'Money', quantity: 1, description: 'Some coins' }
    ];

    const result = await aiService.getResponse(
      'search for items',
      'test context',
      { inventory }
    );

    expect(result.acquiredItems).toEqual(['Gun', 'Bullets']);
    expect(result.removedItems).toEqual(['Money']);
  });

  test('should generate narrative summary', async () => {
    const mockResponse = {
      response: {
        text: () => 'A concise summary of the action'
      }
    };

    (retryWithExponentialBackoff as jest.Mock).mockResolvedValueOnce(mockResponse);

    const summary = await aiService.generateNarrativeSummary(
      'draw gun',
      'Player is in a saloon'
    );

    expect(summary).toBe('A concise summary of the action');
  });

  test('should handle API errors gracefully', async () => {
    const apiError = new Error('API Error');
    (retryWithExponentialBackoff as jest.Mock).mockRejectedValueOnce(apiError);

    await expect(aiService.getResponse(
      'test action',
      'test context',
      { inventory: [] }
    )).rejects.toThrow('API Error');
  });

  test('should handle location changes', async () => {
    const mockResponse = {
      response: {
        text: () => `
          You walk into the saloon.
          LOCATION: Dusty Saloon
          ACQUIRED_ITEMS: []
          REMOVED_ITEMS: []
        `
      }
    };

    (retryWithExponentialBackoff as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await aiService.getResponse(
      'enter saloon',
      'test context',
      { inventory: [] }
    );

    expect(result.location).toBe('Dusty Saloon');
  });
});
