/* eslint-disable @typescript-eslint/no-explicit-any */
import { AIService } from '../../../services/ai/aiService';
import { InventoryItem } from '../../../types/item.types';

// Mock the getAIModel function
jest.mock('../../../utils/ai/aiConfig', () => ({
  getAIModel: jest.fn(),
}));

// Define a type for the mock model
type MockModel = {
  generateContent: jest.Mock;
};

describe('AIService', () => {
  let aiService: AIService;
  let originalModel: any;

  beforeEach(() => {
    // Create a new instance for each test
    aiService = new AIService();

    // Save the original model property to restore it later
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalModel = (aiService as any).model;
  });

  afterEach(() => {
    // Restore the original model after each test
    (aiService as unknown as { model: MockModel }).model = originalModel as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    jest.clearAllMocks();
  });

  it('should extract playerDecision from AI response', async () => {
    const mockResponse = {
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Test Town' },
      combatInitiated: false,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      playerDecision: {
        prompt: 'What will you do?',
        options: [
          { id: 'option1', text: 'Option 1', impact: 'Impact 1' },
          { id: 'option2', text: 'Option 2', impact: 'Impact 2' },
        ],
        importance: 'significant',
        context: 'Decision context',
      },
    };

    // Directly set the model property on the aiService instance
    (aiService as unknown as { model: MockModel }).model = {
      generateContent: jest.fn().mockImplementation(async () => ({
        response: {
          text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
        },
      })),
    };

    const result = await aiService.getAIResponse('Test prompt', 'Test context', []);

    // Verify the mock was called
    expect((aiService as unknown as { model: MockModel }).model.generateContent).toHaveBeenCalled();

    // Check the result
    expect(result.playerDecision).toBeDefined();
    // We don't check the exact equality because the IDs will be generated
    expect(result.playerDecision?.prompt).toEqual('What will you do?');
    expect(result.playerDecision?.importance).toEqual('significant');
    expect(result.playerDecision?.context).toEqual('Decision context');
    expect(result.playerDecision?.options.length).toEqual(2);
    expect(result.playerDecision?.options[0].text).toEqual('Option 1');
    expect(result.playerDecision?.options[1].text).toEqual('Option 2');
  });

  it('should handle AI errors', async () => {
    // Directly set the model property on the aiService instance
    (aiService as unknown as { model: MockModel }).model = {
      generateContent: jest.fn().mockImplementation(() => {
        throw new Error('Simulated API error');
      }),
    };

    // Test that the error is properly handled
    await expect(
      aiService.getAIResponse('error prompt', 'Test context', [])
    ).rejects.toThrow('Unexpected AI response error');

    // Verify the mock was called
    expect((aiService as unknown as { model: MockModel }).model.generateContent).toHaveBeenCalled();
  });

  it('should handle missing playerDecision in AI response', async () => {
    const mockResponse = {
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Test Town' },
      combatInitiated: false,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      // No playerDecision field
    };

    // Directly set the model property on the aiService instance
    (aiService as unknown as { model: MockModel }).model = {
      generateContent: jest.fn().mockImplementation(async () => ({
        response: {
          text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
        },
      })),
    };

    // Mock the parseAIResponse method to return a response without playerDecision
    jest.spyOn(aiService as any, 'parseAIResponse').mockImplementation(() => { // eslint-disable-line @typescript-eslint/no-explicit-any
      return {
        narrative: mockResponse.narrative,
        location: mockResponse.location,
        combatInitiated: mockResponse.combatInitiated,
        acquiredItems: [],
        removedItems: [],
        suggestedActions: mockResponse.suggestedActions,
        // playerDecision is intentionally omitted
      };
    });

    const result = await aiService.getAIResponse('Test prompt', 'Test context', []);

    // Verify the mock was called
    expect((aiService as unknown as { model: MockModel }).model.generateContent).toHaveBeenCalled();

    // Check that playerDecision is undefined
    expect(result.playerDecision).toBeUndefined();
  });

  it('should include playerDecision instructions in constructPrompt', async () => {
    const prompt = 'test prompt';
    const journalContext = 'test context';
    const inventory: InventoryItem[] = [];

    const fullPrompt = await aiService.testConstructPrompt(prompt, journalContext, inventory);

    expect(fullPrompt).toContain('playerDecision');
    expect(fullPrompt).toContain('"prompt": "[Question or situation requiring player decision]"');
    expect(fullPrompt).toContain('\"options\": [');
    expect(fullPrompt).toContain('\"text\": \"[Option 1 text]\"');
    expect(fullPrompt).toContain('\"impact\": \"[Description of potential impact]\"');
    expect(fullPrompt).toContain('\"importance\": \"[critical, significant, moderate, or minor]\"');
  });
});
